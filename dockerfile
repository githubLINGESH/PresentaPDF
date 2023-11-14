# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Install any needed packages specified in package.json
RUN apt-get update && apt-get install -y \
    libx11-xcb1 libxcb1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 \
    libxss1 libxtst6 libnss3

# Install dependencies
COPY package*.json ./
RUN npm install
RUN npm install puppeteer-core@latest

# Install Chrome
RUN apt-get update && apt-get install -y google-chrome-stable

# Bundle app source
COPY . .

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.js when the container launches
CMD ["node", "server.js"]
