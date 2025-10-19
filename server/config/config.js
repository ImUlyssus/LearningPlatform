
module.exports = {
  development: {
    username: process.env.DEVELOPMENT_USERNAME,
    password: process.env.DEVELOPMENT_PASSWORD,
    database: process.env.DEVELOPMENT_DATABASE,
    host: process.env.DEVELOPMENT_HOST,
    frontend_url: process.env.FRONTEND_URL_DEVELOPMENT,
    dialect: 'mysql'
  },
  testing: {
    username: process.env.TEST_USERNAME,
    password: process.env.TEST_PASSWORD,
    database: process.env.TEST_DATABASE,
    host: process.env.TEST_HOST,
    frontend_url: process.env.FRONTEND_URL_TESTING,
    dialect: 'mysql'
  },
  production: {
    username: process.env.PRODUCTION_USERNAME,
    password: process.env.PRODUCTION_PASSWORD,
    database: process.env.PRODUCTION_DATABASE,
    host: process.env.PRODUCTION_HOST,
    frontend_url: process.env.FRONTEND_URL_PRODUCTION,
    dialect: 'mysql'
  }
};
