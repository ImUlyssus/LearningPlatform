module.exports = (sequelize, DataTypes) => {
  const Quizzes = sequelize.define('Quizzes', {
    lecture_id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    // Removed the top-level 'type' field, as each QA object will now contain its own type.
    // If you need a general 'quiz_type' (e.g., 'assessment', 'practice'), you can keep it.

    qa_data: { // This will store the array of JSON objects
      type: DataTypes.JSON, // Use JSON data type
      allowNull: false,
      defaultValue: [], // Default to an empty array
      // For PostgreSQL, you might prefer DataTypes.JSONB for better performance
      // and indexing capabilities if you ever need to query *inside* the JSON.
      // Sequelize's DataTypes.JSON often maps to JSONB in Postgres automatically.
    },
    min_score_to_pass: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
  }, {
    tableName: 'quizzes',
    timestamps: true,
  });

  return Quizzes;
};
