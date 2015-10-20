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

var sensorEventSchema = new Schema({
	zid: String,
	updated: { type: Date, default: Date.now },
	data: Schema.Types.Mixed
});

var SensorEvent = mongoose.model('SensorEvent', sensorEventSchema);

/*
var fluffy = new Kitten({ name: 'fluffy' });
fluffy.save(function (err, fluffy) {
  if (err) return console.error(err);
  fluffy.speak();
});
*/

module.exports.SensorEvent = SensorEvent;

// EOF
