////////////////////////////////////////////////////////////////////////////////////
// index.js - Meushibot main file.
////////////////////////////////////////////////////////////////////////////////////
// 
// Contains the core attributes of Meushibot's functionality.
// 
// Borrows architecture ideas from Guildeus for dynamically loading
// components and commands as individual units which get treated/developed as \
// standalone applications. Kind of like an OS.
//
////////////////////////////////////////////////////////////////////////////////////
//
// V0.1.2A CHANGES:
//   - Migrated from use of 'simple-terminal' to custom UI using termvas
//   - Stripped unused dependencies
//   - Stripped unused code
//   - Implemented Cleanmode flag.
//   - 
////////////////////////////////////////////////////////////////////////////////////

// Import dependencies.
require('dotenv').config();
const fs = require('fs');
const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data');

const ui = require('./term.js');
const modulize = require('./modulize.js');

// Configure Simple Terminal.
let term = new ui();
term.init();
term.render();
term.autoRender();

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

class meushi {
    constructor (ui, configPath) {
        this.version = '0.1.3';
        this.interface = ui;
        this.interface.log('Starting...!');

        this.mcData = mcData;
        this.Movements = Movements;
        this.goals = goals;

        // Chat limiter variables.
        this.rapidCount = 0; // Current count.
        this.rapidLimit = 2; // 3 message limit.
        this.rapidCooldown = 45; // 30 second cooldown
        this.lastChatTime = 0; //timestamp.

        this.adNext = 0; // time for next ad.
        this.ads = [
            `Moo! I'm Meushi, an AI bot in training. Say my name to speak to me!`,
            `I wonder what -moo does?`,
            `Moo!`,
            `Please keep in mind that I am always learning from the discussions here.`,
            `Moo! I hope everyone is doing alright today.`,
            `You can use -help to see what I can do!`,
            `Don't forget -talk is another way to chat with me!`,
            `-moo might surprise you! Try it sometime!`,
            `Having trouble? -help is here for you!`,
            `Moo! I can load some interesting -packages. Curious?`,
            `If you're feeling adventurous, use -help [command] to learn more about it.`,
            `Did you know? The bot-admin can grant temporary bot-admin permissions! Moo!`,
            `Psst, only the developer can use -config. They're special like that. Moo!`,
            `Moo! Remember, -kill is just for pretend! I'm not going anywhere!`,
            `I'm here to help! Use -about if you want to learn more about me!`,
            `Hey everyone! Moo! Let's make today a great day!`,
            `I'm always practicing my moos. Try -moo to hear one!`,
            `Moo! Want to see what I'm capable of? Use -packages to learn more!`,
            `Remember, I'm always learning! Let's make each conversation count. Moo!`,
            `Moo! Did you know you can talk to me directly with -talk?`,
            `Feeling curious? Use -help help to see how help works! Moo!`,
            `Moo! Hope everyone here is staying safe and happy!`,
            `Try -moo if you need a little smile! I’m good at that.`,
            `Moo! Temporary bot-admin permissions are sometimes a thing!`,
            `-talk isn't the only way to reach me, but it's one of the friendliest! Moo!`,
            `Moo! Don't worry, even if you use -kill, I'll be back before you know it!`,
            `Moo! Use -help [command] to dive deeper into what I can do!`,
            `Don't be shy, I'm here to help and chat whenever you need. Moo!`,
            `Moo! Exploring packages is fun! Use -packages to see what I've got loaded!`,
            `I'm always here, learning and mooing! Let’s chat and learn together.`,
            `Curious about my commands? Give -help a try. Moo!`,
            `Moo! The developer has some special tricks, like -config, just for them!`,
            `Moo! I'm still learning, so be patient if I don’t know something... yet!`,
            `Hey! If you want to chat, just say my name or use -talk! Moo!`,
            `Did you know? I can tell you what -moo does, but it's more fun to try it!`,
            `Moo! Sometimes I even surprise myself with what I can learn!`,
            `Moo! Use -help to explore all the commands you can use!`,
            `Moo! If you use -kill, just know I'll be back in no time!`,
            `Feeling confused? -help is here to lend a hoof. Moo!`,
            `Moo! Did you know starting a message with my name is a great way to get my attention?`,
            `Moo! I'm always ready to chat, just start with my name!`,
            `Moo! Don't be shy, say my name if you'd like to chat!`,
            `Moo! Sometimes the best way to start is just by saying my name!`,
            `Moo! Want to chat? Just start your message with my name!`,
            `Moo! I'm always here, just say my name and let's talk!`,
            `Moo! Talking to me is easy! Start with my name and let's have fun!`
        ];

        this.config = {
            auth: {
                host: process.env.SERVER_MAIN,
                port: 25565,
                username: process.env.ACCOUNT_USER,
                auth: process.env.ACCOUNT_AUTH,
                version: process.env.SERVER_VERSION,
                checkTimeoutInterval: 600000,
                profilesFolder: process.env.ACCOUNT_LOCATION,
            },
            security: {
                restricted: false,
                admin_only: false,
                perms: {
                    'BlockyClockwork': 'Admin',
                    'lolylols': 'Admin',
                    'Meushi_mimi': 'Admin',
                }
            },
            settings: {
                whisperEnabled: false,
                humanDelay: false,
            },
            // Legacy defs. Need time to realocate and confirm functionality.
            whisperEnabled: false,
            humanDelay: false,
        }

        this.interface.updateHost(process.env.SERVER_MAIN);
        this.interface.updateTarget(process.env.SERVER_VERSION);

        this.bot = null;
        this.startBot();

        this.interface.on('inputSent', (query) => {
			this.handleConsoleInput(query);
		})

        // Load in components.
        this.components = new modulize(this.interface);
        this.components.setIdKeyword('component_id');
        if (process.env.CLEAN_MODE === 'false') this.components.load('./components');
        this.components.initModules(this);
        
        // Load in commands.
        this.commands = new modulize(this.interface);
        this.commands.setIdKeyword('command_id');
        if (process.env.CLEAN_MODE === 'false') this.commands.load('./commands');
        this.commands.initModules(this);

        this.interface.set

        // Redirect console to our logging system. Yeah...
        console.log = (q) => {
            this.interface.log(q);
        }
    }

    displayAd() {
        let ad = this.ads[Math.floor(Math.random() * this.ads.length)];
        
        let timeNow = Math.floor(Date.now() / 1000);
        if(timeNow > this.adNext) {
            this.chat(ad, 'Meushi_mimi', false);
            this.adNext = timeNow + (60 + Math.random() * 150);
        }
    }

    startBot() {
        if(this.bot !== null) throw new Error ('PRIOR BOT INSTANCE PRESENT. CANNOT START.')

        this.bot = mineflayer.createBot(this.config.auth);
        this.bot.loadPlugin(pathfinder);

        // Handle messages.
        this.bot.on('chat', (username, message) => {
            this.handleMessage(username, message);

            this.displayAd();
        });
        

        this.bot.on('kicked', (reason, loggedIn) => {
            this.handleKick(reason, loggedIn);
        });

        this.bot.once('spawn', () => {
            this.handleFirstSpawn();
            setInterval(() => {this.interface.updateUsers(this.bot.players)}, 30000);
            //mineflayerViewer(this.bot, { port: 3007, firstPerson: false }); // The viewer will be available at http://localhost:3007
        });

        this.bot.on('move', () => {
            let pos = this.bot.entity.position;
            //this.interface.log(JSON.stringify(this.bot.entity.position));
            this.interface.updatePosition(pos);
        });

        this.bot.on('forcedMove', () => {
            let pos = this.bot.entity.position;
            //this.interface.log(JSON.stringify(this.bot.entity.position));
            this.interface.updatePosition(pos);
        });
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    handleConsoleInput(query) {
        if(query.input[0] === '@') {
            // Send message as user.
            this.bot.chat('[Bot-Admin] ' + query.input.slice(1));
        } else if(query.input[0] !== '-') {
            // Send message as bot.
            this.bot.chat(query.input);
        } else {
            // forwar to normal command parser.
            this.processMessage('Meushi_mimi', query.input);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    handleMessage (username, message) {
        this.log(`${username}: ${message}`);
        
        try {
            if (this.config.humanDelay) {
                const maxDelay = 3 * 1000;  // 3 seconds
                const minDelay = 1 * 1000;  // 1 second
                setTimeout(() => {
                    this.processMessage(username, message);
                }, Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay);
            } else {
                this.processMessage(username, message);
            }
        } catch(e) {
            this.bot.chat('Critical failure! Shutting down...');
            console.error(e);  // Log the error for debugging
            process.exit(1);   // Exit with error code
        }
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    handleFirstSpawn () {
        mineflayerViewer(this.bot, { port: 3007, firstPerson: false }); // The viewer will be available at http://localhost:3007
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    handleKick(reason, loggedIn) {
        this.log(`Kicked! Attempting to reconnect in 60 seconds.`);
        this.log(`Reason: ${JSON.stringify(reason)}`);
        this.bot.removeAllListeners();
        try{ this.bot.viewer.close() } catch (e) {};
        this.bot.quit();
        this.bot.end();
        
        this.bot = null;

        // Add a 60-second delay before reconnecting
        setTimeout(() => {
            this.startBot();
        }, 60000); // 1000 milliseconds = 1 second
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    log(message) {
        let trimmed = message.split('\n').join(' ');
        fs.appendFileSync('log.txt', `${trimmed}\n`);
        this.interface.log(trimmed)
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // A self-limiting chat function. rapid messages are those less than 30 seconds in time differential. 
    // If the count exceeds 3 then we enter whisper mode and continue to only use whispers until the last public message was send long enough ago to exceed the cooldown period.
    chat(message, user, forceWhisper) {
        if(forceWhisper || (message.length > 45 && user != undefined && this.config.whisperEnabled)) {
            this.log('attempting to whisper to ' + user);
            const parts = message.split('\n');

            for(let p = 0; p < parts.length; p++) {
                this.bot.chat(`/w ${user} ${parts[p]}`);
            }
            return;
        }

        const timeSeconds = Math.floor(Date.now() / 1000);
        const timeDifference = timeSeconds - this.lastChatTime;

        if(timeDifference < this.rapidCooldown) {
            this.rapidCount = this.rapidCount + 1;
        } else {
            this.rapidCount = 0;
        }

        //this.log(`${timeSeconds}-${this.lastChatTime}=${timeDifference} | Rapid: ${this.rapidCount} | cooldown: ${this.rapidCooldown} | limit: ${this.rapidLimit}`);

        if(this.rapidCount > this.rapidLimit && user != undefined) {
            this.log('attempting to whisper to ' + user);
            const parts = message.split('\n');

            for(let p = 0; p < parts.length; p++) {
                this.bot.chat(`/w ${user} ${parts[p]}`);
            }
            return;
        }

        this.bot.chat(message);
        this.lastChatTime = timeSeconds;
    }
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Breaks down a message into user and message segments for further processing.
    parseMessage(rawInput) {
        const input = '' + rawInput;

        let splitMessage = [];
        
        let sender = '';
        let msg = '';
        
        if(input[0] === '<') {
            splitMessage =  input.split('<')[1].split('>');
            sender = splitMessage[0];
            msg = splitMessage[1].substring(1);
        }

        if(sender === '') {
            sender = 'server';
            msg = input;
        }

        return {
            username: sender.toString(), 
            message: msg.toString()
        }; 
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Checks if a message contains the command prefix and passes it to the command processor
    // Otherwise, it checks if the bot was spoken to.
    async processMessage(username, message) {
        if(message === undefined) this.log('WHAT?! NO MESSAGE?!')
        
        const params = ('' + message).split(' ');

        // Stop early if there is no command trigger.
        if(params[0][0] != '-' || params[0].length < 2 || (params[0][0] == '-' && params[0][1] == ' ')) {
           return;
        }

        let commandId = params[0].substring(1);
        let cmd = this.commands.retrieveModule(commandId);

        // Retrieve user and their perms/admin status.
        const user = username;
        const userPerms = this.config.security.perms[user];
        const isAdmin = (userPerms != undefined && userPerms === 'Admin');

        // Deny user if admin-only mode active.
        if(this.config.security.admin_only === true && !isAdmin) {
            this.bot.chat(`Sorry, ${user}! I'm only allowed to respond to my admins right now! Try again later.`);
            return;
        }

        // Return error if there is no matching command.
        if(cmd === undefined && commandId != '') {
            this.log('failed: ' + commandId + ' does not exist.')
            this.bot.chat(`[ERROR]: Command "${commandId}" not installed.`, user, true);
            return;
        }

        // Restrict user if in restricted mode and command is restricted.
        if(cmd.properties.restricted === true && this.config.security.restricted === true) {
            if(!isAdmin) {
                this.bot.chat(`I cannot allow you to do that, ${user}! Only admins can use this right now.`)
                return;
            }
        }

        // Retrict user if command is specifically admin-only.
        if(cmd.properties.admin_only === true) {
            if(!isAdmin) {
                this.bot.chat(`I cannot allow you to do that, ${user}! This command is for admins only!`)
                return;
            }
        }

        // Run command if all other nets are not triggered.
        try {
            await cmd.executable(this, username, params.slice(1));
        } catch (e) {
            // Force the command to be unloaded if we get an error.
            this.log(e.stack + e.message);
            this.commands.unload(commandId);
            this.bot.chat(`Command '${commandId}' failed, so it's package @ ${cmd.filepath} was unloaded! Tell BlockyClockwork to check the logs please!`)
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
}

let bot_instance = new meushi(term);
