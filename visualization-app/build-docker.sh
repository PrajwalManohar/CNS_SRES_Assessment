#!/bin/bash

# Create docker directory if it doesn't exist
mkdir -p docker/python
mkdir -p docker/r

# Move Dockerfiles to their respective directories
cp docker/Dockerfile.python docker/python/Dockerfile
cp docker/Dockerfile.r docker/r/Dockerfile

# Build Python image
echo "Building Python image..."
docker build -t visualization-python docker/python

# Build R image
echo "Building R image..."
docker build -t visualization-r docker/r

echo "Docker images built successfully!"