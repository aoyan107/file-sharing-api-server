const SuperDao = require('./SuperDao');
const models = require('../models');

const File = models.file;

class FileDao extends SuperDao {
    constructor() {
        super(File);
    }
}

module.exports = FileDao;
