module.exports = (sequelize, DataTypes) => {
  const Saved_Courses = sequelize.define('Saved_Courses', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_id: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'saved_courses',
    timestamps: true
  });

  return Saved_Courses;
}