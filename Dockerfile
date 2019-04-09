FROM node:10

RUN mkdir -p /app
COPY package.json /app
WORKDIR /app

RUN npm install

EXPOSE 3000