const properties = {
    admin_only: false,
    restricted: false,
    command_id: 'say',
    help_text: 'Make me say the thing! Type any text and I\'ll say it!',
    version_id: '0.2',
    changelog: [
        'Removed ratelimiting',
        'Migrated to self-limiting chat functions'
    ]
};

const censorStrings = {
    '0b0t.org': [
        "You stupid fuck! you can't bypass the blacklist!",
        "[THIS MESSAGE WAS BANNED BY THE GENEVA CONVENTIONS]",
        "...What was I gonna say?",
        "Moo!"
    ]
}

// For VERY bad things. Bot wont say these even if the blacklist is in a relaxed state.
const permaBlacklist = ["/", "/execute", "-say", "/ignore", "/backdoor", "/togglechat" ,"/toggletells", "/tpy", '/tpaccept', "molesting", "rape", "in children"];

// Extra stuff for secure mode.
const semiBlacklist = ["/tpa", "/kill"];
const blacklist = permaBlacklist.concat(semiBlacklist);

let lastMessageTimestamp = 0;
let rapidMessageCount = 0;
let lastMessage = "";
let repeatCount = 0;

function getCensorMessage(meushi) {
    if (censorStrings[meushi.serverIP] === undefined ) {
        return '[CENSORED]';
    }

    const subset = censorStrings[meushi.serverIP];
    const stringCount = subset.length;
    const selection = Math.floor(Math.random() * stringCount);

    return subset[selection];
}

async function say(meushi, user, params) {
    const message = params.join(' ');

    // Check message against blacklist if user is not admin
    if (meushi.config.security.perms[user] != 'Admin') {
        const activeBlacklist = (meushi.config.security.restricted) ? blacklist : permaBlacklist;
        for (let i = 0; i < activeBlacklist.length; i++) {
            if (message.toLowerCase().includes(activeBlacklist[i].toLowerCase())) {
                meushi.chat(getCensorMessage(meushi), user);
                return;
            }
        }
    }
    meushi.chat(message, user);
}

// IMPORTANT, DO NOT REMOVE THIS COMMENT.
// the properties of exports are wrapped to avoid runtime issues.
// Yes, this has been an issue.
module.exports = {
    'properties': properties,
    'executable': say,
};
