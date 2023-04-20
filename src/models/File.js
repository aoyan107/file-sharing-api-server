const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
    class File extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
    }

    File.init(
        {
            file_name: DataTypes.STRING,
            public_key: DataTypes.STRING,
            private_key: DataTypes.STRING,
            last_activity_date: DataTypes.DATE,
        },
        {
            sequelize,
            modelName: 'file',
            underscored: true,
        },
    );
    return File;
};
