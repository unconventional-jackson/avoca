const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'employees',
        {
          employee_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
          email: {
            type: DataTypes.STRING,
            allowNull: false,
          },
          last_active_at: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          auth_password_hash: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          auth_email_verified: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          auth_status: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          auth_totp_secret: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          auth_totp_enabled: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
          },
          auth_totp_verified_at: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          auth_refresh_token: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          avatar_url: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          color_hex: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          first_name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          last_name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          mobile_number: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          role: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          permissions: {
            type: DataTypes.JSON,
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
      await queryInterface.dropTable('employees', { transaction });
    });
  },
};
