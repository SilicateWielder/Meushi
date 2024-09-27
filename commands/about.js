const properties = {
	admin_only: false,
	command_id: 'about',
	help_text: 'About me',
	version_id: '0.2'
}

let meushi = null;

async function about(v, user, params) {
	  meushi.chat(`Meushi! A cow-girl themed bot. Core version ${meushi.version}! Type -help for a list of my commands :)`, user); 
}

function init (source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': about,
}
