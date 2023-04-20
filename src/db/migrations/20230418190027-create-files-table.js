/** @type {import('sequelize-cli').Migration} */
module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('files', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            file_name: {
                type: Sequelize.STRING,
            },
            public_key: {
                type: Sequelize.STRING,
            },
            private_key: {
                type: Sequelize.STRING,
            },
            is_delete: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            last_activity_date: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            created_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updated_at: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('files');
    },
};
