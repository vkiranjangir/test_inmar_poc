import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  max-width: 600px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #262d33;
  font-size: 24px;
  margin-bottom: 20px;
`;

const Section = styled.div`
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f5f5f5;
  border-radius: 4px;
  border-left: 4px solid #1f78b4;
`;

const SectionTitle = styled.h2`
  color: #262d33;
  font-size: 16px;
  margin-top: 0;
  margin-bottom: 15px;
`;

const InputGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  color: #262d33;
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d3d3d3;
  border-radius: 4px;
  font-size: 14px;
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #1f78b4;
    box-shadow: 0 0 0 2px rgba(31, 120, 180, 0.1);
  }
`;

const Button = styled.button`
  background-color: #1f78b4;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
  
  &:hover {
    background-color: #1560a0;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ResultBox = styled.div`
  background-color: #e8f4f8;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #1f78b4;
  margin-top: 15px;
`;

const ResultLabel = styled.div`
  color: #666;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 5px;
`;

const ResultValue = styled.div`
  color: #1f78b4;
  font-size: 28px;
  font-weight: 600;
  word-break: break-all;
`;

const ConfidenceBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #ddd;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 10px;
`;

const ConfidenceFill = styled.div`
  height: 100%;
  background-color: ${props => {
    if (props.confidence > 0.7) return '#52c41a';
    if (props.confidence > 0.4) return '#faad14';
    return '#ff4d4f';
  }};
  width: ${props => `${props.confidence * 100}%`};
  transition: width 0.3s ease;
`;

const ErrorBox = styled(ResultBox)`
  background-color: #fff1f0;
  border-color: #ff4d4f;
`;

const ErrorText = styled.div`
  color: #ff4d4f;
  font-size: 14px;
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #1f78b4;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 10px;
  vertical-align: middle;
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const InfoBox = styled.div`
  background-color: #f0f2f5;
  padding: 12px;
  border-radius: 4px;
  font-size: 12px;
  color: #666;
  margin-top: 15px;
  line-height: 1.6;
`;

const MLPredictorExtension = ({ context, hostUrl = 'http://localhost:8080' }) => {
  const [features, setFeatures] = useState(['0', '0', '0', '0', '0']);
  const [prediction, setPrediction] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelInfo, setModelInfo] = useState(null);

  // Fetch model info on component mount
  useEffect(() => {
    fetchModelInfo();
  }, []);

  const fetchModelInfo = async () => {
    try {
      const response = await fetch(`${hostUrl}/info`);
      if (response.ok) {
        const data = await response.json();
        setModelInfo(data);
      }
    } catch (err) {
      console.warn('Could not fetch model info:', err);
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...features];
    newFeatures[index] = value;
    setFeatures(newFeatures);
    setError(null);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setPrediction(null);
    setConfidence(null);

    try {
      // Validate features
      const featureValues = features.map(f => parseFloat(f));
      if (featureValues.some(isNaN)) {
        setError('All features must be valid numbers');
        setLoading(false);
        return;
      }

      // Call prediction endpoint
      const response = await fetch(`${hostUrl}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          features: featureValues,
          context: 'Looker Extension PoC',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      setPrediction(data.prediction);
      setConfidence(data.confidence);
    } catch (err) {
      setError(err.message || 'Failed to get prediction. Ensure backend is running.');
      console.error('Prediction error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRandomize = () => {
    const randomFeatures = Array(5)
      .fill()
      .map(() => (Math.random() * 100 - 50).toFixed(2).toString());
    setFeatures(randomFeatures);
    setError(null);
  };

  const handleClear = () => {
    setFeatures(['0', '0', '0', '0', '0']);
    setPrediction(null);
    setConfidence(null);
    setError(null);
  };

  return (
    <Container>
      <Title>🚀 ML Predictor</Title>

      <Section>
        <SectionTitle>Input Features</SectionTitle>
        {features.map((value, index) => (
          <InputGroup key={index}>
            <Label>Feature {index + 1}</Label>
            <Input
              type="number"
              value={value}
              onChange={e => handleFeatureChange(index, e.target.value)}
              placeholder={`Enter feature ${index + 1}`}
              step="0.01"
            />
          </InputGroup>
        ))}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <Button onClick={handleRandomize} style={{ backgroundColor: '#666' }}>
            Randomize
          </Button>
          <Button onClick={handleClear} style={{ backgroundColor: '#999' }}>
            Clear
          </Button>
        </div>

        <Button onClick={handlePredict} disabled={loading} style={{ marginTop: '10px' }}>
          {loading ? (
            <>
              <LoadingSpinner />
              Predicting...
            </>
          ) : (
            'Get Prediction'
          )}
        </Button>
      </Section>

      {error && (
        <ErrorBox>
          <ResultLabel>Error</ResultLabel>
          <ErrorText>{error}</ErrorText>
        </ErrorBox>
      )}

      {prediction !== null && (
        <Section>
          <SectionTitle>Prediction Result</SectionTitle>
          <ResultBox>
            <ResultLabel>Predicted Value</ResultLabel>
            <ResultValue>{prediction.toFixed(2)}</ResultValue>
          </ResultBox>

          <ResultBox style={{ marginTop: '15px' }}>
            <ResultLabel>Model Confidence</ResultLabel>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#1f78b4' }}>
              {(confidence * 100).toFixed(1)}%
            </div>
            <ConfidenceBar>
              <ConfidenceFill confidence={confidence} />
            </ConfidenceBar>
          </ResultBox>

          <InfoBox>
            <strong>Input Features:</strong> {features.join(', ')}
            {modelInfo && (
              <>
                <br />
                <strong>Model Type:</strong> {modelInfo.model_type}
              </>
            )}
          </InfoBox>
        </Section>
      )}

      {modelInfo && (
        <InfoBox>
          <strong>Model Information:</strong>
          <br />
          Model: {modelInfo.model_type}
          <br />
          Features: {modelInfo.feature_count}
          <br />
          Version: {modelInfo.version}
        </InfoBox>
      )}
    </Container>
  );
};

export default MLPredictorExtension;
