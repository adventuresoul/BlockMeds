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
EXPOSE 3000

# command to run
CMD ["node", "index.js"]

