module.exports = (sequelize, DataTypes) => {
  const Sub_Course = sequelize.define('Sub_Course', {
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
      type: DataTypes.JSON,  // comma-separated list (or better: normalize into another table)
      allowNull: false,
      defaultValue: []
    },
    overview: {
      type: DataTypes.TEXT,  // longer text
      allowNull: false,
    },
    what_you_will_learn: {
      type: DataTypes.JSON,  // max 6 items, each 70 characters
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
  }, {
    tableName: 'sub_course',
    timestamps: true,
  });

  return Sub_Course;
};
