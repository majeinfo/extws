var express = require('express');
var router = express.Router();
var schema = require('../modules/schema.js');

/** 
 * Receive the POST with the device list
 */
router.post('/devices', function(req, res, next) {
	console.log(req.body);
	if (req.body.status == 'ok') {
		if (!req.body.updated) req.body.updated = Date.now();
		var event = new schema.SensorEvent({
			zid: req.body.zid,
			data: req.body.data,
			updated: req.body.updated
		});
		event.save(function(err) {
			if (err) console.log(err);
		});
	}
	res.json({ status: 'ok' });
});

module.exports = router;
