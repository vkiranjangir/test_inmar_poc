# Looker ML Predictor Extension - Complete PoC

A proof-of-concept Looker Extension that integrates with a predictive machine learning model deployed on GCP Cloud Run.

## Overview

This project demonstrates:
- **Backend**: A Flask API serving a scikit-learn RandomForest model on GCP Cloud Run
- **Frontend**: A React-based Looker Extension that sends feature values and displays predictions
- **Integration**: Seamless communication between Looker and external ML models

## Architecture

```
┌─────────────────────┐
│  Looker Instance    │
│  ┌───────────────┐  │
│  │  Extension    │  │
│  │  (React)      │  │
│  └───────┬───────┘  │
└──────────┼──────────┘
           │ (HTTP/REST)
           ▼
┌─────────────────────────────┐
│  GCP Cloud Run              │
│  ┌─────────────────────────┐│
│  │  Flask API              ││
│  │  ┌───────────────────┐  ││
│  │  │  ML Model         │  ││
│  │  │  (RandomForest)   │  ││
│  │  └───────────────────┘  ││
│  └─────────────────────────┘│
└─────────────────────────────┘
```

## Features

### Backend API
- **POST `/predict`** - Single prediction endpoint
  - Input: 5 numerical features
  - Output: Prediction value, confidence score, model metadata
  
- **POST `/batch_predict`** - Batch prediction for multiple records
  - Input: Array of feature vectors
  - Output: Array of predictions
  
- **GET `/health`** - Health check endpoint
  
- **GET `/info`** - Model information endpoint

### Frontend Extension
- Input form for 5 features
- Real-time prediction requests
- Confidence score visualization
- Error handling and loading states
- Randomize and clear functions
- Responsive design compatible with Looker

## Project Structure

```
test_inmar_poc/
├── main.py                 # Flask backend application
├── requirements.txt        # Python dependencies
├── dockerfile              # Docker container configuration
├── cloudbuild.yaml         # GCP Cloud Build configuration
├── .dockerignore            # Docker build ignores
├── .gitignore              # Git ignores
├── COMPLETE_GUIDE.md       # This file
│
└── looker-extension/       # Looker Extension frontend
    ├── manifest.lkml       # Extension manifest
    ├── index.html          # HTML entry point
    ├── index.jsx           # React entry point
    ├── MLPredictorExtension.jsx  # Main React component
    ├── package.json        # Node.js dependencies
    ├── webpack.config.js   # Webpack configuration
    └── README.md           # Extension documentation
```

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 16+
- Docker
- GCP Project with Cloud Run API enabled

### Local Development

#### 1. Backend Setup

```bash
# Navigate to project root
cd test_inmar_poc

# Create Python virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run Flask development server
python main.py
```

The backend will be available at `http://localhost:8080`

#### 2. Test the Backend API

```bash
# Health check
curl http://localhost:8080/health

# Get model info
curl http://localhost:8080/info

# Single prediction
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": [10.5, 20.3, -5.2, 15.1, 8.9],
    "context": "test"
  }'

# Batch prediction
curl -X POST http://localhost:8080/batch_predict \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {"features": [10.5, 20.3, -5.2, 15.1, 8.9]},
      {"features": [5.1, 10.2, -3.0, 8.5, 4.2]}
    ]
  }'
```

#### 3. Frontend Setup (Optional for local testing)

```bash
# Navigate to extension directory
cd looker-extension

# Install Node.js dependencies
npm install

# Build extension
npm run build

# Or run dev server
npm run dev
```

### Docker Deployment

#### Build Docker Image Locally

```bash
docker build -t looker-ml-predictor:latest .
```

#### Run Docker Container

```bash
docker run -p 8080:8080 looker-ml-predictor:latest
```

## Deployment to GCP Cloud Run

### Prerequisites
```bash
# Install gcloud CLI
# https://cloud.google.com/sdk/docs/install

# Authenticate with GCP
gcloud auth login

# Set your GCP project
gcloud config set project YOUR_PROJECT_ID
```

### Option 1: Using Cloud Build (Recommended)

```bash
# Submit build to Cloud Build
gcloud builds submit --config cloudbuild.yaml
```

This will:
1. Build the Docker image
2. Push to Google Container Registry
3. Deploy to Cloud Run

### Option 2: Manual Deployment

```bash
# Build and push image
docker build -t gcr.io/YOUR_PROJECT_ID/looker-ml-predictor:latest .
docker push gcr.io/YOUR_PROJECT_ID/looker-ml-predictor:latest

# Deploy to Cloud Run
gcloud run deploy looker-ml-predictor \
  --image gcr.io/YOUR_PROJECT_ID/looker-ml-predictor:latest \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --timeout 3600
```

### Get Cloud Run Service URL

```bash
gcloud run services list
gcloud run services describe looker-ml-predictor --region us-central1
```

## Integrating with Looker

### 1. Enable Extensions in Looker
- Go to Admin → Settings
- Enable "Allow Looker Extensions"
- Enable "Extension API"

### 2. Install the Extension

**Using Extension Marketplace (if published):**
- Navigate to Extensions in Looker
- Search for "ML Predictor"
- Install and configure

**For Development:**
- Build the extension: `npm run build` in `looker-extension/`
- Upload the built extension (dist/looker-ml-predictor.js)
- Or configure extension in Looker with development server URL

### 3. Configure Extension Settings
In the Looker extension configuration, set:
- **Host URL**: Your Cloud Run service URL or `http://localhost:8080` for local development
- **CORS**: Ensure your Looker instance is authorized to call the backend

## API Reference

### POST /predict

**Request:**
```json
{
  "features": [value1, value2, value3, value4, value5],
  "context": "optional context"
}
```

**Response:**
```json
{
  "prediction": 42.15,
  "confidence": 0.87,
  "input_features": [10.5, 20.3, -5.2, 15.1, 8.9],
  "context": "optional context",
  "model_type": "RandomForestRegressor",
  "feature_count": 5
}
```

### POST /batch_predict

**Request:**
```json
{
  "records": [
    {"features": [10.5, 20.3, -5.2, 15.1, 8.9]},
    {"features": [5.1, 10.2, -3.0, 8.5, 4.2]}
  ]
}
```

**Response:**
```json
{
  "predictions": [
    {
      "input_features": [10.5, 20.3, -5.2, 15.1, 8.9],
      "prediction": 42.15
    },
    {
      "input_features": [5.1, 10.2, -3.0, 8.5, 4.2],
      "prediction": 18.73
    }
  ],
  "record_count": 2
}
```

### GET /health

**Response:**
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

### GET /info

**Response:**
```json
{
  "model_type": "RandomForestRegressor",
  "n_estimators": 50,
  "feature_count": 5,
  "feature_names": ["feature_0", "feature_1", "feature_2", "feature_3", "feature_4"],
  "version": "1.0.0"
}
```

## Model Details

### Current Model (PoC)
- **Type**: Random Forest Regressor
- **Features**: 5 numerical inputs
- **Estimators**: 50 trees
- **Training Data**: Synthetic (100 samples)

### Formula (Synthetic Training Data)
```
y = 2*feature_0 + 3*feature_1 - 1.5*feature_2 + noise
```

### For Production
Replace the model with:
1. Load pre-trained model from Cloud Storage
2. Implement model versioning
3. Add monitoring and logging
4. Implement A/B testing infrastructure

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `8080` | Flask server port |
| `FLASK_ENV` | `production` | Flask environment |
| `REACT_APP_HOST_URL` | `http://localhost:8080` | Backend URL for extension |

## Security Considerations

### For Production Deployment:
1. **Authentication**: Add OAuth2/JWT authentication to API endpoints
2. **CORS**: Configure CORS to accept requests from specific Looker instances
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: Validate and sanitize all input features
5. **Logging**: Enable Cloud Logging and monitoring
6. **HTTPS**: Use Cloud Run with custom domain and SSL/TLS
7. **Data Protection**: Encrypt sensitive data in transit and at rest

### Recommended Security Steps:
```python
# Add to main.py for production
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)
```

## Monitoring and Logging

### Cloud Run Logs
```bash
gcloud logs read --limit 50 --service looker-ml-predictor
```

### Local Development Logs
The Flask server outputs logs to stdout. Check terminal output for:
- Model loading status
- Prediction requests
- Error messages

## Troubleshooting

### Backend won't start
- Ensure Python 3.11+ is installed: `python --version`
- Check dependencies: `pip install -r requirements.txt`
- Verify port 8080 is not in use: `lsof -i :8080`

### Docker build fails
- Clear Docker cache: `docker system prune`
- Rebuild: `docker build --no-cache -t looker-ml-predictor .`

### Cloud Run deployment fails
- Check gcloud auth: `gcloud auth list`
- Verify project: `gcloud config list`
- Check Cloud Build logs in GCP Console

### Extension can't reach backend
- Verify backend URL is correct
- Check CORS headers: `curl -I http://your-backend-url/health`
- Check Cloud Run service is running: `gcloud run services list`

### Prediction errors
- Verify exactly 5 features are provided
- Ensure all features are numbers
- Check backend logs: `gcloud logs read --service looker-ml-predictor`

## Next Steps for Production

1. **Model Management**
   - Use Google Cloud Vertex AI for model training and serving
   - Implement model versioning and A/B testing
   - Add model monitoring and drift detection

2. **Feature Engineering**
   - Create dedicated feature store with Feast or Tecton
   - Implement feature transformations
   - Add feature validation

3. **Infrastructure**
   - Set up CI/CD pipeline with Cloud Build
   - Add monitoring with Cloud Monitoring
   - Implement alerting for model performance

4. **Scalability**
   - Use Cloud Load Balancing
   - Implement caching with Cloud Memorystore
   - Add request queuing for large batches

5. **Integration**
   - Create Looker dashboard with extension
   - Add Looker query integration
   - Implement model explanation features

## Resources

- [Looker Extension SDK](https://github.com/looker-open-source/extension-framework)
- [GCP Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Flask Documentation](https://flask.palletsprojects.com/)
- [scikit-learn Documentation](https://scikit-learn.org/)
- [React Documentation](https://react.dev/)

## License

MIT License

## Support

For issues or questions:
1. Check troubleshooting section above
2. Review logs and error messages
3. Consult the resource links

---

**Last Updated**: January 2026
**Version**: 1.0.0
