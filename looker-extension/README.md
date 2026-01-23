# Looker ML Predictor Extension

A React-based Looker Extension component that enables users to send feature values to a machine learning model running on GCP Cloud Run and receive predictions with confidence scores.

## Overview

This extension provides an interactive UI for:
- Inputting numerical feature values (5 features)
- Submitting predictions to a backend API
- Displaying prediction results with confidence visualization
- Randomizing or clearing inputs
- Viewing model metadata

## File Structure

```
├── manifest.lkml              # Extension manifest configuration
├── index.html                 # HTML entry point
├── index.jsx                  # React entry point and initialization
├── MLPredictorExtension.jsx   # Main React component
├── package.json               # NPM dependencies and scripts
├── webpack.config.js          # Webpack build configuration
└── README.md                  # This file
```

## Component Features

### MLPredictorExtension Component

Main React component providing:

- **Input Section**: Form fields for 5 numerical features
  - Supports decimal values
  - Real-time validation feedback
  - Error messages for invalid input

- **Prediction Controls**:
  - Get Prediction button: Sends features to backend
  - Randomize button: Generates random feature values
  - Clear button: Resets all fields

- **Results Display**:
  - Predicted value with 2 decimal precision
  - Confidence score percentage
  - Visual confidence bar (color-coded: red < 40%, yellow 40-70%, green > 70%)
  - Input feature display
  - Model type and version information

- **Model Information**:
  - Displays model metadata from `/info` endpoint
  - Shows model type, feature count, and version

- **Error Handling**:
  - User-friendly error messages
  - Handles network errors gracefully
  - Validates numerical input

## Setup and Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Backend API running (see parent README)

### Installation

```bash
# Install dependencies
npm install
```

### Development Server

```bash
# Start Webpack dev server
npm run dev
```

The dev server runs on `http://localhost:3000` with hot reloading.

### Building

```bash
# Build for production
npm run build

# Build for development
npm run build:dev

# Watch mode (rebuild on file changes)
npm run watch
```

Output: `dist/looker-ml-predictor.js`

## Configuration

### Environment Variables

- `REACT_APP_HOST_URL`: Backend API base URL (default: `http://localhost:8080`)

Example:
```bash
export REACT_APP_HOST_URL=https://your-cloud-run-service.com
npm run build
```

### Manifest Configuration

Edit `manifest.lkml` to update:
- Extension name and title
- Version number
- Host URL
- Required API capabilities

## API Integration

The component communicates with the backend via HTTP:

### Prediction Request

```javascript
POST /predict
Content-Type: application/json

{
  "features": [10.5, 20.3, -5.2, 15.1, 8.9],
  "context": "Looker Extension PoC"
}
```

### Response Format

```javascript
{
  "prediction": 42.15,
  "confidence": 0.87,
  "input_features": [10.5, 20.3, -5.2, 15.1, 8.9],
  "context": "Looker Extension PoC",
  "model_type": "RandomForestRegressor",
  "feature_count": 5
}
```

### Model Info Request

```javascript
GET /info
```

Returns:
```javascript
{
  "model_type": "RandomForestRegressor",
  "n_estimators": 50,
  "feature_count": 5,
  "feature_names": ["feature_0", "feature_1", "feature_2", "feature_3", "feature_4"],
  "version": "1.0.0"
}
```

## Component Props

### MLPredictorExtension

```javascript
<MLPredictorExtension
  hostUrl="http://localhost:8080"  // Backend API URL
  context={...}                      // Optional Looker context
/>
```

- `hostUrl`: (string) Backend API base URL
- `context`: (object) Optional context passed to backend

## Styling

The component uses `styled-components` for CSS-in-JS styling:

- Responsive layout
- Looker-compatible colors and fonts
- Animated confidence bar
- Loading spinner animation
- Color-coded confidence levels

### Color Scheme

- Primary: `#1f78b4` (Looker blue)
- Dark text: `#262d33`
- Success (high confidence): `#52c41a` (green)
- Warning (medium confidence): `#faad14` (amber)
- Error (low confidence): `#ff4d4f` (red)

## Dependencies

### Production
- `react`: ^18.2.0
- `react-dom`: ^18.2.0
- `styled-components`: ^6.0.0

### Development
- `@babel/core`: ^7.22.0
- `@babel/preset-env`: ^7.22.0
- `@babel/preset-react`: ^7.22.0
- `babel-loader`: ^9.1.2
- `css-loader`: ^6.8.1
- `style-loader`: ^3.3.3
- `webpack`: ^5.88.0
- `webpack-cli`: ^5.1.4
- `webpack-dev-server`: ^4.15.1

## Error Handling

The component handles:
- Network timeouts: "Failed to get prediction. Ensure backend is running."
- Invalid input: "All features must be valid numbers"
- API errors: Displays error message from backend
- Missing model: "Model not initialized"

## Testing

### Manual Testing

```bash
# Start backend
cd ..
python main.py

# Start extension dev server
npm run dev

# Navigate to http://localhost:3000
# Test prediction with sample values: [10, 20, -5, 15, 8.9]
```

### Testing Specific Features

1. **Randomize**: Click "Randomize" to populate fields with random values
2. **Predictions**: Enter values and click "Get Prediction"
3. **Confidence**: Observe confidence visualization changes
4. **Error Handling**: Disconnect backend to test error messages
5. **Loading**: Observe spinner during prediction requests

## Integration with Looker

### Installation Steps

1. Build the extension: `npm run build`
2. In Looker Admin panel:
   - Go to Extensions
   - Select "Install Extension"
   - Upload `dist/looker-ml-predictor.js`
3. Configure extension host URL
4. Add extension to dashboard or Explore

### Dashboard Integration

```xml
<!-- In Looker dashboard -->
<extension name="looker_ml_predictor" />
```

## Troubleshooting

### Webpack compilation errors
```bash
npm install
npm run build
```

### Module not found errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear build cache: `rm -rf dist && npm run build`

### Extension won't load in Looker
- Verify CORS is enabled on backend
- Check browser console for errors (F12)
- Ensure host URL is correct in configuration

### Predictions failing
- Verify backend is running: `curl http://your-backend/health`
- Check all 5 features are provided
- Verify features are valid numbers
- Check browser network tab (F12) for HTTP errors

## Performance Optimization

### Lazy Loading

```javascript
const MLPredictorExtension = React.lazy(
  () => import('./MLPredictorExtension')
);
```

### Memoization

Component already uses:
- React hooks with proper dependencies
- Conditional rendering to avoid unnecessary updates

### Caching

Implement request caching for model info:

```javascript
const [modelInfo, setModelInfo] = useState(null);
useEffect(() => {
  fetchModelInfo();
}, []); // Fetched once on mount
```

## Future Enhancements

1. **Input Features**:
   - CSV upload support
   - Feature value templates
   - Validation rules per feature

2. **Visualization**:
   - Feature importance chart
   - SHAP value explanation
   - Prediction history

3. **Functionality**:
   - Batch predictions from queries
   - Model comparison
   - Parameter tuning UI

4. **Performance**:
   - Request caching
   - WebSocket for real-time updates
   - Offline mode

## License

MIT License

## Support

Refer to parent directory README for:
- Deployment instructions
- API reference
- Troubleshooting guide
- Production setup

---

**Version**: 1.0.0
**Last Updated**: January 2026
