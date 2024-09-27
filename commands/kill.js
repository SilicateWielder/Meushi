const properties = {
	admin_only: false,
	command_id: 'kill',
	help_text: 'Kill Meushi!',
	version_id: '0.5',
}

const deathMsgs = [
	'*Crumples*',
	'*FUCKING EXPLODES!!!!!* BOOOOOOOM!',
	'Help I\'ve died and I can\'t get up!',
];

let meushi = null;

async function help_main(b, user, params) {

	const isAdmin = (meushi.config.security.perms[user] == 'Admin');

	if(!isAdmin) {
		const msg = Math.floor(Math.random() * deathMsgs.length);
		meushi.chat(deathMsgs[msg], user);
		return;
	}

	meushi.chat("Goodbye world!");
	process.exit();
}

function init(source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': help_main,
}
