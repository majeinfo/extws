// ----------------------------------------------------
// CONSUMER THAT READS SENSOREVENT TO POPULATE SENSORS
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
			if (!data[i].id) continue;

			var is_level_number = (data[i].metrics.level != 'on' && data[i].metrics.level != 'off');
			var level = (is_level_number) ? data[i].metrics.level : 0;
			var on_off = (data[i].metrics.on_off == 'on');
			var change = data[i].metrics.change;
			var sensor = new schema.Sensor({
				key: event.key,
				zid: event.zid,
				sid: data[i].id,
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
			});

			// Find the current value and update if exists or insert otherwise
			schema.Sensor.findOneAndUpdate({ key: sensor.key, sid: sensor.sid }, sensor, { upsert: true, new: true }, function(err) {
				if (err) console.log(err);
			});
		}

		lock = false;
	});
}

setInterval(handleOneSensorEvent, 10000);

// EOF
