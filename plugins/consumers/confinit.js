// ----------------------------------------------------
// Consumer of "confinit" Events    
// ----------------------------------------------------
//
var schema = require('../../modules/schema'),
    logger = require('../../modules/logger');

module.exports.doConsume = function(event) {
        logger.debug('Consume Confinit Events');
	schema.Controller.findOneAndUpdate({ key: event.key, zid: event.zid }, { doversion: event.data.doversion, localip: event.localip }, function(err) {
		if (err) {
			logger.error('Could not find Controller:', event.key, event.zid);
			return;
		}
	});

	return true;
};

// EOF

