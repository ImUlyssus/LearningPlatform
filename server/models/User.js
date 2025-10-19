module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    user_role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: '1000',
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    birth_year: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    city: {
      type: DataTypes.STRING,
      allowNull: true
    },
    gender: {
      type: DataTypes.ENUM("Male", "Female", "Other", "Prefer not to say"),
      allowNull: true,
      defaultValue: "Prefer not to say"
    },
    one_yr_membership: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    membership_start_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    profile_url: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true, // Null after verification
    },
    verificationTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true, // Null after verification
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true, // Null after password reset
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true, // Null after password reset
    },
  }, {
    tableName: 'user',
    timestamps: true
  });

  return User;
}