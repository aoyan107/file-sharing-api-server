const cron = require('node-cron');
const FileService = require('./service/FileService');
// schedule tasks to be run on the server
cron.schedule('0 0 * * *', () => {
    const fileService = new FileService();
    fileService.removeInactiveFiles();
});
