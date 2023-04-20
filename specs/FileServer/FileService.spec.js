/* eslint-disable no-unused-expressions */
const chai = require('chai');
const FileType = require('file-type');
const fs = require('fs');

const { expect } = chai;
const sinon = require('sinon');
const httpStatus = require('http-status');
const FileService = require('../../src/service/FileService');
const FileDao = require('../../src/dao/FileDao');
const models = require('../../src/models');
const responseHandler = require('../../src/helper/responseHandler');

const File = models.file;

let fileService;
describe('File Server API test', () => {
    let req;
    let fileTypeStub;
    let generateRandomFileNameStub;
    let s3UploadStub;
    let uploadFileLocallyStub;
    let generateFileKeysStub;
    let fileDaoStub;

    beforeEach(() => {
        fileService = new FileService();
        req = {
            files: {
                file: {
                    data: 'file data',
                },
            },
        };
        fileTypeStub = sinon.stub(FileType, 'fromBuffer').resolves({ ext: 'png' });
        generateRandomFileNameStub = sinon
            .stub(fileService, 'generateRandomFileName')
            .returns('randomFileName');
        s3UploadStub = sinon.stub(fileService, 's3Upload').resolves('uploadedFileName');
        uploadFileLocallyStub = sinon.stub(fileService, 'uploadFileLocally').resolves();
        generateFileKeysStub = sinon.stub(fileService, 'generateFileKeys').returns({
            publicKey: 'publicKey',
            privateKey: 'privateKey',
        });
        fileDaoStub = sinon.stub(FileDao.prototype, 'create').resolves();
    });

    afterEach(() => {
        fileTypeStub.restore();
        generateRandomFileNameStub.restore();
        s3UploadStub.restore();
        uploadFileLocallyStub.restore();
        generateFileKeysStub.restore();
        fileDaoStub.restore();
    });
    it('should return an error if no file is attached', async () => {
        req.files = null;
        const result = await fileService.postFile(req);
        expect(result).to.deep.equal(
            responseHandler.returnError(httpStatus.BAD_REQUEST, 'No file attached.'),
        );
    });

    it('should upload the file and return keys if the file is uploaded successfully', async () => {
        const result = await fileService.postFile(req);
        expect(result).to.deep.equal(
            responseHandler.returnSuccess(httpStatus.CREATED, 'File Uploaded', {
                publicKey: 'publicKey',
                privateKey: 'privateKey',
            }),
        );
    });

    it('should return an error if file is not found', async () => {
        sinon.stub(FileDao.prototype, 'findOneByWhere').resolves(null);
        const result = await fileService.getFile({ params: { publicKey: 'publicKey' } });
        expect(result.statusCode).to.equal(httpStatus.NOT_FOUND);
        expect(result.response.message).to.equal('File not found!');
    });

    it('should return an error if file path does not exist', async () => {
        const existsSync = sinon.stub(fs, 'existsSync').returns(false);
        const result = await fileService.getFile({ params: { publicKey: 'publicKey' } });
        expect(result.statusCode).to.equal(httpStatus.NOT_FOUND);
        expect(result.response.message).to.equal('File not found!');
        existsSync.restore();
    });

    it('should return an error if file not found', async () => {
        const result = await fileService.deleteFile({ params: { privateKey: 'abc123' } });

        expect(
            fileDaoStub.calledOnceWithExactly({
                private_key: 'abc123',
                is_delete: false,
            }),
        ).to.be.false;
        expect(result).to.deep.equal(
            responseHandler.returnError(httpStatus.NOT_FOUND, 'File not found!'),
        );
    });

    it('should return an error if file not found in directory', async () => {
        sinon.stub(fs, 'existsSync').returns(false);

        const result = await fileService.deleteFile({ params: { privateKey: 'abc123' } });

        expect(result).to.deep.equal(
            responseHandler.returnError(httpStatus.NOT_FOUND, 'File not found!'),
        );
    });
});
