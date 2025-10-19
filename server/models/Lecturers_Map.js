module.exports = (sequelize, DataTypes) => {
  const Lecturers_Map = sequelize.define('Lecturers_Map', {
    course_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    lecturer_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  }, {
    tableName: 'lecturers_map',
    timestamps: true
  });

  return Lecturers_Map;
}