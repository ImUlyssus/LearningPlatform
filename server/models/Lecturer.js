module.exports = (sequelize, DataTypes) => {
  const Lecturer = sequelize.define('Lecturer', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: ''
    },
    bio: {
      type: DataTypes.STRING(500),
      allowNull: false,
      defaultValue: ''
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    can_share_info: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    },
    profile_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
  }, {
    tableName: 'lecturer',
    timestamps: true
  });

  return Lecturer;
}