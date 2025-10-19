module.exports = (sequelize, DataTypes) => {
  const Module = sequelize.define('Module', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),  // short title
      allowNull: false,
    },
    duration: {
      type: DataTypes.INTEGER,  // in minutes/hours depending on design
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'module',
    timestamps: true,
  });

  return Module;
};
