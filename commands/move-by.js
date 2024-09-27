const properties = {
	admin_only: true,
	command_id: 'move-by',
	help_text: 'move by a specified distance.',
	version_id: '0.3',
}

async function move_by(a, user, params) {
	let moveToRelativePosition = meushi.components.retrieveExecutable('moveToRelativePosition');

	const x = parseFloat(params[0]);
	const y = parseFloat(params[1]);
	const z = parseFloat(params[2]);
  
	meushi.log(`Moving by X: ${(x | null)} Y: ${(y | null)} Z: ${(z | null)}...`);
	moveToRelativePosition(x, y, z);
}

function init (source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': move_by,
}
