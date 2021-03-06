var mongoose = require('mongoose');

var env = process.env.NODE_ENV || 'development';

config = require('./config/mongo')[env];

module.exports = function() {
  var envUrl = process.env[config.use_env_variable];

  var localUrl = `mongodb://${config.host}/${config.database}`;

  var mongoUrl = envUrl ? envUrl : localUrl;

  return mongoose.connect(mongoUrl);
}