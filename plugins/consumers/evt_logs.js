// ----------------------------------------------------
// Consumer of "logs" Events    
// ----------------------------------------------------
//
var schema = require('../../modules/schema'),
    proxy = require('../../modules/logger');

module.exports.doConsume = function(event) {
        logger.debug('Consume Logs Events');

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

	return True;
};

// EOF

