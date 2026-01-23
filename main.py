"""
Looker Extension PoC - Predictive Model Backend
This Flask application serves a simple predictive model via Cloud Run
"""

import os
import json
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.preprocessing import StandardScaler

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Global model and scaler
model = None
scaler = None


def load_or_train_model():
    """
    Load or train a simple predictive model.
    In production, this would load a pre-trained model from Cloud Storage.
    """
    global model, scaler
    
    try:
        # For this PoC, we'll train a simple model on synthetic data
        # In production, load from: gs://your-bucket/model.joblib
        
        # Create synthetic training data
        X_train = np.random.randn(100, 5) * 10
        y_train = (
            2 * X_train[:, 0] + 
            3 * X_train[:, 1] - 
            1.5 * X_train[:, 2] + 
            np.random.randn(100) * 2
        )
        
        # Train model
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        
        model = RandomForestRegressor(
            n_estimators=50,
            random_state=42,
            n_jobs=-1
        )
        model.fit(X_train_scaled, y_train)
        
        logger.info("Model trained successfully")
        return True
    except Exception as e:
        logger.error(f"Error loading/training model: {e}")
        return False


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint for Cloud Run"""
    return jsonify({
        'status': 'healthy',
        'model_loaded': model is not None
    }), 200


@app.route('/predict', methods=['POST'])
def predict():
    """
    Prediction endpoint
    
    Expected input:
    {
        "features": [value1, value2, value3, value4, value5],
        "context": "optional context from Looker"
    }
    
    Returns:
    {
        "prediction": predicted_value,
        "confidence": confidence_score,
        "input_features": original_features
    }
    """
    try:
        if model is None or scaler is None:
            return jsonify({
                'error': 'Model not initialized'
            }), 500
        
        data = request.get_json()
        
        if 'features' not in data:
            return jsonify({
                'error': 'Missing "features" in request'
            }), 400
        
        features = np.array(data.get('features')).reshape(1, -1)
        
        # Validate input shape
        if features.shape[1] != 5:
            return jsonify({
                'error': f'Expected 5 features, got {features.shape[1]}'
            }), 400
        
        # Scale features
        features_scaled = scaler.transform(features)
        
        # Make prediction
        prediction = model.predict(features_scaled)[0]
        
        # Get confidence (tree variance for RandomForest)
        predictions_all_trees = np.array([
            tree.predict(features_scaled)[0] for tree in model.estimators_
        ])
        confidence = 1.0 - (np.std(predictions_all_trees) / (abs(prediction) + 1e-6))
        confidence = max(0, min(1, confidence))
        
        logger.info(f"Prediction made: {prediction:.2f}, Confidence: {confidence:.2f}")
        
        return jsonify({
            'prediction': float(prediction),
            'confidence': float(confidence),
            'input_features': data.get('features'),
            'context': data.get('context', 'none'),
            'model_type': 'RandomForestRegressor',
            'feature_count': 5
        }), 200
    
    except Exception as e:
        logger.error(f"Prediction error: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/batch_predict', methods=['POST'])
def batch_predict():
    """
    Batch prediction endpoint for multiple values
    
    Expected input:
    {
        "records": [
            {"features": [v1, v2, v3, v4, v5]},
            {"features": [v1, v2, v3, v4, v5]}
        ]
    }
    """
    try:
        if model is None or scaler is None:
            return jsonify({
                'error': 'Model not initialized'
            }), 500
        
        data = request.get_json()
        
        if 'records' not in data:
            return jsonify({
                'error': 'Missing "records" in request'
            }), 400
        
        records = data.get('records')
        predictions = []
        
        for record in records:
            features = np.array(record.get('features')).reshape(1, -1)
            
            if features.shape[1] != 5:
                return jsonify({
                    'error': f'Expected 5 features, got {features.shape[1]}'
                }), 400
            
            features_scaled = scaler.transform(features)
            prediction = model.predict(features_scaled)[0]
            
            predictions.append({
                'input_features': record.get('features'),
                'prediction': float(prediction)
            })
        
        logger.info(f"Batch prediction completed for {len(predictions)} records")
        
        return jsonify({
            'predictions': predictions,
            'record_count': len(predictions)
        }), 200
    
    except Exception as e:
        logger.error(f"Batch prediction error: {e}")
        return jsonify({
            'error': str(e)
        }), 500


@app.route('/info', methods=['GET'])
def info():
    """Get model information"""
    if model is None:
        return jsonify({
            'error': 'Model not initialized'
        }), 500
    
    return jsonify({
        'model_type': 'RandomForestRegressor',
        'n_estimators': model.n_estimators,
        'feature_count': 5,
        'feature_names': ['feature_0', 'feature_1', 'feature_2', 'feature_3', 'feature_4'],
        'version': '1.0.0'
    }), 200


if __name__ == '__main__':
    # Load model on startup
    load_or_train_model()
    
    # Get port from environment or use 8080
    port = int(os.environ.get('PORT', 8080))
    
    # Run Flask app
    app.run(
        host='0.0.0.0',
        port=port,
        debug=os.environ.get('FLASK_ENV') == 'development'
    )
