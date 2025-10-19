// ecosystem.config.js (New simplified version)
module.exports = {
  apps: [{
    name: 'websitename-server',
    script: 'server.js',
    instances: "max", 
    autorestart: true,
    watch: false
  }]
};
