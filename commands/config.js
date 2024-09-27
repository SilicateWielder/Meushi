const properties = {
	admin_only: true,
	command_id: 'config',
	help_text: 'Configure various settings',
	version_id: '0.5',
}

async function config(meushi, user, params) {
	const isAdmin = (meushi.config.security.perms[user] === 'Admin')

	if(params != [] && isAdmin) {
		if(params[0] === 'security' && params[1] === 'toggle') {
			meushi.config.security.restricted = !meushi.config.security.restricted;

			const new_status = (meushi.config.security.restricted) ? 'Enabled' : 'Disabled';
			meushi.chat(`Secure mode: ${new_status}`, user);
		}

		if(params[0] === 'admin-only' && params[1] === 'toggle') {
			meushi.config.security.admin_only = !meushi.config.security.admin_only;

			const new_status = (meushi.config.security.admin_only) ? 'Enabled' : 'Disabled';
			meushi.chat(`Admin Only Mode: ${new_status}`, user);
		}

		if(params[0] === 'grant-temp-admin' && params.length > 1) {
			meushi.config.security.perms[params[2]] === 'Admin';

			meushi.chat(`Granted temporary admin control to ${params[1]}!`, user);
		}

		if(params[0] === 'whisper' && params[1] === 'toggle') {
			meushi.config.whisperEnabled = !meushi.config.whisperEnabled;
			meushi.chat('Whispering has been ' + (meushi.config.whisperEnabled) ? 'Enabled' : 'Disabled');
		}
	}
}

module.exports = {
	'properties': properties,
	'executable': config,
}
