FROM ubuntu:20.04

# update and install curl
RUN apt-get update && apt-get install -y curl

# install node js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt-get install -y nodejs

# verify installation
RUN node -v && npm -v

# set the working dir
WORKDIR /app

# copy the application
COPY . /app

# install dependencies
RUN npm install --production

# expose port
EXPOSE 5001

# command to run
CMD ["node", "server.js"]


# 1.3 GB
# # Official Node.js image
# FROM node:20-bullseye

# # Create app directory
# WORKDIR /usr/src/app

# # Copy package.json and package-lock.json
# COPY package*.json ./

# # Install app dependencies
# RUN npm install

# # Copy app source code
# COPY . .

# # Expose port and start application     
# EXPOSE 5001

# CMD ["npm", "start"]