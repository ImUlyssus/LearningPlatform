module.exports = (sequelize, DataTypes) => {
  const Enrolled_Courses = sequelize.define('Enrolled_Courses', {
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    course_id: {
      type: DataTypes.STRING,
      allowNull: false
    },
    enrolled_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    discount_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    quizzes_info: {
      type: DataTypes.JSON, // Store quiz IDs, min score to pass and score received as JSON
      allowNull: true,
      defaultValue: []
    },
    completed: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    }
  }, {
    tableName: 'enrolled_courses',
    timestamps: true
  });

  return Enrolled_Courses;
}