FROM python:3.9-slim

WORKDIR /app

# Install dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libffi-dev \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages for visualization
RUN pip install --no-cache-dir \
    matplotlib \
    numpy \
    pandas \
    plotly \
    seaborn \
    scikit-learn \
    plotly \
    kaleido \
    dash

# Create output directory
RUN mkdir -p /output
VOLUME /output

# Set permissions
RUN chmod -R 777 /output

# Default command
CMD ["python"]