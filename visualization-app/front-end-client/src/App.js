import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Spinner, Alert } from 'react-bootstrap';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState('');
  const [visualizationUrl, setVisualizationUrl] = useState('');
  const [visualizationType, setVisualizationType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Set default code based on selected language
  const getDefaultCode = (lang) => {
    if (lang === 'python') {
      return `import matplotlib.pyplot as plt
import numpy as np

# Generate data
categories = ['A', 'B', 'C', 'D', 'E']
values = [25, 40, 30, 55, 15]

# Create bar chart
plt.figure(figsize=(10, 6))
plt.bar(categories, values, color='skyblue')
plt.title('Simple Bar Chart')
plt.xlabel('Categories')
plt.ylabel('Values')
plt.grid(axis='y', linestyle='--', alpha=0.7)

# Save the figure - IMPORTANT: always save to /output/
plt.savefig('/output/visualization.png')
`;
    } else {
      return `library(ggplot2)

# Generate data
data <- data.frame(
  category = c('A', 'B', 'C', 'D', 'E'),
  value = c(25, 40, 30, 55, 15)
)

# Create bar chart
p <- ggplot(data, aes(x = category, y = value, fill = category)) +
  geom_bar(stat = "identity", width = 0.6) +
  labs(title = "Simple Bar Chart",
       x = "Categories",
       y = "Values") +
  theme_minimal() +
  theme(legend.position = "none")

# Save the figure - IMPORTANT: always save to /output/
ggsave("/output/visualization.png", p, width = 8, height = 6, dpi = 300)
`;
    }
  };

  // Update code when language changes
  useEffect(() => {
    setCode(getDefaultCode(language));
  }, [language]);

  // Debug: Log when visualization URL changes
  useEffect(() => {
    console.log("Visualization URL updated:", visualizationUrl);
  }, [visualizationUrl]);

  const handleLanguageChange = (e) => {
    setLanguage(e.target.value);
  };

  const handleCodeChange = (value) => {
    setCode(value);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log("Sending request to backend...");
      const response = await axios.post('http://localhost:5000/api/visualize', {
        language,
        code
      });
      
      console.log("Response data:", response.data);
      
      // Parse the URL to extract jobId and filename
      if (response.data && response.data.visualizationUrl) {
        const urlParts = response.data.visualizationUrl.split('/');
        const jobId = urlParts[2]; // The UUID
        const filename = urlParts[3]; // The filename
        
        // Use the direct viz endpoint instead
        const directVizUrl = `http://localhost:5000/direct-viz/${jobId}/${filename}`;
        console.log("Using direct visualization URL:", directVizUrl);
        
        // Add a timestamp to force refresh
        const urlWithTimestamp = `${directVizUrl}?t=${new Date().getTime()}`;
        
        // Detect visualization type from filename extension
        const fileExt = filename.split('.').pop().toLowerCase();
        
        setVisualizationUrl(urlWithTimestamp);
        setVisualizationType(fileExt); // Store the type in state
      } else {
        setError('No visualization URL returned from the server');
        console.error('Missing visualization URL in response', response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred');
      console.error('Error generating visualization:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="app-container py-4">
      <h1 className="text-center mb-4">Visualization Generator</h1>
      
      <Row>
        <Col md={6}>
          <Form.Group className="mb-3">
            <Form.Label>Select Language:</Form.Label>
            <Form.Select value={language} onChange={handleLanguageChange}>
              <option value="python">Python</option>
              <option value="r">R</option>
            </Form.Select>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Enter Code:</Form.Label>
            <div className="editor-container">
              <Editor
                height="500px"
                language={language === 'python' ? 'python' : 'r'}
                value={code}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                }}
              />
            </div>
          </Form.Group>
          
          <Button 
            variant="primary" 
            onClick={handleSubmit} 
            disabled={loading}
            className="mb-3 w-100"
          >
            {loading ? (
              <>
                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                <span className="ms-2">Processing...</span>
              </>
            ) : 'Generate Visualization'}
          </Button>
          
          {error && <Alert variant="danger">{error}</Alert>}
        </Col>
        
        <Col md={6}>
          <div className="visualization-container">
            <h3 className="mb-3">Visualization Result</h3>
            {visualizationUrl ? (
  <div className="visualization-wrapper">
    {visualizationType === 'png' || visualizationType === 'svg' ? (
      // For image types (PNG, SVG)
      <img 
        src={visualizationUrl} 
        alt="Visualization" 
        className="visualization-image"
        style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
        onError={(e) => {
          console.error("Error loading image:", e);
          setError("Error loading the visualization. Please check server logs.");
        }}
      />
    ) : visualizationType === 'html' ? (
      // For HTML (interactive and 3D visualizations)
      <iframe
        src={visualizationUrl}
        title="Interactive Visualization"
        className="visualization-frame"
        style={{ 
          width: '100%', 
          height: '100%', 
          border: 'none',
          minHeight: '500px'
        }}
        sandbox="allow-scripts allow-same-origin"
        onError={(e) => {
          console.error("Error loading iframe:", e);
          setError("Error loading the interactive visualization.");
        }}
      />
    ) : (
      // Fallback for unknown types
      <div className="visualization-fallback">
        <p>Visualization generated but cannot be displayed in browser.</p>
        <a href={visualizationUrl} target="_blank" rel="noopener noreferrer">
          Download Visualization
        </a>
      </div>
    )}
  </div>
) : (
  <div className="empty-visualization">
    <p>No visualization generated yet. Submit your code to see the result.</p>
  </div>
)}
          </div>
        </Col>
      </Row>
    </Container>
  );
}

export default App;