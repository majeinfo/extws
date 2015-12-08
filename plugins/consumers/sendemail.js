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

module.exports.doConsume = function(event) {
        logger.debug('Consume Sendemail Events');

	// TODO: check this Client doesn not spam the Earth
	// TODO: normally, only valdated email address should be used - this must be checked

	transporter.sendMail({
		from: mailerconfig.from,
		to: event.email,
		subject: event.subject,
		text: 'ah, ah....'
	});

	return true;
};

// EOF

