#!/bin/bash

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
  echo "Docker is not running or not properly configured."
  echo "Please start Docker and try again."
  exit 1
fi

# Check if Docker images exist
if ! docker image inspect visualization-python >/dev/null 2>&1; then
  echo "Python visualization Docker image not found."
  echo "Please run './build-docker.sh' first to build the required Docker images."
  exit 1
fi

if ! docker image inspect visualization-r >/dev/null 2>&1; then
  echo "R visualization Docker image not found."
  echo "Please run './build-docker.sh' first to build the required Docker images."
  exit 1
fi

# Function to start the backend server
start_backend() {
  echo "Starting backend server..."
  cd server
  npm start &
  BACKEND_PID=$!
  cd ..
  echo "Backend server started with PID: $BACKEND_PID"
}

# Function to start the frontend
start_frontend() {
  echo "Starting frontend application..."
  cd client
  npm start &
  FRONTEND_PID=$!
  cd ..
  echo "Frontend application started with PID: $FRONTEND_PID"
}

# Start both servers
start_backend
start_frontend

# Wait for user interrupt
echo ""
echo "Application started successfully!"
echo "Access the visualization app at: http://localhost:3000"
echo ""
echo "Press Ctrl+C to stop the application..."

# Capture SIGINT (Ctrl+C)
trap 'echo "Stopping application..."; kill $BACKEND_PID $FRONTEND_PID; exit 0' INT

# Keep the script running
wait