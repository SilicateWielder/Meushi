const properties = {
	admin_only: false,
	command_id: 'help',
	help_text: 'Get the list of available commands. specify a command name to get more detailed help for it.',
	version_id: '0.5',
}

let meushi = null;

let help_message = '';

function buildHelpMain(library) {
	let command_list = library.getModulesList();
	help_message = `Meushi! Core V.${meushi.version} - ${command_list.join(', ')}`;
}

async function help_main(b, user, params) {
	if(help_message === '') {
		buildHelpMain(meushi.commands); 
	}

	meushi.log('Help!')

	if(params[0] === undefined) {
		meushi.log('Help Main!');
		meushi.chat(help_message, user);
	} else {
		meushi.log('Help specific!');
		const command_name = params[0];
		const command = meushi.commands.retrieveModule(params[0]);

		if(command === undefined) return;

		const cmd_desc = command.properties.help_text;
		const cmd_ver = (command.properties.version_id != undefined) ? command.properties.version_id : '[OBSOLETE]';
		meushi.chat(`${command_name} - V. ${cmd_ver}: ${cmd_desc}`, user);
	}
}

function init(source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': help_main,
}
