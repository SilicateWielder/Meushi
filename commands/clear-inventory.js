const properties = {
	admin_only: true,
	command_id: 'clear-inventory',
	help_text: 'Vomit items. ALL items.',
	version_id: '0.2',
}

let meushi = null;

async function moo(a, user, params) {
	var itemCount = 0;
	var slots = [];
	var failed_slots = 0;

	var slots = meushi.bot.inventory.slots;

	for(let slot = 0; slot < slots.length; slot++){
	  const item = slots[slot];
	  console.log(item);
	  if(item !== undefined && item !== null) {
		itemCount += item.count;
		try {
		  await meushi.bot.tossStack(item);
		} catch(err) {
		  failed_slots++;
		}
		//wait(1000)
	  }
	}
	meushi.chat(`I have dropped ${itemCount} items across ${slots.length} slots, with ${failed_slots} slots being unable to empty.`, user);
	//dropItemFromInventorySlots(slots); 
}

function init(source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': moo,
}
