// ----------------------------------------------------
// Consumer of "sendemail" Events    
// ----------------------------------------------------
//
var mailer = require('nodemailer'),
    smtpTransport = require('nodemailer-smtp-transport'),
    mailerconfig = require('../../config/mailer'),
    schema = require('../../modules/schema'),
    logger = require('../../modules/logger');

if (mailerconfig.mailer == 'smarthost') {
	var trans = smtpTransport(mailerconfig.mailerConf['smarthost']['options']);
}
else if (mailerconfig.mailer == 'localhost') {
	var trans = smtpTransport(mailerconfig.mailerConf['localhost']['options']);
}
else {
	logger.error('Mailer ' + mailerconfig.mailer + ' is unknown');
}
var transporter = mailer.createTransport(trans);


function _sendMail(to_addr, event) {
	transporter.sendMail({
		from: mailerconfig.from,
		to: to_addr,
		subject: event.data.subject,
		text: event.data.body,
		html: event.data.body.replace(/(\n)/g, '<br />')
	}, function(error, info) {
		if (error) {
			logger.error('Message sent with error: ' + error);
			return; 
		}
		logger.info('Message sent: ' + info.response);
		
		// Also historize the Event
		var histo = {
			key: event.key,
			zid: event.zid,
			evttype: 'mailevt',
			updated: event.updated,
			data: event
		};
		new schema.History(histo).save();
	});
}

module.exports.doConsume = function(event) {
        logger.debug('Consume Sendemail Events: ' + event);

	// TODO: check this Client does not spam the Earth
	// TODO: normally, only valdated email address should be used - this must be checked

	// Find the email address from user account
	schema.Controller.findOne({key: event.key}, function(err, controller) {
		if (err) {
                        logger.error('Could not find Controller for key: ' + event.key);
                        return;
		}

		// Find the Owner
		schema.User.findOne({login: controller.login}, function(err, user) {
			if (err) {
				logger.error('Could not find User for login: ' + controller.login);
				return;
			}
			_sendMail(user.email, event);
		});
	});

	return true;
};

// EOF

