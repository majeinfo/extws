// ---------------------------------------------
// MongoDB Schema
// ---------------------------------------------
//
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var config = require('../config/local.js');

// Connect to MongoDB
mongoose.connect('mongodb://' + config.mongoUser + ':' + config.mongoPassword + '@' + config.mongoSrv + '/' + config.mongoDB);

// TODO: Must reconnect in case of error
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function (callback) {
	console.log('MongoDB Connection OK !');
});

// Event about sensor
var sensorEventSchema = new Schema({
	zid: String,
	updated: { type: Date, default: Date.now },
	data: Schema.Types.Mixed
});
var SensorEvent = mongoose.model('SensorEvent', sensorEventSchema);

// User with a paying account
var userSchema = new Schema({
	login: String,
	email: String,
	password: String,
	key: String,
	controllers: [String]	// array of zid
	// TODO: infos de payment, abonnement, adresse, etc...
});
var User = mongoose.model('User', userSchema);

// R-Pi definition
var controllerSchema = new Schema({
	zid: String,
	key: String	// owner
});
var Controller = mongoose.model('Controller', controllerSchema);

/*
var fluffy = new Kitten({ name: 'fluffy' });
fluffy.save(function (err, fluffy) {
  if (err) return console.error(err);
  fluffy.speak();
});
*/

module.exports.SensorEvent = SensorEvent;
module.exports.User = User;
module.exports.Controller = Controller;

// EOF
