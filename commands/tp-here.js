const properties = {
	admin_only: true,
	command_id: 'tp-here',
	help_text: 'Get the list of available commands.',
    deny_text: "Sorry, I can't TP to you!",
    version_id: '0.2',
}

let help_message = '';

function tp_here(meushi, user, params) 
{
    meushi.chat('/tpa ' + user, user);
}

function init (source) {
	meushi.bot.on('message', async (message, pos, sender, ver, src = source) => {
        let msg = meushi.parseMessage(message);

        if(msg.message === 'You are not allowed to teleport while in the spawn area!') {
            src.chat(`I'm stuck in spawn and cannot TP right now!`)
        }
    })
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': tp_here,
}
