from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy  # type: ignore
from sqlalchemy import text  # type: ignore  # Import the text function
import joblib
import pandas as pd
import os
import logging  # Import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Database configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://postgres:emping@localhost:5432/price_prediction'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)

# Define the PricePrediction model
class PricePrediction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    crop = db.Column(db.String(50), nullable=False)
    date = db.Column(db.Date, nullable=False)
    wholesale_price = db.Column(db.Numeric, nullable=False)
    retail_price = db.Column(db.Numeric, nullable=False)
    landing_price = db.Column(db.Numeric, nullable=False)

# Function to load models dynamically
def load_model(file_name):
    try:
        model = joblib.load(file_name)
        print(f"Model '{file_name}' loaded successfully.")
        return model
    except Exception as e:
        print(f"Error loading model '{file_name}': {e}")
        return None

# Load models for each commodity (both linear regression and polynomial models)
models = {
    "Gabi": {
        "retail": load_model('model_gabi (bisol)_retail.pkl'),
        "poly": load_model('poly_gabi (bisol)_retail.pkl')
    },
    "Kamote": {
        "retail": load_model('model_kamote_retail.pkl'),
        "poly": load_model('poly_kamote_retail.pkl')
    },
    "Karlang": {
        "retail": load_model('model_karlang_retail.pkl'),
        "poly": load_model('poly_karlang_retail.pkl')
    },
    "Cassava": {
        "retail": load_model('model_cassava_retail.pkl'),
        "poly": load_model('poly_cassava_retail.pkl')
    }
}

@app.route('/')
def home():
    return "Welcome to the Price Prediction API!"

# Load the CSV file (ensure the path is correct)
try:
    data = pd.read_csv('data/Crop_IPT.csv', parse_dates=['Date'])  # Ensure 'Date' is parsed as datetime
    logging.info("CSV file loaded successfully.")
except Exception as e:
    logging.error(f"Error loading CSV file: {e}")
    data = pd.DataFrame()  # Initialize data as an empty DataFrame in case of error

@app.route('/crop-stats', methods=['GET'])
def crop_stats():
    crop = request.args.get('crop')
    if not crop:
        return jsonify({"error": "Crop parameter is required."}), 400

    # Filter the data for the selected crop
    crop_data = data[data['Commodity'].str.contains(crop, case=False)]  # Case insensitive match

    # Get the last week's data (assuming 'Date' is in datetime format)
    last_week_data = crop_data[crop_data['Date'] >= (pd.to_datetime('today') - pd.DateOffset(weeks=1))]

    # Select only the 'Date' and 'Retail' columns
    result = last_week_data[['Date', 'Retail']].to_dict(orient='records')

    return jsonify(result)

@app.route('/test_db', methods=['GET'])
def test_db_connection():
    try:
        # Attempt a simple query to check the connection
        db.session.execute(text('SELECT 1'))  # Use text() to declare the SQL expression
        return jsonify({"message": "Database connection is successful!"}), 200
    except Exception as e:
        return jsonify({"error": f"Database connection failed: {str(e)}"}), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        app.logger.info("Received data: %s", data)

        commodity = data.get("commodity")
        week_number = data.get("week")  # Expecting week number instead of date

        if not commodity or week_number is None:
            return jsonify({"error": "Invalid input. Commodity and week are required."}), 400

        # Validate commodity
        if commodity not in models:
            return jsonify({"error": f"Invalid commodity: {commodity}"}), 400

        # Prepare features (only the 'Week' feature is used in the model)
        features = pd.DataFrame({
            'Week': [week_number]  # Use only the week number as the feature
        })

        # Get the models for the commodity
        commodity_models = models[commodity]
        model = commodity_models["retail"]  # Corrected line
        poly = commodity_models["poly"]

        # Prepare a list to store the predictions
        predictions = []

        # Loop through the next 4 weeks
        for i in range(4):
            # Update the week number for the next prediction
            current_week = week_number + i
            features['Week'] = [current_week]

            # Transform the features using the polynomial model
            features_poly = poly.transform(features)

            # Make predictions using the linear regression model
            retail_pred = model.predict(features_poly)[0]

            # Format the result to 2 decimal places
            retail_pred = "{:.2f}".format(retail_pred)

            predictions.append({
                'week': current_week,
                'retail_prediction': retail_pred
            })

        return jsonify({
            'predictions': predictions
        })

    except Exception as e:
        app.logger.error("Error in prediction: %s", str(e))
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    db.create_all()  # Create database tables if they don't exist
    app.run(debug=True)
