const properties = {
	admin_only: false,
	command_id: 'moo',
	help_text: '"Moo!"',
	version_id: '0.2',
}

let meushi = null

async function moo(a, user, params) {
	  meushi.chat("Moo!", user); 
}

function init(source) {
	if(source.bot === undefined) {
		throw Error('FUCK!');
	}

	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': moo,
}
