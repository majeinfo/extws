// -----------------------------------------------
// Mailer Configuration
// -----------------------------------------------
//
exports.mailerConf = {
	localhost: {
		options: {
			host: 'localhost',
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
exports.mailer = 'smarthost';
exports.from = 'alert@domopi.com';

// EOF
