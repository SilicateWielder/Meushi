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

// Import dependencies.
require('dotenv').config();
const mineflayer = require('mineflayer');
const { mineflayer: mineflayerViewer } = require('prismarine-viewer');
const { getBufferFromStream } = require('prismarine-viewer/viewer');
const  simpleTerminal = require('simple-terminal');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const mcData = require('minecraft-data');

const fs = require('fs');
const modulize = require('./modulize.js');
const path = require('path');

// Configure Simple Terminal.
let term = new simpleTerminal();
term.automate();

class meushi {
    constructor (ui, configPath) {
        this.version = '0.1.1';
        this.interface = ui;

        this.mcData = mcData;
        this.Movements = Movements;
        this.goals = goals;
        this.rapidCount = 0; // Current count.
        this.rapidLimit = 2; // 3 message limit.
        this.rapidCooldown = 45; // 30 second cooldown
        this.lastChatTime = 0;

        this.tasks = [];

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
                admin_only: true,
                perms: {
                    'BlockyClockwork': 'Admin',
                    'lolylols': 'Admin',
                    'Meushi_mimi': 'Admin',
                }
            },
            whisperEnabled: true,
            humanDelay: true,
        }

        this.bot = mineflayer.createBot(this.config.auth);
        this.bot.loadPlugin(pathfinder);

        this.states = {
            sinceBanner: 0,
        }

        // Load in components.
        this.components = new modulize(this.ui);
        this.components.setIdKeyword('component_id');
        this.components.load('./components');
        this.components.initModules(this);

        // Load in commands.
        this.commands = new modulize(this.ui);
        this.commands.setIdKeyword('command_id');
        this.commands.load('./commands');
        this.commands.initModules(this);

        // Load in services.
        this.services = new modulize(this.ui);
        this.services.setIdKeyword('service_id');
        this.services.load('./services');
        this.services.initModules(this);

        // Handle messages.
        this.bot.on('message', (message) => {
            let msg = this.parseMessage(message);
            this.log(`${msg.username}: ${msg.message}`);
        
            try {
                if (this.config.humanDelay) {
                    const maxDelay = 3 * 1000;  // 3 seconds
                    const minDelay = 1 * 1000;  // 1 second
                    setTimeout(() => {
                        this.processMessage(message);
                    }, Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay);
                } else {
                    this.processMessage(message);
                }
            } catch(e) {
                this.bot.chat('Critical failure! Shutting down...');
                console.error(e);  // Log the error for debugging
                process.exit(1);   // Exit with error code
            }
        });
        

        this.bot.on('kicked', (reason, loggedIn) => {
            this.log(`Kicked! Attempting to reconnect in 10 seconds.`);
            this.log(`Reason: ${JSON.stringify(reason)}`);
            this.bot.quit();
            this.bot.end();

            // Add a 5-second delay before reconnecting
            setTimeout(() => {
                this.bot = mineflayer.createBot(this.config.auth);
                this.bot.loadPlugin(pathfinder);
                this.log(`Reconnected successfully!`);
            }, 10000); // 5000 milliseconds = 5 seconds
        });

        this.bot.once('spawn', () => {
            mineflayerViewer(this.bot, { port: 3007, firstPerson: false }); // The viewer will be available at http://localhost:3007
        });

        this.interface.on('inputSent', (query) => {
			if(query.input[0] === '@') {
				this.bot.chat('[BlockyClockwork] ' + query.input.slice(1));
			} else if(query.input[0] !== '-') {
				this.bot.chat(query.input);
			} else {
				this.processMessage('<Meushi_mimi> ' + query.input);
			}
		})
    }

    async log(message) {
        let trimmed = message.split('\n').join(' ');
        fs.appendFileSync('log.txt', `${trimmed}\n`);
        await this.interface.print(trimmed)
    }

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

    ////////////////////////////////////////////////////////////////

    // Checks if a message contains the command prefix and passes it to the command processor
    // Otherwise, it checks if the bot was spoken to.
    async processMessage(message) {
        const messageManifest = this.parseMessage(message);
        
        const params = messageManifest.message.split(' ');

        // Stop early if there is no command trigger.
        if(params[0][0] != '-' || params[0].length < 2 || (params[0][0] == '-' && params[0][1] == ' ')) {
           return;
        }

        let commandId = params[0].substring(1);
        let cmd = this.commands.retrieveModule(commandId);

        // Retrieve user and their perms/admin status.
        const user = messageManifest.username;
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

        if(cmd.properties.restricted === true && this.config.security.restricted === true) {
            if(!isAdmin) {
                this.bot.chat(`I cannot allow you to do that, ${user}! Only admins can use this right now.`)
                return;
            }
        }

        if(cmd.properties.admin_only === true) {
            if(!isAdmin) {
                this.bot.chat(`I cannot allow you to do that, ${user}! This command is for admins only!`)
                return;
            }
        }

        try {
            await cmd.executable(this, messageManifest.username, params.slice(1));
        } catch (e) {
            this.log(e.stack + e.mesage);
            this.commands.unload(commandId);
            this.bot.chat(`Command '${commandId}' failed, so it's package @ ${cmd.filepath} was unloaded! Tell BlockyClockwork to check the logs please!`)
        }
    }

    ////////////////////////////////////////////////////////////////

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

    ////////////////////////////////////////////////////////////////
}

let bot_instance = new meushi(term);
