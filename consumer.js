// ----------------------------------------------------
// CONSUMER THAT READS SENSOREVENT TO POPULATE SENSORS
//
// TODO: should be rewritten to be asynchronous
// ----------------------------------------------------
//
var config = require('./config/local.js');
var schema = require('./modules/schema.js');
 
var lock = false;

/** 
 * Get older sensorevent
 */
function handleOneSensorEvent()
{
	if (lock) return;
	lock = true;

	schema.SensorEvent.findOneAndRemove({}, { sort: { 'updated': 1 }}, function(err, event) {
		if (err) {
			console.log(err);
			lock = false;
			return;
		}
		if (!event) {
			lock = false;
			return;
		}
		console.log(event);

		// Sanity checks
		if (!event.zid || !event.key || !event.data || !event.updated) {
			console.log('Incomplete sensorevent: skipped');
			lock = false;
			return;
		}

		for (i in event.data) {
			// Sanity checks
			var data = event.data;
			if (!data[i].devid || !data[i].instid || !data[i].sid) {
				console.log('Missing devid or instid or sid in event');
				continue;
			}

			var is_level_number = (data[i].metrics.level != 'on' && data[i].metrics.level != 'off');
			var level = (is_level_number) ? data[i].metrics.level : 0;
			var on_off = (data[i].metrics.level == 'on');
			var change = data[i].metrics.change;
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
					is_level_number: is_level_number,
					level: level,
					on_off: on_off,
					change: change
				}
			};

			// Find the current value and update if exists or insert otherwise
			schema.Sensor.findOneAndUpdate({ key: sensor.key, devid: sensor.devid, instid: sensor.instid, sid: sensor.sid }, sensor, { upsert: true, new: true }, function(err) {
				if (err) console.log(err);
			});

			// Also historize the Event
			// TODO: don't store if previous value is identical
			new schema.History(sensor).save();
		}

		lock = false;
	});
}

setInterval(handleOneSensorEvent, 1000);

// EOF
