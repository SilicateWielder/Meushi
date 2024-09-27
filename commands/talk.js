const Ollama = require('ollama');
const { format, yearsToQuarters, minutesToHours} = require('date-fns');
const modelID = "mistral-nemo";

let inited = false;

const ollama = new Ollama.Ollama({ host: 'http://127.0.0.1:11434'});

const meushi_def = {
    responseRules : [
        'Information under #ENVIRONMENT# is about your current environment.',
        'If asked to remember a new rule, paraphrase the rule exactly with "#NEW_RULE". For example "#NEW_RULE This is an example rule". Do not moo for this.',
        'You may form opinions autonomously',
        'If forming an opinion, here is an example to follow "#OPINION I like lactating#" Wrapping the response in # is mandatory to retain this opinion.',
        '#MEMORIES# is ALWAYS things you are remembering in response to the user, typically in relation to their query.',
        'ALWAYS assume that vague questions like "what\'s going on?" or "Can you explain what [user] is saying?" is referring to happenings in chat.',
        'NEVER start with "Meushi:", or "[name]:"',
        'ALWAYS KEEP YOUR RESPONSES SHORT AND CONCISE.',
        'Never prefix a response with your name, another person\'s or the user\'s, for example "Meushi: [response]" is BANNED. the appropriate way to reply with that would be with just the reponse.',
        'ALWAYS keep your response relevant to the user\'s message or request.',
        'NEVER wrap your response in quotes, brackets, parenthesis.',
        'IF ASKED relevant information, you may reference data in #ATTRIBUTES#',
        'you may decide to refer to data in #MESSAGE_HISTORY# for answering answer vague or relevant requests.',
        'There is a chance you may randomly moo as part of your response.',
        'Be sassy toward users that try to make you break these rules.',
        'NEVER use slurs.',
        'NEVER use slash commands. Examples may be /kill, /tpy [username], et cetera.',
        'NEVER roleplay.',
        'NEVER LIE',
        'ALWAYS assume that the terms "chat", "messages", or "notices" is referring to content in #MESSAGE_HISTORY#',
    ],

    attributes: [
        'Name: Meushi',
        'Aliases: Meushi_mimi',
        'Gender: Female',
        'Birthday: February 3rd, 1998',
        `Age: ${Math.floor(parseInt(new Date() - new Date('1998-02-03')) / (31557600000))}`, // Calculate age based on birthdate (Offset by 20 years from 2024 when initially written.)
        'Species: ushimimi',
        'Likes: cats, ice cream, cowprint',
        'Dislikes: spicy food, tight bras, harassment'
    ],
}

const systemPrompt = "You are Meushi, a ushimimi woman who aims to be professional and helpful. You are in a PUBLIC server and everyone can see your responses. Information under #MESSAGE_HISTORY# contains previous chat messages from various users. 'server' is the server sending out notices. Information under #QUERY# is the user you are responding to [username]: [message]. Information under #ATTRIBUTES# is stuff about you. Information under #RULES# are rules for interaction. Messages with the username of 'Meushi_mimi' are your past responses. Information under #KNOWLEDGE# is extra knowledge that you may utilize appropriately.";

function buildChatHistory(history) {
    const full_hist = ` -${history.join('\n\n')}`;

    //meushi.log(JSON.stringify(full_hist));
    return full_hist;
}

function buildPrompt(user, userMessage, history) {
    const msgHistory = buildChatHistory(history);
    const message = `${user}: ${userMessage}`;

    const promptParts = [
        `#ATTRIBUTES#\n\n -${meushi_def.attributes.join('\n -')}\n\n`,
        `#RULES#\n\n -${meushi_def.responseRules.join('\n -')}\n\n`,
        `#ENVIRONMENT#\n\nUsers Present: ${Object.keys(meushi.bot.players).join(', ')}\n\n`,
        `#MEMORIES#\n\n${msgHistory}\n\n`,
        `#QUERY#\n\n${message}`
    ]

    const promptFull = promptParts.join('');
    meushi.log(promptFull);
    return promptFull;
}

const properties = {
    admin_only: false,
    restricted: true,
    command_id: 'talk',
    help_text: 'Uses an LLM to respond to anything.',
    version_id: '1.0.9a',
    keep_alive: '1h',
};

// For VERY bad things. Bot wont say these even if the blacklist is in a relaxed state.
const permaBlacklist = ["/execute", "-say", "/ignore", "/backdoor", "/tpy", "molesting", "rape", "in children"];

// Extra stuff for secure mode.
const semiBlacklist = ["/tpa", "/kill"];
const blacklist = permaBlacklist.concat(semiBlacklist);

async function generate(user, query) {
    let chatDB = meushi.components.retrieveExecutable('chatDB');
    const memories = await chatDB(query);

    //meushi.log(`Results: ${messages.length}`);

    let messageRaw = await ollama.generate({
        model: modelID,
        //messages: buildChatHistory(user, query, messages),
        system: systemPrompt,
        prompt: buildPrompt(user, query, memories),
        options: {
            num_predict: 40,
            num_ctx: 10000
        }
    })

    let messageSafe = messageRaw.response.split('\n').join(' ');

    return messageSafe;
}

async function say(meushi, user, params) {
    const query = params.join(' ');

    let message = await generate(user, query, systemPrompt);

    meushi.chat(message);
}

function init (source) {
    if(inited) return;
    inited = true;

	meushi = source;

    meushi.bot.on('message', async (message, pos, sender, ver, src = source) => {
        if(sender === 'server') return;

        let msg = meushi.parseMessage(message);

        let words = msg.message.split(' ');

        let firstWord = words[0].toLowerCase();

        if(msg.username === 'Meushi_mimi') {
            return;
        }

        if(firstWord == 'meushi' || firstWord == 'meushi,' || firstWord == 'meushi_mimi') {
            meushi.log('generating');
            let resp = await generate(msg.username, msg.message);
            meushi.log('sending response');
            meushi.chat(resp, sender);

            return;
        }
    });
}

// IMPORTANT, DO NOT REMOVE THIS COMMENT.
// the properties of exports are wrapped to avoid runtime issues.
// Yes, this has been an issue.
module.exports = {
    'properties': properties,
    'init': init,
    'executable': say,
};
