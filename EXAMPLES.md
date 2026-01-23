# Examples and Usage Patterns

## API Usage Examples

### Python Client

```python
import requests
import json

BASE_URL = "http://localhost:8080"

# Single Prediction
def predict_single(features):
    response = requests.post(
        f"{BASE_URL}/predict",
        json={
            "features": features,
            "context": "Python script"
        }
    )
    return response.json()

# Example usage
result = predict_single([10.5, 20.3, -5.2, 15.1, 8.9])
print(f"Prediction: {result['prediction']:.2f}")
print(f"Confidence: {result['confidence']:.2%}")
```

### JavaScript Client (Browser)

```javascript
const BASE_URL = "http://localhost:8080";

// Single Prediction
async function predictSingle(features) {
  const response = await fetch(`${BASE_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      features: features,
      context: 'JavaScript client'
    })
  });
  return response.json();
}

// Example usage
const result = await predictSingle([10.5, 20.3, -5.2, 15.1, 8.9]);
console.log(`Prediction: ${result.prediction.toFixed(2)}`);
console.log(`Confidence: ${(result.confidence * 100).toFixed(1)}%`);
```

### cURL Examples

#### Get Model Info
```bash
curl http://localhost:8080/info
```

Response:
```json
{
  "model_type": "RandomForestRegressor",
  "n_estimators": 50,
  "feature_count": 5,
  "feature_names": ["feature_0", "feature_1", "feature_2", "feature_3", "feature_4"],
  "version": "1.0.0"
}
```

#### Health Check
```bash
curl http://localhost:8080/health
```

Response:
```json
{
  "status": "healthy",
  "model_loaded": true
}
```

#### Single Prediction
```bash
curl -X POST http://localhost:8080/predict \
  -H "Content-Type: application/json" \
  -d '{
    "features": [10.5, 20.3, -5.2, 15.1, 8.9],
    "context": "Test prediction"
  }'
```

Response:
```json
{
  "prediction": 42.15,
  "confidence": 0.87,
  "input_features": [10.5, 20.3, -5.2, 15.1, 8.9],
  "context": "Test prediction",
  "model_type": "RandomForestRegressor",
  "feature_count": 5
}
```

#### Batch Prediction
```bash
curl -X POST http://localhost:8080/batch_predict \
  -H "Content-Type: application/json" \
  -d '{
    "records": [
      {"features": [10.5, 20.3, -5.2, 15.1, 8.9]},
      {"features": [5.1, 10.2, -3.0, 8.5, 4.2]},
      {"features": [15.2, 25.5, 0.5, 10.1, 6.7]}
    ]
  }'
```

Response:
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
    },
    {
      "input_features": [15.2, 25.5, 0.5, 10.1, 6.7],
      "prediction": 55.42
    }
  ],
  "record_count": 3
}
```

## Looker Integration Examples

### Dashboard Extension Usage

```xml
<!-- Add to Looker dashboard YAML -->
<dashboard>
  <title>ML Predictions Dashboard</title>
  <elements>
    <element>
      <name>Predictions</name>
      <extension name="looker_ml_predictor">
        <configure>
          <hostUrl>https://your-cloud-run-service.run.app</hostUrl>
        </configure>
      </extension>
    </element>
  </elements>
</dashboard>
```

### Passing Looker Context to Extension

```javascript
// In a custom Looker action
looker.extensions.send_info({
  type: 'ml_prediction',
  features: [value1, value2, value3, value4, value5],
  lookId: context.lookId
});
```

## Advanced Usage Patterns

### Monitoring Predictions

```python
import requests
import time
import json

BASE_URL = "http://localhost:8080"
PREDICTIONS_LOG = []

def log_prediction(features, result):
    log_entry = {
        "timestamp": time.time(),
        "features": features,
        "prediction": result['prediction'],
        "confidence": result['confidence']
    }
    PREDICTIONS_LOG.append(log_entry)
    
    # Alert if confidence is low
    if result['confidence'] < 0.5:
        print(f"⚠️ Low confidence prediction: {result['confidence']:.2%}")

# Make predictions and log
for features in [[10, 20, -5, 15, 8.9], [5, 10, -3, 8, 4]]:
    response = requests.post(
        f"{BASE_URL}/predict",
        json={"features": features}
    )
    result = response.json()
    log_prediction(features, result)

print(f"Total predictions: {len(PREDICTIONS_LOG)}")
```

### Batch Processing with Error Handling

```python
import requests
import json

BASE_URL = "http://localhost:8080"

def batch_predict_safe(records, batch_size=10):
    """Process records in batches with error handling"""
    results = []
    failed = []
    
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        
        try:
            response = requests.post(
                f"{BASE_URL}/batch_predict",
                json={"records": batch},
                timeout=30
            )
            response.raise_for_status()
            batch_results = response.json()
            results.extend(batch_results['predictions'])
        except requests.exceptions.RequestException as e:
            print(f"Error processing batch {i//batch_size + 1}: {e}")
            failed.extend(batch)
    
    return {
        "results": results,
        "successful": len(results),
        "failed": len(failed),
        "failed_records": failed
    }

# Example usage
records = [
    {"features": [10.5, 20.3, -5.2, 15.1, 8.9]},
    {"features": [5.1, 10.2, -3.0, 8.5, 4.2]},
    {"features": [15.2, 25.5, 0.5, 10.1, 6.7]},
    # ... more records
]

result = batch_predict_safe(records, batch_size=5)
print(f"Processed: {result['successful']} records")
if result['failed']:
    print(f"Failed: {result['failed']} records")
```

### Request with Retry Logic

```python
import requests
import time
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def create_session_with_retries():
    session = requests.Session()
    retry = Retry(
        total=3,
        backoff_factor=0.5,
        status_forcelist=[500, 502, 503, 504]
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

BASE_URL = "http://localhost:8080"
session = create_session_with_retries()

def predict_with_retry(features, max_retries=3):
    for attempt in range(max_retries):
        try:
            response = session.post(
                f"{BASE_URL}/predict",
                json={"features": features},
                timeout=5
            )
            return response.json()
        except requests.exceptions.RequestException as e:
            if attempt == max_retries - 1:
                raise
            wait_time = 2 ** attempt
            print(f"Retry in {wait_time}s... (attempt {attempt + 1})")
            time.sleep(wait_time)

# Example usage
try:
    result = predict_with_retry([10.5, 20.3, -5.2, 15.1, 8.9])
    print(f"Success: {result['prediction']}")
except Exception as e:
    print(f"Failed after retries: {e}")
```

### Performance Benchmarking

```python
import requests
import time
import statistics

BASE_URL = "http://localhost:8080"

def benchmark_predictions(num_requests=100):
    times = []
    features = [10.5, 20.3, -5.2, 15.1, 8.9]
    
    print(f"Running {num_requests} prediction requests...")
    
    for i in range(num_requests):
        start = time.time()
        response = requests.post(
            f"{BASE_URL}/predict",
            json={"features": features}
        )
        elapsed = (time.time() - start) * 1000  # Convert to ms
        times.append(elapsed)
        
        if (i + 1) % 20 == 0:
            print(f"  {i + 1}/{num_requests} completed")
    
    print(f"\nResults (ms):")
    print(f"  Min: {min(times):.2f}")
    print(f"  Max: {max(times):.2f}")
    print(f"  Mean: {statistics.mean(times):.2f}")
    print(f"  Median: {statistics.median(times):.2f}")
    print(f"  StdDev: {statistics.stdev(times):.2f}")
    print(f"  Total: {sum(times):.2f}ms")

benchmark_predictions(100)
```

## Testing the Extension Locally

### Simple HTML Test Page

```html
<!DOCTYPE html>
<html>
<head>
    <title>ML Predictor Test</title>
    <style>
        body { font-family: Arial; margin: 20px; }
        input { padding: 5px; margin: 5px; }
        button { padding: 10px 20px; }
        .result { margin-top: 20px; padding: 10px; background: #f0f0f0; }
    </style>
</head>
<body>
    <h1>ML Predictor Test</h1>
    
    <div>
        <h3>Features</h3>
        <input id="f0" type="number" placeholder="Feature 0" value="10.5" />
        <input id="f1" type="number" placeholder="Feature 1" value="20.3" />
        <input id="f2" type="number" placeholder="Feature 2" value="-5.2" />
        <input id="f3" type="number" placeholder="Feature 3" value="15.1" />
        <input id="f4" type="number" placeholder="Feature 4" value="8.9" />
    </div>
    
    <button onclick="predict()">Predict</button>
    
    <div id="result" class="result" style="display:none;"></div>
    
    <script>
        const BASE_URL = "http://localhost:8080";
        
        async function predict() {
            const features = [
                parseFloat(document.getElementById('f0').value),
                parseFloat(document.getElementById('f1').value),
                parseFloat(document.getElementById('f2').value),
                parseFloat(document.getElementById('f3').value),
                parseFloat(document.getElementById('f4').value)
            ];
            
            try {
                const response = await fetch(`${BASE_URL}/predict`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ features })
                });
                
                const result = await response.json();
                document.getElementById('result').innerHTML = `
                    <strong>Prediction:</strong> ${result.prediction.toFixed(2)}<br>
                    <strong>Confidence:</strong> ${(result.confidence * 100).toFixed(1)}%
                `;
                document.getElementById('result').style.display = 'block';
            } catch (error) {
                document.getElementById('result').innerHTML = `Error: ${error}`;
                document.getElementById('result').style.display = 'block';
            }
        }
    </script>
</body>
</html>
```

---

## Next Steps

1. Try the examples with your local backend
2. Modify feature values to see different predictions
3. Monitor response times and confidence scores
4. Integrate with your Looker instance
5. Build custom dashboards with predictions

For production deployments, see `COMPLETE_GUIDE.md`
