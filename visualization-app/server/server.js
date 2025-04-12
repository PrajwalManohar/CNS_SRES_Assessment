const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const Docker = require('dockerode');
const morgan = require('morgan');

// Initialize Express app
const app = express();
const port = process.env.PORT || 5000;

// Initialize Docker
const docker = new Docker();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Serve static files from the visualizations directory
// app.use('/visualizations', express.static(path.join(__dirname, 'visualizations')));

app.use('/visualizations', express.static(path.resolve(__dirname, 'visualizations')));
console.log('Visualizations directory:', path.resolve(__dirname, 'visualizations'));

// Create directories if they don't exist
fs.ensureDirSync(path.join(__dirname, 'uploads'));
fs.ensureDirSync(path.join(__dirname, 'visualizations'));

// API endpoint for visualization
app.post('/api/visualize', async (req, res) => {
  try {
    const { language, code } = req.body;
    
    if (!language || !code) {
      return res.status(400).json({ message: 'Language and code are required' });
    }
    
    // Generate unique ID for this request
    const jobId = uuidv4();
    const workDir = path.join(__dirname, 'uploads', jobId);
    const outputDir = path.join(__dirname, 'visualizations', jobId);
    
    // Create directories
    await fs.ensureDir(workDir);
    await fs.ensureDir(outputDir);
    
    // Write code to file
    const codeFilename = language === 'python' ? 'script.py' : 'script.R';
    await fs.writeFile(path.join(workDir, codeFilename), code);
    
    // Prepare Docker configuration
    const containerConfig = {
      Image: language === 'python' ? 'visualization-python' : 'visualization-r',
      Cmd: language === 'python' ? ['python', '/app/script.py'] : ['Rscript', '/app/script.R'],
      HostConfig: {
        AutoRemove: true,
        Binds: [
          `${workDir}:/app`,
          `${outputDir}:/output`
        ]
      }
    };
    
    // Run the container
    const container = await docker.createContainer(containerConfig);
    await container.start();
    
    // Wait for container to finish
    const stream = await container.logs({
      follow: true,
      stdout: true,
      stderr: true
    });
    
    // Collect logs
    let logs = '';
    stream.on('data', (chunk) => {
      logs += chunk.toString('utf8');
    });
    
    // Wait for container to finish
    await new Promise((resolve) => {
      container.wait((err, data) => {
        console.log(`Container exited with code ${data.StatusCode}`);
        resolve();
      });
    });
    
    // Check if output file exists
    const outputFiles = await fs.readdir(outputDir);
    if (outputFiles.length === 0) {
      // Clean up
      await fs.remove(workDir);
      return res.status(500).json({ message: 'No visualization was generated', logs });
    }
    
    // Find the visualization file
    const visualizationFile = outputFiles.find(file => 
      file.endsWith('.png') || file.endsWith('.html') || file.endsWith('.svg')
    );
    
    if (!visualizationFile) {
      // Clean up
      await fs.remove(workDir);
      return res.status(500).json({ message: 'No valid visualization file found', logs });
    }
    
    // Return the URL to the visualization
    const visualizationUrl = `/visualizations/${jobId}/${visualizationFile}`;
    
    // Clean up the uploads directory
    await fs.remove(workDir);
    
    return res.status(200).json({
      visualizationUrl,
      logs
    });
    
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'Server error', error: error.toString() });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

app.use(cors({
    origin: 'http://localhost:3000',
    credentials: true,
    exposedHeaders: ['Content-Type', 'Content-Disposition']
  }));

// Update your direct-image route to handle all file types
app.get('/direct-viz/:jobId/:filename', async (req, res) => {
    try {
      const { jobId, filename } = req.params;
      const filePath = path.join(__dirname, 'visualizations', jobId, filename);
      
      console.log('Direct visualization request for:', filePath);
      
      // Check if the file exists
      if (!fs.existsSync(filePath)) {
        console.error('File not found:', filePath);
        return res.status(404).send('File not found');
      }
      
      // Get file extension to determine content type
      const fileExt = path.extname(filePath).toLowerCase();
      
      // Set appropriate content type based on file extension
      if (fileExt === '.png') {
        res.setHeader('Content-Type', 'image/png');
      } else if (fileExt === '.html') {
        res.setHeader('Content-Type', 'text/html');
      } else if (fileExt === '.svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
      } else {
        // Default content type
        res.setHeader('Content-Type', 'application/octet-stream');
      }
      
      // Get file stats
      const stats = fs.statSync(filePath);
      console.log('File stats:', stats);
      
      // Set other headers
      res.setHeader('Content-Length', stats.size);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      // Stream the file
      const fileStream = fs.createReadStream(filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving direct visualization:', error);
      res.status(500).send('Error serving visualization');
    }
  });