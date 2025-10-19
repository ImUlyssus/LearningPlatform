module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.STRING,
      allowNull: false,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(200),  // short title
      allowNull: false,
    },
    thumbnail: {
      type: DataTypes.STRING,  // URL (255 is usually enough)
      allowNull: true,
    },
    link: {
      type: DataTypes.STRING,  // URL (255 is usually enough)
      allowNull: true,
    },
    skills: {
      type: DataTypes.JSON,  // list of skills as JSON array
      allowNull: false,
      defaultValue: []
    },
    overview: {
      type: DataTypes.TEXT,  // longer text
      allowNull: false,
    },
    what_you_will_learn: {
      type: DataTypes.JSON,  // max 6 items
      allowNull: false,
      defaultValue: []
    },
    status: {
      type: DataTypes.ENUM('draft', 'published'),
      allowNull: false,
      defaultValue: 'draft',
    },
    category: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    duration: {
      type: DataTypes.INTEGER,  // in minutes/hours depending on design
      allowNull: false,
      defaultValue: 0
    },
    cost: {
      type: DataTypes.INTEGER,  // or DECIMAL(10,2) if you want prices
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,  // or DECIMAL(10,2) if you want prices
      allowNull: false,
      defaultValue: false
    },
  }, {
    tableName: 'course',
    timestamps: true,
  });

  return Course;
};
