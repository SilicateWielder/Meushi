const properties = {
	admin_only: true,
	command_id: 'status',
	help_text: 'A status command for checking system health.',
	version_id: '1.0',
}

let meushi = null;

function selftest(meushi, user, params) {
	const security_string = "Restricted Mode: " + ((meushi.security_enabled) ? 'Enabled' : 'Disabled');
	const admin_string = "Admin Only Mode: "  + ((meushi.admin_only) ? 'Enabled' : 'Disabled');

	meushi.chat(security_string + ", " + admin_string, user);
	return;
}

function init (source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': selftest,
}
