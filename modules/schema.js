// --------------------------------------------------------------------
// MongoDB Schema
//
// Set environment variable LEVEL to 'debug' to debug mongoose
// --------------------------------------------------------------------
//
var mongoose = require('mongoose'),
    config = require('../config/local.js'),
    logger = require('../modules/logger.js');
var Schema = mongoose.Schema;

// Connect to MongoDB
var dbURI = 'mongodb://' + config.mongoUser + ':' + config.mongoPassword + '@' + config.mongoSrv + '/' + config.mongoDB;
mongoose.set('debug', process.env.LEVEL);

function connectToMongo() {
	mongoose.connect(dbURI, {server:{auto_reconnect:true}});
}

var db = mongoose.connection;
db.on('error', function(err) {
	logger.error('MongoDB connection error:', err);
	mongoose.disconnect();
});
db.on('connected', function() {
	logger.info('MongoDB connected!');
});
db.once('open', function (callback) {
	logger.info('MongoDB Connection OK !');
});
db.on('reconnected', function () {
	logger.info('MongoDB reconnected!');
});
db.on('disconnected', function() {
	logger.error('MongoDB disconnected!');
	setTimeout(connectToMongo, 5000);
});
connectToMongo();

// Saved Configuration
var configSchema = new Schema({
	key: String,
	zid: String,
	updated: { type: Date, default: Date.now },
	config: Schema.Types.Mixed
}, { versionKey: false });
var Config = mongoose.model('Config', configSchema);

// Event about sensor
var eventSchema = new Schema({
	key: String,
	zid: String,
	evttype: String,
	updated: { type: Date, default: Date.now },
	data: Schema.Types.Mixed
}, { versionKey: false });
var Event = mongoose.model('Event', eventSchema);

// Logs
var logSchema = new Schema({
	key: String,
	date : Date,
	level: String,
	msg: String
}, { versionKey: false });
var Log = mongoose.model('Log', logSchema);

// Sensors
var sensorSchema = new Schema({
	key: String,
	zid: String,
	devid: String,
	instid: String,
	sid: String,
	description: String,
	devtype: String,
	tags: Array,
	metrics: {
		probeTitle: String,
		scaleTitle: String,
		is_level_number: Boolean,  // level or on_off ?
		level: Number,
		on_off: Boolean,
		change: String 
	},
	last_update: Date
}, { versionKey: false });
var Sensor = mongoose.model('Sensor', sensorSchema);

// History
var historySchema = new Schema({
	key: String,
	zid: String,
	devid: String,
	instid: String,
	sid: String,
	description: String,
	devtype: String,
	tags: Array,
	metrics: {
		probeTitle: String,
		scaleTitle: String,
		is_level_number: Boolean,  // level or on_off ?
		level: Number,
		on_off: Boolean,
		change: String 
	},
	last_update: Date
}, { versionKey: false });
var History = mongoose.model('History', historySchema);

// Command back to Controller
var commandSchema = new Schema({
	key: String,
	zid: String,
	cmd: String,
	parms: String,	// JSON Format
	create_time: Date
}, { versionKey: false });
var Command = mongoose.model('Command', commandSchema);

// User with a paying account
var userSchema = new Schema({
	login: String,
	email: String,
	password: String,
	key: String,
	controllers: [String]	// array of zid
	// TODO: infos de payment, abonnement, adresse, etc...
}, { versionKey: false });
var User = mongoose.model('User', userSchema);

// R-Pi definition
var controllerSchema = new Schema({
	zid: String,
	key: String,	// owner
	doversion: { type: String, default: '' },
	description: { type: String, default: '' },
	login: { type: String, default: '' },
	timezone: { type: String, default: '' }
});
var Controller = mongoose.model('Controller', controllerSchema);

module.exports.Event = Event;
module.exports.Sensor = Sensor;
module.exports.User = User;
module.exports.Controller = Controller;
module.exports.Command = Command;
module.exports.Config = Config;
module.exports.History = History;
module.exports.Log = Log;

// EOF
