const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.createTable(
        'phone_calls',
        {
          phone_call_id: {
            type: DataTypes.STRING,
            primaryKey: true,
            allowNull: false,
          },
          start_date_time: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          end_date_time: {
            type: DataTypes.DATE,
            allowNull: true,
          },
          transcript: {
            type: DataTypes.TEXT,
            allowNull: true,
          },
          customer_id: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
              model: 'customers',
              key: 'customer_id',
            },
          },
          phone_number: {
            type: DataTypes.STRING,
            allowNull: true,
          },
          job_id: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
              model: 'jobs',
              key: 'job_id',
            },
          },
          employee_id: {
            type: DataTypes.STRING,
            allowNull: true,
            references: {
              model: 'employees',
              key: 'employee_id',
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
      await queryInterface.dropTable('phone_calls', { transaction });
    });
  },
};
