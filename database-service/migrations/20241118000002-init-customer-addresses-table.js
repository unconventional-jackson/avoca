const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'addresses',
        {
          id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
          street: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          street_line_2: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          city: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          city: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          state: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          zip: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          country: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          customer_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
              model: 'customers',
              key: 'id',
            },
          },
          created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
          },
          updated_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
          },
        },
        {
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.dropTable('addresses', { transaction });
    });
  },
};
