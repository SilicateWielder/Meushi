const { EventEmitter } = require('events');
const { urlToHttpOptions } = require('url');

function getTimeString() {
    let uptime = process.uptime();

    let seconds = Math.floor(uptime % 60); // Get the remaining seconds
    uptime = Math.floor(uptime / 60); // Reduce uptime to minutes

    let minutes = Math.floor(uptime % 60); // Get the remaining minutes
    uptime = Math.floor(uptime / 60); // Reduce uptime to hours

    let hours = Math.floor(uptime % 24); // Get the remaining hours
    let days = Math.floor(uptime / 24); // Get the number of full days

    // Format the output with leading zeros for consistency
    return `${String(days).padStart(2, '0')}:${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

class botUI extends EventEmitter{

   constructor () { 
        super();
        this.canvas = new (require('termvas'))(true);
        this.hostname = 'example.com';
        this.targetVer = '0.0.0';
        this.botVer = '0.1.1';

        this.pkgCount = 0;
        this.cmdCount = 0;
        this.cmpCount = 0;

        this.ready = false;
        this.logs = new scrollLog(this.canvas, 23, 3, 100, 15, 'blue');
        this.input = new textInput(this.canvas, 23, 18, 100, 'black');

        this.users = new scrollLog(this.canvas, 2, 2, 20, 15, 'blue');
        //this.users.setTitle('Users');

        this.viewPos = new pane(this.canvas, 23, 20, 20, 7, 'blue');
        this.viewPos.setTitle('Position');

        this.viewAI = new pane(this.canvas, 44, 20, 30, 7, 'blue');
        this.viewAI.setTitle('AI Stats');

        // Relay thyme!!!1!
        this.input.on('inputSent', (input) => {
            this.emit('inputSent', input);
        })

        process.on('uncaughtException', (err) => {
            let lines = err.stack.split('\n');
            for (let line of lines) {
                this.logs.log(line);
            }
        });  
        
        process.on('error', (err) => {
            let lines = err.stack.split('\n');
            for (let line of lines) {
                this.logs.log(line);
            }
        });         
        
        this.rendering = false;
    }

    updateUsers(userList) {
        //this.log(Object.keys(userList));
        this.users.logs = Object.keys(userList);
    }

    updateTarget(version) {
        this.targetVer = version;

        this.canvas.writeText(16, 0, 'MC Target:', 'green', 'blue');
        this.canvas.writeText(27, 0, this.targetVer, 'white', 'blue');
    }

    updateHost(host) {
        this.hostname = host;

        this.canvas.writeText(35,0, 'Server:', 'green', 'blue');
        this.canvas.writeText(43,0, this.hostname, 'white', 'blue');
    }

    updatePackages(cmdCount, cmpCount) {
        this.pkgCount = cmdCount + cmpCount;
        this.cmdCount = cmdCount;
        this.cmpCount = cmpCount;
    
        this.canvas.writeText(60,0, 'Packages:', 'green', 'blue');
        this.canvas.writeText(70,0, `${this.pkgCount}(${this.cmdCount}CMD/${this.cmpCount}CMP)`, 'white', 'blue');
    }

    updatePosition(pos) {
        this.viewPos.setLine(0, `X: ${pos.x.toFixed(5)}`);
        this.viewPos.setLine(1, `Y: ${pos.y.toFixed(5)}`);
        this.viewPos.setLine(2, `Z: ${pos.z.toFixed(5)}`);
    }

    init() {
        this.canvas.writeText(0,0, ' '.repeat(this.canvas.width), 'white', 'blue');
        this.canvas.writeText(0,0, 'Meushi! v' + this.botVer, 'white', 'blue');
        
        this.updateTarget('1.20.4');
    
        this.updateHost('2b2t.org');
    
        this.updatePackages(23,5);
        
        //this.canvas.writeText(2, 2, ' Users              ', 'white', 'black');
        this.canvas.writeText(23, 2, ' Logs' + ' '.repeat(65), 'white', 'black');
        
        this.ready = true;
    }

    render() {
        if(!this.ready) return;
        this.logs.render();
        this.input.render();

        this.users.render();
        this.viewPos.render();
        this.viewAI.render();

        this.canvas.writeText(80, 2, `Uptime: ${getTimeString()}`);

        this.canvas.render();
    }

    log(text, update = false) {
        if(this === undefined) {
            //console.log(Object.keys(this));
            //Somehow the this keyword is breaking. Not sure why, or how or what past-me did.
            throw new Error('FUCK');
        }
        this.logs.log(text);

        if(update) this.render();
    }

    autoRender() {
        // 64ms interval due to the cursor...
        setInterval(this.render.bind(this), 32);

        //this.canvas.on('keypress', this.render);
        //this.canvas.on('mouse-move', this.render);
    }
    
}


class textInput extends EventEmitter{
    constructor (canvas, x, y, length, bgColor) {
        super();
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.length = length;
        this.bgColor = bgColor;

        this.content = 'Hello, world!';

        this.canvas.on('keypress', (key) => {
			this.handleInput(key);
		})
    }

    handleInput(key) {
        // Handle enter-key
		if(key.sequence == '\r') {
			this.emit('inputSent', {input: this.content});
			this.content = '';
			return;
		}
	
        // Handle a backspace.
		if(key.sequence == '\x7f') {
			if (this.content.length > 0) this.content = this.content.slice(0, -1);
			return;
		}

		if(true) this.content += key.sequence;
	}

    render() {
        // Determine rendered portion of input.
        let end = this.content.length;
        let start = (end > this.length) ? (end - this.content.length) : 0;

        // Make pad based on number of padding characters needed.
        let pad = ' '.repeat(Math.max(0, this.length - this.content.length));

        // Build string and render.
        let text = this.content.substring(start, end) + pad;
        this.canvas.writeText(this.x, this.y, text, 'white', this.bgColor);
    }
}

class pane {
    constructor (canvas, x, y, width, height, bgColor) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.bgColor = bgColor;


        this.content = [];
        this.defaultLine = {updated: true, content: ' '.repeat(this.width)};
        this.title = { ...this.defaultLine };

        for(let l = 0; l < this.height - 1; l++) {
            this.content.push({ ...this.defaultLine });
        }
    }

    setTitle(text) {
        let title = ' ' + text;
        this.title.content = title + ' '.repeat(Math.max(0, this.width - title.length));;
        this.title.updated = true;
    }

    setLine(y, text) {
        const content = text + ' '.repeat(Math.max(0, this.width - text.length));
        this.content[y].content = content;
        this.content[y].updated = true;
    }

    render() {

        if(this.title.updated !== false) {
            this.canvas.writeText(this.x, this.y, this.title.content, 'white', 'black');
        }
        
        for(let l = 0; l < (this.height - 1); l++) {
            let line = this.content[l];

            if(line.updated) {
                this.canvas.writeText(this.x, this.y + (l + 1), line.content, 'white', 'blue');
                this.content[l].updated = false;
            }
        }
    }
}

// Keep this class.
class scrollLog {
    constructor (canvas, x, y, width, height, bgColor, mouseScroll = true) {
        this.canvas = canvas;
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.bgColor = bgColor;

        this.logs = [];
        this.pos = 5;


        this.mouseScroll
        this.rendering = false;
        this.updated = false;
        this.canvas.on('mouse-scroll', (dir) => {
            //this.log('scrolled! ' + dir.dir);
            this.adjustScroll(dir.dir);
        })
    }

    clear() {
        this.logs = [];
    }

    // -1 to scroll up, 1 to scroll down.
    adjustScroll(index) {

        if(this.logs.length < this.height) return;

        // We'll use this.pos to determine the lowest index to render, aka the top item.
        if(index > 0 && this.pos < (this.logs.length - this.height)) {
            this.pos ++;
        }

        if(index < 0 && this.pos > 0) {
            this.pos --;
        }
    }

    log(text) {

        //if(typeof text !== 'string') throw new Error('INVALID INPUT! FUCK!')
        
        let input = '' + text;
        let lines = [];

        if(typeof input !== 'string') throw new Error('INVALID INPUT! FUCK!')

        // Break the input into lines that fit within the width
        if (input.length > this.width) {
            let exp = new RegExp(`.{1,${this.width - 4}}`, 'g');
            lines = input.match(exp);
            for(let l = 1; l < lines.length; l++) {
                lines[l] = '    ' + lines[l];
            }
        } else {
            lines.push(input);
        }

        // Add the lines to the logs
        this.logs.push(...lines);
        this.updated = true;
    }

    async render() {
        if (this.rendering === true) return; // Remove the check for updated
    
        // Prevent concurrent rendering. Only allow new frames to render if the previous one is done.
        this.rendering = true;
        for (let y = 0; y < this.height; y++) {
            let yPos = (this.y + this.height) - y - 1;
            let logPos = (this.logs.length - 1) - (y + this.pos);

    
            
            let content = (this.logs[logPos] === undefined) ? '' : this.logs[logPos];
            let pad = ' '.repeat(Math.max(0, this.width - content.length));
            this.canvas.writeText(this.x, yPos, content + pad, 'white', this.bgColor);
        }
    
        this.rendering = false;
        // this.updated = false; // Optionally keep track of updates if needed elsewhere
    }
    
    
}

function selftest () {
    let test = new botUI();
    test.init();

    test.render();
    test.autoRender();
}

//selftest();

module.exports = botUI;
