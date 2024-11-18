const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'users',
        {
          user_id: {
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
          auth_email_verification_token: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          auth_reset_password_token: {
            type: DataTypes.STRING,
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
      await queryInterface.dropTable('users', { transaction });
    });
  },
};
