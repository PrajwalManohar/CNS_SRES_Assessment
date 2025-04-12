FROM r-base:latest

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libcairo2-dev \
    libxt-dev \
    && rm -rf /var/lib/apt/lists/*

# Install R packages for visualization
RUN R -e "install.packages(c('ggplot2', 'plotly', 'rgl', 'htmlwidgets', 'dplyr', 'rmarkdown'), repos='https://cran.rstudio.com/')"

# Create output directory
RUN mkdir -p /output
VOLUME /output

# Set permissions
RUN chmod -R 777 /output

# Default command
CMD ["R"]