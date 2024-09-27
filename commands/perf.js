const properties = {
	admin_only: false,
	command_id: 'perf',
	help_text: 'shows performance metrics',
	version_id: '1.0',
}

const os = require('os');
const { execSync } = require('child_process');

let meushi = null;

// Largest first, smallest last. This is VERY important for formatBytes to operate.
const dataUnits = {
	'GB': 1073741824,
	'MB': 1048576,
	'KB': 1024,
	'B': 1,
}

function getGpuStats() {
	const resultsRaw = execSync('nvidia-smi --query-gpu=name,utilization.gpu,memory.used,memory.total --format=csv,noheader').toString();
	const resultsList = resultsRaw.split(', ');
	
	return {
		name: resultsList[0],
		utilization: resultsList[1],
		memUsed: resultsList[2],
		memTotal: resultsList[3]
	}
}

function formatBytes(bytes) {
	const factors = Object.keys(dataUnits);
	
	for(let i = 0; i < factors.length; i++) {
		let unit = factors[i];
		let weight = dataUnits[unit];

		if(bytes > weight) {
			return (bytes / weight).toFixed(2) + unit;
		}
	}
}

async function perf_main(b, user, params) {
	const memUse = process.memoryUsage();
	const cpuCount = os.cpus();
	const cpuLoad = os.loadavg();
	const heapUsed = formatBytes(os.totalmem - os.freemem);
	const memoryAvail = formatBytes(os.totalmem);
	const gpuStats = getGpuStats();

	//const msg = `Using ${cpuLoad[0]}% of ${cpuCount.length} cores/cpus. Using ${heapUsed} of ${memoryAvail} memory`;
	const msg = `USAGE STATS - CPU (${cpuCount.length} cores): ${cpuLoad[0]}, GPU (${gpuStats.name}): ${gpuStats.utilization} (${gpuStats.memUsed}/${gpuStats.memTotal}), RAM: ${heapUsed}/${memoryAvail}.`;

    meushi.chat(msg, user);
}

function init(source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': perf_main,
}
