# CNS_SRES_Assessment
Language Agnostic Visualization Web Application
A web application that allows users to generate and view visualizations by submitting custom scripts written in Python or R. The app executes these scripts on the backend and renders the resulting visualizations in the frontend.

# Overview
This project consists of two main components:

Frontend: A React application that provides a user interface for selecting a language, writing code, and viewing the generated visualizations.
Backend: A Node.js/Express server that executes the Python or R code in isolated Docker containers and returns the visualization results.

# Features

* Support for both Python and R scripting languages
* Built-in examples for various visualization types
* Support for static visualizations (Matplotlib, ggplot2)
* Support for interactive visualizations (Plotly)
* Support for 3D visualizations
* Isolated execution environments using Docker

# Prerequisites
Before running this application, you need to have the following installed:

1) Node.js (v14 or later)
2) npm (v6 or later)
3) Docker
4) Git

# Installation
1) Clone the Repository
git clone https://github.com/PrajwalManohar/CNS_SRES_Assessment.git

cd visualization-app

3) Backend Setup

Navigate to the server directory:

cd backend

Install dependencies:

npm install

Make sure Docker is running on your system:

docker --version

3) Frontend Setup

Navigate to the frontend directory:

cd ../frontend

Install dependencies:

npm install


4) Running the Application
   
A) Start the Backend Server

From the server directory:

npm start

This will start the server on port 5000 by default.

B) Start the Frontend Development Server

From the frontend directory:

npm start

This will start the React development server on port 3000 by default.

Open your browser and navigate to:

http://localhost:3000


# How to Use

1) Select a programming language (Python or R) from the dropdown.
   
2) Either choose one of the built-in examples or write your own visualization code.

3) Click the "Generate Visualization" button to execute the code.

4) The resulting visualization will be displayed in the visualization panel.

# Supported Libraries

1) Python

A) Matplotlib: A comprehensive library for creating static, animated, and interactive visualizations in Python.

B) Plotly: A graphing library for making interactive, publication-quality graphs.

c) Seaborn: A statistical data visualization library based on matplotlib.

2) R

1) ggplot2: A system for declaratively creating graphics, based on The Grammar of Graphics.
   
2) plotly: An R package for creating interactive web-based graphics via plotly.js.

3) rgl: Package for 3D visualization using OpenGL.


# Technical Implementation Details
1) Backend

Express.js: Used as the web server framework

Docker: Used to create isolated execution environments for running Python and R code

UUID: Used to generate unique IDs for each visualization

CORS: Enabled to allow cross-origin requests from the frontend

2) Frontend

React: Used as the frontend framework

Axios: Used for making HTTP requests to the backend API

CSS: Custom styling without additional UI libraries to keep it lightweight

3) Design Decisions
   
A) Security Considerations

The application uses Docker containers to isolate the execution of user-provided code, which helps prevent potential security issues. The code is executed in a sandboxed environment with limited access to the host system.

B) Performance Optimization

Visualizations are stored on the server and served statically, reducing rendering time

C) Extensibility

The architecture is designed to be easily extensible:
i) New visualization libraries can be added by updating the Docker images

ii) Support for additional programming languages can be added by creating new service modules

# Issues Encountered and Solutions
Issue 1: Docker Permission Issues
When running Docker commands from Node.js, permission issues were encountered on some systems.
Solution: The application checks for Docker permissions on startup and provides clear error messages if there are issues. For production environments, it's recommended to run the Node.js application with appropriate Docker permissions.

Issue 2: Large File Transfers
When generating large or complex visualizations, transferring the data between the Docker container and the host could be slow.
Solution: The application writes the visualization files directly to a shared volume mounted to both the Docker container and the host, minimizing data transfer overhead.

Issue 3: Displaying different File formats
When different visualizations were performed both image and html pages were rendered. UI logic was modified to handle both the cases.

Issue 4: Cross-Origin Resource Sharing (CORS)
During development, CORS issues were encountered when making requests from the frontend to the backend.
Solution: The backend server has CORS enabled, allowing requests from any origin during development. For production, this should be restricted to specific origins.

