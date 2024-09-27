const BetterSqlite3 = require('better-sqlite3');


const properties = {
    component_id: 'dbManager',
}

class dbManager extends BetterSqlite3 {
    constructor(filename, options) {
        super(filename, options);

        this.setupScripts = []
    };

    addSetupScript(query) {
        this.setupScripts.push(query);
    }

    addSetupScriptsBulk(queries) {
        this.setupScripts.push(...queries);
    }

    init() {
        for(let i = 0; i < this.setupScripts.length; i++) {
            this.prepare(this.setupScripts[i]).run();
        }
    }
}

module.exports = {
    'properties': properties,
    'init': undefined,
    'executable': dbManager,
}