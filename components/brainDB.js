const { IndexFlatL2, Index, IndexFlatIP, MetricType } = require('faiss-node');
const Ollama = require('ollama');


const properties = {
    component_id: 'brainDB',
}

let meushi = null;
let dbManager = null;

function init(source) {
    meushi = source;
	dbManager = meushi.components.retrieveExecutable('dbManager');
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////


// https://rxdb.info/articles/javascript-vector-database.html
// Alternatively... https://ewfian.github.io/faiss-node/
// Unsure if I trust Facebook/FAISS.
class brainDB {
    constructor (dbName, hostPath, model) {
        this.modelId = model;
        this.hostPath = hostPath;
        this.dbName = dbName;
        
        // Initialize and setup DB.
        this.memoryDB = new dbManager(`${dbName}.db`);
        this.memoryDB.addSetupScript(`CREATE TABLE IF NOT EXISTS ${this.dbName} (
        id INTEGER PRIMARY KEY,
        raw_data TEXT,
        embedding_data BLOB,
        embedding_model TEXT
    )`);
        this.memoryDB.init();

        // This is actually really cool, IMO.
        Object.defineProperty(this, 'ollama', {
            'value': new Ollama.Ollama({ 'host': this.hostPath }),
            'configurable': false,
        });

       this.dimensionality = 768;
       this.memoryVects = new IndexFlatL2(this.dimensionality);

	   const memories = this.memoryDB.prepare(`SELECT * FROM  ${this.dbName} ORDER BY id ASC;`).all();
	   for(let i = 0; i < memories.length; i++) {
			const mem = memories[i];
			this.memoryVects.add(JSON.parse(mem.embedding_data));
	   }
    }

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Generates embeddings for memorization and querying.
    async createEmbeddings(inputText) {
        const embeddings = await this.ollama.embed({
            model: this.modelId,
            input: inputText,
        });

        if(embeddings) {
            return embeddings;
        } else {
            throw new Error('No Embeddings returned.');
        }
    }

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Stores data to a destination.
    async memorizeText(inputText) {
        const rawEmbeddings = await this.createEmbeddings(inputText);
        const embeddings = rawEmbeddings.embeddings[0];

        const queryData = [
            inputText,
            JSON.stringify(embeddings),
            rawEmbeddings.model,
        ];

        const query = `INSERT INTO ${this.dbName} (raw_data, embedding_data, embedding_model) values (?, ?, ?)`;

        this.memoryDB.prepare(query).run(queryData);

        this.memoryVects.add(embeddings)
    }

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // Stores bulk data to a destination.
    async memorizeTextSet(inputTexts) {
        if(inputTexts.length === undefined) {
            throw new Error('Invalid input parameter. Must be a list.')
        }

        for(let t = 0; t < inputTexts.length; t++) {
            await this.memorizeText(inputTexts[t]);
        }
    }

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    getMemoryCount() {
        return this.memoryVects.ntotal();
    }

	///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    async queryMemory(query, quantity = 3) {
		const vecCount = this.memoryVects.ntotal();

		if(vecCount < quantity && vecCount > 0) {
			quantity = vecCount;
		}

        const rawEmbeddings = await this.createEmbeddings(query);
        const queryEmbeddings = rawEmbeddings.embeddings[0];

        const nearVects = this.memoryVects.search(queryEmbeddings, quantity);

        let results = [];

        for(let r = 0; r < nearVects.labels.length; r++) {
            const retrievalQuery = `SELECT raw_data from ${this.dbName} where id = ?`;
            const retrievalParam = [nearVects.labels[r] + 1];

            const res = this.memoryDB.prepare(retrievalQuery).get(retrievalParam);

            results.push(res.raw_data)
        }

        if(results == []) throw new Error('No memories found. Something is CRITICALLY wrong.')

        return results;
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    queryGet(query, params) {
        return this.memoryDB.prep(query).get(params);
    }

    ///////////////////////////////////////////////////////////////////////////////////////////////////////////////

    queryAll(query, params) {
        return this.memoryDB.prep(query).all(params);
    }
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////

module.exports = {
    'properties': properties,
    'init': init,
    'executable': brainDB,
}