/* eslint-disable no-restricted-syntax */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable lines-between-class-members */
/* eslint-disable class-methods-use-this */
const httpStatus = require('http-status');
const AWS = require('aws-sdk');
const FileType = require('file-type');
const fs = require('fs');
const path = require('path');
const md5 = require('md5');
const moment = require('moment');
const { Op } = require('sequelize');
const FileDao = require('../dao/FileDao');
const responseHandler = require('../helper/responseHandler');
const config = require('../config/config');
const { providerConstant } = require('../config/constant');

class FileService {
    constructor() {
        AWS.config.update({
            accessKeyId: config.s3.accessKey,
            secretAccessKey: config.s3.secretKey,
            region: config.s3.region,
        });
        this.aws = new AWS.S3();
        this.fileDao = new FileDao();
    }

    postFile = async (req) => {
        try {
            if (!req.files || !req.files.file) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'No file attached.');
            }

            const fileContent = Buffer.from(req.files.file.data, 'binary');
            const { ext } = await FileType.fromBuffer(req.files.file.data);
            let fileName = `${this.generateRandomFileName()}.${ext}`;
            if (config.provider === providerConstant.S3) {
                fileName = await this.s3Upload(fileName, fileContent, ext);
            } else {
                await this.uploadFileLocally(fileName, fileContent);
            }
            if (!fileName) {
                return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong');
            }

            const { publicKey, privateKey } = this.generateFileKeys(fileName);
            await this.fileDao.create({
                file_name: fileName,
                private_key: privateKey,
                public_key: publicKey,
                last_activity_date: new Date(),
            });
            return responseHandler.returnSuccess(httpStatus.CREATED, 'File Uploaded', {
                publicKey,
                privateKey,
            });
        } catch (error) {
            console.log(error);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong');
        }
    };
    generateRandomFileName = () => {
        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        const random = `${Math.random()}`.substring(2, 8);
        return timestamp + random;
    };

    generateFileKeys = (fileName) => {
        console.log(fileName);
        return {
            publicKey: md5(`${fileName}_public`),
            privateKey: md5(`${fileName}_private`),
        };
    };

    uploadFileLocally = async (fileName, fileContent) => {
        try {
            const folderName = config.folder;
            const directoryPath = path.join(__dirname, '../../', folderName);

            console.log('directoryPath', directoryPath);
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }

            const filePath = path.join(directoryPath, fileName);
            fs.writeFileSync(filePath, fileContent);
            return true;
        } catch (e) {
            console.log(e);
            return false;
        }
    };
    getFile = async (req) => {
        try {
            const { publicKey } = req.params;
            const file = await this.fileDao.findOneByWhere({
                public_key: publicKey,
                is_delete: false,
            });
            if (!file) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, 'File not found!');
            }
            const folderName = config.folder;
            const directoryPath = path.join(__dirname, '../../', folderName);

            const filePath = `${directoryPath}/${file.file_name}`;

            if (!fs.existsSync(filePath)) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, 'File not found!');
            }
            const ext = path.extname(filePath).slice(1);
            const contentType = this.getContentType(ext);
            await this.fileDao.updateById({ last_activity_date: new Date() }, file.id);
            return responseHandler.returnSuccess(httpStatus.OK, 'File Found!', {
                filePath,
                contentType,
                fileName: file.file_name,
            });
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };
    getContentType = (ext) => {
        switch (ext) {
            case 'pdf':
                return 'application/pdf';
            case 'png':
                return 'image/png';
            case 'jpg':
            case 'jpeg':
                return 'image/jpeg';
            case 'gif':
                return 'image/gif';
            default:
                return 'application/octet-stream';
        }
    };

    deleteFile = async (req) => {
        try {
            const { privateKey } = req.params;
            const folderName = config.folder;
            const file = await this.fileDao.findOneByWhere({
                private_key: privateKey,
                is_delete: false,
            });
            if (!file) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, 'File not found!');
            }
            const directoryPath = path.join(__dirname, '../../', folderName);
            const filePath = `${directoryPath}/${file.file_name}`;
            if (!fs.existsSync(filePath)) {
                return responseHandler.returnError(httpStatus.NOT_FOUND, 'File not found!');
            }
            fs.unlinkSync(filePath);
            await this.fileDao.updateById({ is_delete: true }, file.id);
            return responseHandler.returnSuccess(httpStatus.OK, 'File removed successfully');
        } catch (e) {
            console.log(e);
            return responseHandler.returnError(httpStatus.BAD_REQUEST, 'Something went wrong!');
        }
    };

    s3Upload = async (fileName, fileContent, ext) => {
        try {
            const params = {
                Bucket: config.s3.bucket,
                Key: `${fileName}.${ext}`,
                Body: fileContent,
                ACL: 'public-read',
            };

            const response = await this.aws.upload(params).promise();

            if (response && response.Location) {
                return response.Location;
            }
            return false;
        } catch (e) {
            console.log(e);
            return false;
        }
    };

    removeInactiveFiles = async () => {
        try {
            const currentDate = moment();
            const activitLastTime = currentDate.subtract(config.maxInactivePeriodInDays, 'days');
            const files = await this.fileDao.findByWhere({
                last_activity_date: {
                    [Op.lte]: activitLastTime.format('YYYY-MM-DD HH:mm:ss'),
                },
            });
            if (files.length === 0) {
                return false;
            }
            const directoryPath = path.join(__dirname, '../../', config.folder);

            for (const file of files) {
                const filePath = `${directoryPath}/${file.file_name}`;
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
                this.fileDao.deleteByWhere({ id: file.id });
            }
            return true;
        } catch (e) {
            return false;
        }
    };
}

module.exports = FileService;
