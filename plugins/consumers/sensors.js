// ----------------------------------------------------
// Consumer of "sensors" Events    
// ----------------------------------------------------
//
var schema = require('../../modules/schema'),
    logger = require('../../modules/logger');

module.exports.doConsume = function(event) {
        logger.debug('Consume Sensor Events');
	for (i in event.data) {
		// Sanity checks
		var data = event.data;
		if (!data[i].devid || !data[i].instid || !data[i].sid) {
			logger.error('Missing devid or instid or sid in event');
			continue;
		}

		var sensor = {
			key: event.key,
			zid: event.zid,
			devid: data[i].devid,
			instid: data[i].instid,
			sid: data[i].sid,
			last_update: event.updated,
			description: data[i].metrics.title,
			devtype: data[i].deviceType,
			//tags: data[i].tags,
			metrics: {
				probeTitle: data[i].metrics.probeTitle,
				scaleTitle: data[i].metrics.scaleTitle,
				is_level_number: data[i].is_level_number,
				level: data[i].level,
				on_off: data[i].on_off,
				change: data[i].change
			}
		};

		// Find the current value and update if exists or insert otherwise
		schema.Sensor.findOneAndUpdate({ key: sensor.key, devid: sensor.devid, instid: sensor.instid, sid: sensor.sid }, 
						sensor, { upsert: true, new: true }, function(err) {
			if (err) logger.error(err);
		});

		// Also historize the Event
		var histo = {
        		key: event.key,
			zid: event.zid,
			evttype: 'sensorevt',
			updated: event.updated,
			data: sensor
		};
		new schema.History(histo).save();
	}

	return true;
};

// EOF

