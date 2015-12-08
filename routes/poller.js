// ------------------------------------------------------------
// REQUEST Management
// ------------------------------------------------------------
var express = require('express');
var router = express.Router();
var schema = require('../modules/schema.js');
var logger = require('../modules/logger.js');

/**
 * Middleware that check the 'ok' status from POST request
 */
function statusOK(req, res, next) {
	if (req.body.status == 'ok') {
		next();
		return;
	}

	logger.error('statusOK: bad status: ', req.body.status);
	res.json({ status: 'ok' });
}

/**
 * Middleware that check the Client Key versus the R-Pi id
 */
function checkClient(req, res, next) {
	if (!req.body.key) {
		logger.error('checkClient: missing key');
		res.json({ status: 'ok' });
		return;
	}
	if (!req.body.zid) {
		logger.error('checkClient: missing zid');
		res.json({ status: 'ok' });
		return;
	}
	
	schema.User.findOne({ key: req.body.key }, function(err, user) {
		if (err || !user) {
			logger.error('checkClient: mongo error finding key:', req.body.key);
			res.json({ status: 'ok' });
			return;
		}
		//logger.debug(user);
		if (!user.controllers || user.controllers.indexOf(req.body.zid) == -1) {
			logger.error('checkClient: zid', req.body.zid, ' not associated with key', req.body.key);
			res.json({ status: 'ok' });
			return;
		}
		next();
	});
}

/** 
 * Receive the POST with the device list
 */
router.post('/events', statusOK, checkClient, function(req, res, next) {
	if (!req.body.updated) req.body.updated = Date.now();
	var event = new schema.Event({
		zid: req.body.zid,
		evttype: req.body.evttype,
		data: req.body.data,
		updated: req.body.updated,
		key: req.body.key
	});
	event.save(function(err) {
		var resp = { status: 'ok' };
		if (err) { 
			logger.error(err); 
			res.json(resp);
			return;
		}

		// Check if Commands must be returned back
		// TODO: always returns the latest Command only ?
		schema.Command.find({ key: req.body.key, zid: req.body.zid }, { _id: 0 }, { sort: { create_time: -1 }}, function(err, cmds) {
			if (err) { 
				logger.error(err); 
				res.json(resp);
				return;
			}
			logger.debug('found commands:', cmds);
			resp['cmds'] = new Array();
			for (i in cmds) {
				resp['cmds'][i] = cmds[i];
			}
			res.json(resp);

			// Delete Commands (not safe - should be made only if network was available ?)
			schema.Command.remove({ key: req.body.key, zid: req.body.zid }, function(err) {
				if (err) { logger.error(err); return; }
				logger.debug('Commands removed');
			});
		});
	});
	//res.json({ status: 'ok' });
});

/**
 * Receive a Configuration to save
 */
router.post('/saveconf', checkClient, function(req, res, next) {
	var config = new schema.Config({
		zid: req.body.zid,
		config: req.body.config,
		updated: req.body.updated,
		key: req.body.key
	});
	config.save(function(err) {
		var resp = { status: 'ok' };
		if (err) {
			logger.error(err);
		}
		res.json(resp);
	});
});

/**
 * Receive an email demand notification
 */
router.post('/sendemail', checkClient, function(req, res, next) {
	logger.debug('Email Notification !'); 
	if (!req.body.updated) req.body.updated = Date.now();
	var event = new schema.Event({
		zid: req.body.zid,
		evttype: req.body.evttype,
		data: req.body.data,
		updated: req.body.updated,
		key: req.body.key
	});
	var resp = { status: 'ok' };
	res.json(resp);
});

module.exports = router;
