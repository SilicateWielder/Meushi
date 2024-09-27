const properties = {
	admin_only: false,
	command_id: 'time',
	help_text: 'What time is it?',
	version_id: '0.5',
}

let meushi = null;

async function help_main(b, user, params) {
	const timeRaw = meushi.bot.time.timeOfDay;

	const isDay = !(timeRaw < 13000 || timeRaw > 23000);

	const string = (isDay) ? 'is' : 'is not';

	meushi.chat(`it ${string} day! [${timeRaw} ticks]`, user);
}

function init(source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': help_main,
}
