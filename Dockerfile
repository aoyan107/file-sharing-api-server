FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

EXPOSE 5000

CMD [ "node", "src/index.js" ]
