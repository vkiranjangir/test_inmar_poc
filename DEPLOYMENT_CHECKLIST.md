# Deployment Checklist

## ✅ Pre-Deployment Verification

### Backend Verification
- [ ] Python environment created and activated
- [ ] `requirements.txt` installed: `pip install -r requirements.txt`
- [ ] `main.py` runs without errors: `python main.py`
- [ ] API health check succeeds: `curl http://localhost:8080/health`
- [ ] Model info endpoint works: `curl http://localhost:8080/info`
- [ ] Single prediction works: `curl -X POST http://localhost:8080/predict -d '{"features": [10, 20, -5, 15, 8.9]}'`
- [ ] Batch prediction works: `curl -X POST http://localhost:8080/batch_predict -d '{"records": [{"features": [10, 20, -5, 15, 8.9]}]}'`

### Frontend Verification
- [ ] Navigate to `looker-extension/` directory
- [ ] Node.js installed and version ≥ 16: `node --version`
- [ ] npm installed: `npm --version`
- [ ] Dependencies installed: `npm install`
- [ ] Build succeeds: `npm run build`
- [ ] Built file exists: `dist/looker-ml-predictor.js` (~1-2 MB)

### Docker Verification
- [ ] Docker installed: `docker --version`
- [ ] Image builds successfully: `docker build -t looker-ml-predictor .`
- [ ] Image runs on port 8080: `docker run -p 8080:8080 looker-ml-predictor`
- [ ] API accessible via Docker: `curl http://localhost:8080/health`

### Cloud Deployment Verification
- [ ] GCP project created
- [ ] gcloud CLI installed: `gcloud --version`
- [ ] gcloud authenticated: `gcloud auth login`
- [ ] Project set: `gcloud config set project YOUR_PROJECT_ID`
- [ ] Cloud Run API enabled in project
- [ ] Container Registry API enabled in project

## 📋 Local Testing Checklist

### Backend Tests
- [ ] Server starts without errors
- [ ] Model loads on startup (check logs)
- [ ] Health endpoint returns 200 with `{"status": "healthy", "model_loaded": true}`
- [ ] Info endpoint returns model metadata
- [ ] Prediction with valid features returns result with `prediction` and `confidence`
- [ ] Prediction with invalid features returns error message
- [ ] Batch prediction processes multiple records
- [ ] CORS headers present in responses

### Frontend Tests
- [ ] NPM build completes without warnings/errors
- [ ] Built file is ~1-2 MB
- [ ] Can open `index.html` in browser
- [ ] Extension UI renders correctly
- [ ] Can enter values in feature input fields
- [ ] "Get Prediction" button triggers API call
- [ ] Response displays correctly with prediction and confidence
- [ ] Randomize button generates random feature values
- [ ] Clear button resets all fields
- [ ] Error messages display for invalid input

### Integration Tests
- [ ] Backend running at `http://localhost:8080`
- [ ] Extension dev server running at `http://localhost:3000`
- [ ] Can submit prediction from extension UI
- [ ] Extension receives and displays predictions correctly
- [ ] Confidence bar displays and updates
- [ ] Model info loads correctly

## 🚀 Cloud Deployment Checklist

### Before Deployment
- [ ] All local tests pass
- [ ] `cloudbuild.yaml` reviewed and contains correct settings
- [ ] Project ID configured in `cloudbuild.yaml` or gcloud
- [ ] Cloud Build API enabled
- [ ] Container Registry API enabled
- [ ] No sensitive data in code
- [ ] `.dockerignore` includes unnecessary files

### Deployment Steps
- [ ] Run: `gcloud builds submit --config cloudbuild.yaml`
- [ ] Wait 5-10 minutes for build and deployment
- [ ] Check build status: `gcloud builds list`
- [ ] View build logs: `gcloud builds log BUILD_ID`

### Post-Deployment Verification
- [ ] Cloud Run service created: `gcloud run services list`
- [ ] Service is running: Check GCP Console
- [ ] Get service URL: `gcloud run services describe looker-ml-predictor --region us-central1`
- [ ] Test health endpoint: `curl https://your-service-url/health`
- [ ] Test prediction: `curl -X POST https://your-service-url/predict -d '{"features": [10, 20, -5, 15, 8.9]}'`
- [ ] Check logs: `gcloud logs read --service looker-ml-predictor --limit 50`

## 🔗 Looker Integration Checklist

### Looker Admin Setup
- [ ] Looker admin access confirmed
- [ ] Extension support enabled: Admin → Settings → Check "Allow Looker Extensions"
- [ ] Extension API enabled: Admin → Settings → Check "Extension API"
- [ ] Note: Changes may require Looker restart

### Extension Installation
- [ ] Built extension file ready: `looker-extension/dist/looker-ml-predictor.js`
- [ ] Host URL available (Cloud Run service URL or localhost:8080)
- [ ] CORS enabled on backend
- [ ] File size reasonable (~1-2 MB)

### Extension Configuration
- [ ] Extension uploaded/configured in Looker
- [ ] Host URL configured in extension settings
- [ ] Extensions page loads without errors
- [ ] Extension appears in available extensions list

### Dashboard Integration
- [ ] Can add extension to dashboard
- [ ] Extension loads in dashboard
- [ ] Can interact with extension UI
- [ ] Predictions work from extension
- [ ] No JavaScript console errors (F12)
- [ ] Network tab shows successful API calls

## 🧪 Production Testing Checklist

### Performance Tests
- [ ] Response time acceptable (~100ms)
- [ ] No memory leaks (check dashboard memory)
- [ ] Can handle concurrent requests
- [ ] Batch predictions process multiple records
- [ ] Error handling works for invalid requests

### Security Tests
- [ ] HTTPS working (for production URL)
- [ ] CORS configured to specific Looker instance
- [ ] No sensitive data in logs
- [ ] API validates input (5 features, numeric values)
- [ ] Proper error messages without exposing internals

### Monitoring Tests
- [ ] Cloud Logging captures API requests
- [ ] Error logs are readable and actionable
- [ ] Health check runs successfully
- [ ] Cloud Monitoring dashboard accessible

## 📋 Documentation Checklist

- [ ] README.md is clear and complete
- [ ] QUICKSTART.md accurately describes setup
- [ ] COMPLETE_GUIDE.md covers all features
- [ ] EXAMPLES.md has working code samples
- [ ] Troubleshooting section covers common issues
- [ ] API documentation is accurate
- [ ] All endpoints documented with examples
- [ ] Deployment steps are clear and tested

## 🔐 Security Checklist

- [ ] No hardcoded credentials in code
- [ ] API validates all inputs
- [ ] CORS is configured appropriately
- [ ] Error messages don't expose system details
- [ ] Docker image is optimized and minimal
- [ ] Dependencies are up-to-date
- [ ] Cloud Run service has appropriate permissions
- [ ] Logs don't contain sensitive data

## 📊 Final Verification

### Code Quality
- [ ] No TODO or FIXME comments left
- [ ] Code is well-commented
- [ ] No debug print statements in production code
- [ ] Error handling is comprehensive
- [ ] No unused imports or variables

### Documentation Quality
- [ ] All markdown files formatted correctly
- [ ] Code examples tested and working
- [ ] Links are not broken
- [ ] Installation instructions are complete
- [ ] API documentation is clear

### Deployment Quality
- [ ] Docker image builds successfully
- [ ] Cloud Build configuration is correct
- [ ] Cloud Run service runs reliably
- [ ] Performance meets requirements
- [ ] Monitoring and logging configured

## 🎯 Success Criteria

✅ **Successfully Deployed When:**
1. Backend runs locally and responds to all endpoints
2. Extension builds without errors
3. Docker image builds and runs successfully
4. Cloud Run deployment completes without errors
5. Extension works in Looker dashboard
6. Predictions are accurate with reasonable confidence scores
7. All documentation is complete and accurate
8. No errors in console or logs

## 🆘 If Tests Fail

| Failure | Troubleshooting |
|---------|-----------------|
| Backend won't start | Check Python version, reinstall dependencies |
| Extension won't build | `npm install`, clear node_modules, retry build |
| Docker build fails | Check Dockerfile syntax, verify file paths |
| Cloud Build fails | Check logs: `gcloud builds log BUILD_ID` |
| Extension won't load in Looker | Check CORS, verify host URL, check browser console |
| Predictions fail | Verify 5 features provided, all numeric, check backend logs |

## 📝 Sign-Off

Once all items checked:

```
Deployment Date: ________________
Deployed By: ____________________
Verified By: _____________________
Notes: __________________________
________________________________
```

**Ready for Production:** ☐ Yes  ☐ No

---

Use this checklist before each deployment to ensure everything is working correctly!
