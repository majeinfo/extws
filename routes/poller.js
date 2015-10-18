var express = require('express');
var router = express.Router();

/** 
 * Receive the POST with the device list
 */
router.post('/devices', function(req, res, next) {
	console.log(req.body);
	res.json({ status: 'ok' });
});

module.exports = router;
