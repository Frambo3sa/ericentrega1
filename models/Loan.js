module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define('Loan', {
    loanDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Loan.associate = (models) => {
    Loan.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user',
    });
    Loan.belongsTo(models.Book, {
      foreignKey: 'bookId',
      as: 'book',
    });
  };

  return Loan;
};
