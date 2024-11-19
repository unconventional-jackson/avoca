const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'jobs',
        {
          job_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
          invoice_number: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          name: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          description: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          customer_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
              model: 'customers',
              key: 'customer_id',
            },
          },
          address_id: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
              model: 'customer_addresses',
              key: 'customer_address_id',
            },
          },
          notes: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          work_status: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          work_timestamps: {
            type: DataTypes.JSON,
            allowNull: true,
          },
          schedule: {
            type: DataTypes.JSON,
            allowNull: true,
          },
          total_amount: {
            type: DataTypes.FLOAT,
            allowNull: true,
          },
          outstanding_balance: {
            type: DataTypes.FLOAT,
            allowNull: true,
          },
          tags: {
            type: DataTypes.JSON,
            allowNull: true,
          },
          original_estimate_id: {
            type: DataTypes.STRING,
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
      await queryInterface.dropTable('jobs', { transaction });
    });
  },
};
