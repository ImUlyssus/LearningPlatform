module.exports = (sequelize, DataTypes) => {
  const Lectures = sequelize.define('Lectures', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),  // short title
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('reading', 'video', 'quiz'),
      allowNull: false,
      defaultValue: 'reading',
    },
    link: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    slides: {
      type: DataTypes.STRING,
      allowNull: true, // optional, URL to slides or additional resources
    },
    duration: {
      type: DataTypes.INTEGER,  // in minutes
      allowNull: false,
      defaultValue: 0
    }
  }, {
    tableName: 'lectures',
    timestamps: true,
  });

  return Lectures;
};
