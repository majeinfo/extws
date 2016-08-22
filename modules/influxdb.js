// ----------------------------------------------------
// INSERT DATA IN INFLUXDB
// ----------------------------------------------------
//
var influx = require('influx'),
    config = require('../config/local.js'),
    logger = require('../modules/logger.js');
 
var client = undefined;
var seriename = 'controller';

// Connect to InfluxDB if needed
if (config.use_influxdb) {
	client = influx({ 
		host: config.influxSrv, 
		port: config.influxPort, 
		username: config.influxUser, 
		password: config.influxPassword, 
		database: config.influxDB 
	});
}

module.exports.write = function(event) {
	if (!client) return;
	var tags = { 
		devid: event.devid, 
		instid: event.instid, 
		sid: event.sid 
	};
	var values = { 
		time: event.updated, 
		is_level_number: event.metrics.is_level_number, 
		level: event.metrics.level,
		on_off: event.metrics.on_off, 
		change: (event.metrics.change) ? true: false
	};

	client.writePoint(seriename + event.key, values, tags, function(err, resp) {
		if (err) {
			logger.error('Influx.writePoint Error: ', err);
		}
	});
};

