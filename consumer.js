// ----------------------------------------------------
// CONSUMER THAT READS SENSOREVENT TO POPULATE SENSORS
//
// TODO: should be rewritten to be asynchronous
// ----------------------------------------------------
//
var fs = require('fs'),
    config = require('./config/local.js'),
    logger = require('./modules/logger.js'),
    schema = require('./modules/schema.js');
 
var lock = false;

// Load the Consumer Plugins
var _consumerPlugins = {};
var _plugFiles = fs.readdirSync('./plugins/consumers');
logger.debug(_plugFiles);
for (plug in _plugFiles) {
        var parts = _plugFiles[plug].split('.');
        if (parts.length != 2 || parts[1] != 'js') {
                logger.info('Plugin name ' + _plugFiles[plug] + ' ignored');
                continue;
        }
        plugname = parts[0];
        _consumerPlugins[plugname] = require('./plugins/consumers/' + _plugFiles[plug]);
}

/** 
 * Get older sensorevent
 */
function handleOneEvent()
{
	if (lock) return;
	lock = true;

	schema.Event.findOneAndRemove({}, { sort: { 'updated': 1 }}, function(err, event) {
		if (err) {
			logger.error(err);
			lock = false;
			return;
		}
		if (!event) {
			lock = false;
			return;
		}
		logger.debug('handleOneEvent:', event.evttype);

		// Sanity checks
		if (!event.zid || !event.key || !event.data || !event.updated || !event.evttype) {
			logger.error('Incomplete sensorevent: skipped');
			lock = false;
			return;
		}

                // Must find a Plugin with matching name:
                logger.debug('Event Type: ' + event.evttype);
                var found = false;
                for (p in _consumerPlugins) {
                        if (_consumerPlugins[p] == event.evttype) {
                                found = true;
				var res = _consumerPlugins[p].doConsume(event);
                                break;
                        }
                }
                if (!found) {
                        logger.error('Event has unknown Type: ' + event.evttype);
                        return;
                }

		/*
		if (event.evttype == 'sensors') {
			for (i in event.data) {
				// Sanity checks
				var data = event.data;
				if (!data[i].devid || !data[i].instid || !data[i].sid) {
					logger.error('Missing devid or instid or sid in event');
					continue;
				}

				// TODO: à supprimer
				//var is_level_number = (data[i].metrics.level != 'on' && data[i].metrics.level != 'off');
				//var level = (is_level_number) ? data[i].metrics.level : 0;
				//var on_off = (data[i].metrics.level == 'on');
				//var change = data[i].metrics.change;

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
				schema.Sensor.findOneAndUpdate({ key: sensor.key, devid: sensor.devid, instid: sensor.instid, sid: sensor.sid }, sensor, { upsert: true, new: true }, function(err) {
					if (err) logger.error(err);
				});

				// Also historize the Event
				// TODO: don't store if previous value is identical
				new schema.History(sensor).save();
			}
		}
		else if (event.evttype == 'rules') {
			logger.debug('Not yet implemented:', event.evttype);
		}
		else if (event.evttype == 'confinit') {
			schema.Controller.findOneAndUpdate({ key: event.key, zid: event.zid }, { doversion: event.data.doversion }, function(err) {
				if (err) {
					logger.error('Could not find Controller:', event.key, event.zid);
					return;
				}
			});
		}
		else if (event.evttype == 'logs') {
			for (i in event.data) {
				var log = new schema.Log({
					key: event.key,
					date: event.data[i].date,
					level: event.data[i].level,
					msg: event.data[i].msg
				});
				log.save(function(err) {
					if (err) logger.err('Could not save log', event.data);
				});
			}
		}
		*/

		lock = false;
	});
}

setInterval(handleOneEvent, 1000);

// EOF
