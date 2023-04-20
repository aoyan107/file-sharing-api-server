const app = require('./app');
const config = require('./config/config');
const redisClient = require('./config/redisClient');

console.log('Hello MeldCx task api is working!!');
require('./cronJobs');
// eslint-disable-next-line import/order
const http = require('http');
// socket initialization
const server = http.createServer(app);
// eslint-disable-next-line import/order
const io = require('socket.io')(server, { cors: { origin: '*' } });

global.io = io;
global.redisClient = redisClient;

server.listen(config.port, () => {
    console.log('SERVER');
    console.log(`Listening to port ${config.port}`);
});
