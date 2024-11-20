const { DataTypes } = require('sequelize');
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.addColumn(
        'jobs',
        'scheduled_start',
        {
          type: DataTypes.DATE,
          allowNull: true,
        },
        {
          transaction,
        }
      );
      await queryInterface.addColumn(
        'jobs',
        'scheduled_end',
        {
          type: DataTypes.DATE,
          allowNull: true,
        },
        {
          transaction,
        }
      );
    });
  },

  async down(queryInterface) {
    return queryInterface.sequelize.transaction(async (transaction) => {
      await queryInterface.removeColumn('jobs', 'scheduled_end', { transaction });
      await queryInterface.removeColumn('jobs', 'scheduled_start', { transaction });
    });
  },
};
