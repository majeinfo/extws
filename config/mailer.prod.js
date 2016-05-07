// -----------------------------------------------
// Mailer Configuration
// -----------------------------------------------
//
exports.mailerConf = {
	localhost: {
		options: {
			host: 'mailerhost',
			port: 25
		}
	},
	smarthost: {
		options: {
			host: 'smtp.free.fr',
			port: 25
		}
	}
};
exports.mailer = 'localhost';
exports.from = 'alert@domopi.com';

// EOF
