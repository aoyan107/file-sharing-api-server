const httpStatus = require('http-status');
const fs = require('fs');
const FileService = require('../service/FileService');
const logger = require('../config/logger');

class AuthController {
    constructor() {
        this.fileService = new FileService();
    }

    postFile = async (req, res) => {
        try {
            const responseData = await this.fileService.postFile(req);
            res.status(responseData.statusCode).send(responseData.response);
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send({
                status: false,
                code: httpStatus.BAD_GATEWAY,
                message: 'Something went wrong!',
            });
        }
    };

    getFile = async (req, res) => {
        try {
            const responseData = await this.fileService.getFile(req);
            if (responseData.statusCode === httpStatus.OK) {
                const { filePath, fileName, contentType } = responseData.response.data;
                const fileStream = fs.createReadStream(filePath);

                res.set({
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${fileName}"`,
                });

                fileStream.pipe(res);
            } else {
                res.status(responseData.statusCode).send(responseData.response);
            }
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send({
                status: false,
                code: httpStatus.BAD_GATEWAY,
                message: 'Something went wrong!',
            });
        }
    };

    deleteFile = async (req, res) => {
        try {
            const responseData = await this.fileService.deleteFile(req);
            res.status(responseData.statusCode).send(responseData.response);
        } catch (e) {
            logger.error(e);
            res.status(httpStatus.BAD_GATEWAY).send({
                status: false,
                code: httpStatus.BAD_GATEWAY,
                message: 'Something went wrong!',
            });
        }
    };
}

module.exports = AuthController;
