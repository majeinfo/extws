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
for (var plug in _plugFiles) {
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
                for (var p in _consumerPlugins) {
                        if (p == event.evttype) {
                                found = true;
				var res = _consumerPlugins[p].doConsume(event);
                                break;
                        }
                }
                if (!found) {
                        logger.error('Event has unknown Type: ' + event.evttype);
                        return;
                }

		lock = false;
	});
}

setInterval(handleOneEvent, 1000);

// EOF
