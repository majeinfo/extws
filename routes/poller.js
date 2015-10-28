var express = require('express');
var router = express.Router();
var schema = require('../modules/schema.js');

/**
 * Middleware that check the 'ok' status from POST request
 */
function statusOK(req, res, next) {
	if (req.body.status == 'ok') {
		next();
		return;
	}

	console.log('statusOK: bad status: ', req.body.status);
	res.json({ status: 'ok' });
}

/**
 * Middleware that check the Client Key versus the R-Pi id
 */
function checkClient(req, res, next) {
	if (!req.body.key) {
		console.log('checkClient: missing key');
		res.json({ status: 'ok' });
		return;
	}
	if (!req.body.zid) {
		console.log('checkClient: missing zid');
		res.json({ status: 'ok' });
		return;
	}
	
	schema.User.findOne({ key: req.body.key }, function(err, user) {
		if (err || !user) {
			console.log('checkClient: mongo error finding key:', req.body.key);
			res.json({ status: 'ok' });
			return;
		}
		console.log(user);
		if (!user.controllers || user.controllers.indexOf(req.body.zid) == -1) {
			console.log('checkClient: zid', req.body.zid, ' not associated with key', req.body.key);
			res.json({ status: 'ok' });
			return;
		}
		next();
	});
}

/** 
 * Receive the POST with the device list
 */
router.post('/devices', statusOK, checkClient, function(req, res, next) {
	console.log(req.body);
	if (!req.body.updated) req.body.updated = Date.now();
	var event = new schema.SensorEvent({
		zid: req.body.zid,
		data: req.body.data,
		updated: req.body.updated,
		key: req.body.key
	});
	event.save(function(err) {
		var resp = { status: 'ok' };
		if (err) { 
			console.log(err); 
			res.json(resp);
			return;
		}

		// Check if Commands must be returned back
		// TODO: always returns the latest Command only ?
		schema.Command.find({ key: req.body.key, zid: req.body.zid }, { _id: 0 }, { sort: { create_time: -1 }}, function(err, cmds) {
			if (err) { 
				console.log(err); 
				res.json(resp);
				return;
			}
			console.log('found commands:', cmds);
			resp['cmd'] = new Array();
			for (i in cmds) {
				resp['cmd'][i] = cmds[i];
			}
			res.json(resp);

			// Delete Commands (not safe - should be made only if network was available ?)
			schema.Command.remove({ key: req.body.key, zid: req.body.zid }, function(err) {
				if (err) { console.log(err); return; }
				console.log('Commands removed');
			});
		});
	});
	//res.json({ status: 'ok' });
});

module.exports = router;
