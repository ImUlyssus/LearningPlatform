module.exports = (sequelize, DataTypes) => {
  const Certificates = sequelize.define('Certificates', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    completed_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  }, {
    tableName: 'certificates',
    timestamps: true
  });

  return Certificates;
}