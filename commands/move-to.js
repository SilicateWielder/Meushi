const properties = {
	admin_only: true,
	command_id: 'move-to',
	help_text: 'move by a specified distance.',
}

async function move_to(meushi, user, params) {
	const x = parseFloat(params[0]);
	const y = parseFloat(params[1]);
	const z = parseFloat(params[2]);
  
	meushi.log(`Moving to X: ${(x | null)} Y: ${(y | null)} Z: ${(z | null)}...`);
	meushi.moveToExactPosition(x, y, z);
}

module.exports = {
	'properties': properties,
	'executable': move_to,
}
