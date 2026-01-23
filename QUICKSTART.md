# Quick Start Guide - Looker ML Predictor PoC

Get the Looker ML Predictor running in minutes!

## 5-Minute Local Setup

### Step 1: Backend Setup (2 minutes)

```bash
# On Windows
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

```bash
# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
```

✅ Backend runs on `http://localhost:8080`

### Step 2: Test API (1 minute)

```bash
# In another terminal, test the API
curl http://localhost:8080/health

curl http://localhost:8080/info

curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{"features": [10, 20, -5, 15, 8.9]}'
```

✅ You should see prediction responses

### Step 3: Build Extension (2 minutes)

```bash
cd looker-extension
npm install
npm run build
```

✅ Built file: `dist/looker-ml-predictor.js`

## Deploy to Cloud Run (15 minutes)

### Prerequisites
```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### Deploy
```bash
gcloud builds submit --config cloudbuild.yaml
```

Wait 5-10 minutes for deployment...

### Get Service URL
```bash
gcloud run services describe looker-ml-predictor --region us-central1
```

Copy the service URL!

## Integrate with Looker

### Step 1: Enable Extensions
Admin → Settings → Enable "Allow Looker Extensions"

### Step 2: Add Extension
- Go to Extensions
- Click "Install Extension"
- Upload built file: `looker-extension/dist/looker-ml-predictor.js`
- Set Host URL to your Cloud Run URL

### Step 3: Use
Add extension to dashboard or Explore!

## API Quick Reference

### Make Prediction
```bash
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": [10, 20, -5, 15, 8.9]
  }'
```

### Response
```json
{
  "prediction": 42.15,
  "confidence": 0.87,
  "model_type": "RandomForestRegressor"
}
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Port 8080 already in use | `lsof -i :8080` then kill the process |
| `ModuleNotFoundError` | `pip install -r requirements.txt` |
| Extension won't load | Check CORS, verify host URL correct |
| API returns 500 | Check backend logs, model may not have loaded |

## What's Inside

- **Backend**: Flask with Random Forest predictor
- **Frontend**: React-based Looker Extension
- **Infrastructure**: Docker + Cloud Build + Cloud Run
- **API**: 4 endpoints (predict, batch_predict, health, info)

## Next Steps

1. ✅ Try local prediction in terminal
2. ✅ Build and deploy to Cloud Run
3. ✅ Integrate with Looker dashboard
4. ✅ Read `COMPLETE_GUIDE.md` for production setup

## File Reference

| File | Purpose |
|------|---------|
| `main.py` | Flask backend API |
| `requirements.txt` | Python dependencies |
| `dockerfile` | Container specification |
| `cloudbuild.yaml` | GCP deployment config |
| `looker-extension/` | React extension code |
| `COMPLETE_GUIDE.md` | Full documentation |

## Support

- **Backend issues**: Check Python environment, see COMPLETE_GUIDE.md
- **Extension issues**: Browser console (F12), network tab
- **Cloud Run issues**: Check Cloud Build logs in GCP Console

---

Ready to predict? 🚀 Start with Step 1 above!
