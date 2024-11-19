const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'customers',
        {
          id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
          first_name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          last_name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          company: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          mobile_number: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          home_number: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          work_number: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          notifications_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          tags: {
            type: DataTypes.JSON,
            allowNull: true,
          },
          lead_source: {
            type: DataTypes.STRING,
            allowNull: true,
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
      await queryInterface.dropTable('customers', { transaction });
    });
  },
};
