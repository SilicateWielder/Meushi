const properties = {
	admin_only: false,
	command_id: 'packages',
	help_text: 'shows package information.',
	version_id: '0.2',
	protected: true,
}

let meushi = null;

let package_message = '';

function buildCounterMain() {
	const commands = meushi.commands.getModulesList();
    const components = meushi.components.getModulesList();

    const total = commands.length + components.length;

	package_message = `Meushi! Core V.${meushi.version} total packages: ${total} (${commands.length} commands, and ${components.length} components.)`;
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function packagesLoadSingle(packageId, user) {
	let packageList = meushi.commands.identifyModules('./commands');
	
	for(let p = 0; p < packageList.length; p++) {
		let root = packageList[p].split('.')[0];

		if(root === packageId) {
			meushi.commands.loadSingle(packageId);
			meushi.chat(`Loaded package "${packageId}"!`)
			return;
		}
	}
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function packagesCheckObsolete(user) {
	const commands = meushi.commands.getModulesList();

	let obsoleteCommands = [];
	for(let i = 0; i < commands.length; i++) {
		let sample = meushi.commands.retrieve(commands[i]);
		
		if(sample.properties.version_id === undefined) {
			obsoleteCommands.push(commands[i]);
		}
	}

	const obsoleteCount = obsoleteCommands.length;

	meushi.chat(`Found ${obsoleteCount} obsolete commands: ${obsoleteCommands.join(', ')}`, user)
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function packagesReportVersion(packageId, user) {
	let package = meushi.commands.retrieve(packageId);

	if(package === undefined) {
		meushi.chat(`The package "${packageId}" is not installed.`, user)
	}

	meushi.chat(`The package @ ${packageId} is version ${package.properties.version_id}`, user);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function packagesReloadSingle(packageId, user) {
	let path = meushi.commands.retrieveModule(packageId).filepath;

	if(path === undefined) {
		meushi.chat(`No package is loaded by the name '${packageId}'`, user);
		return;
	}

	if(meushi.commands.retrieveModule(packageId).properties.protected) {
		meushi.chat(`This command is protected! To reload it, you'll need to restart me!`, user);
		return;
	}

	meushi.commands.unload(packageId);
	meushi.commands.loadSingle(path);
	let package = meushi.commands.retrieve(packageId, user)

	if(package != undefined) {
		if(package.init != undefined) {
			package.init(meushi);
		}
	} else {
		meushi.chat('No package found!', user);
	}
	
	meushi.chat(`I've reloaded the package @ ${path}! `, user);
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function packagesMain(b, user, params) {
	if(package_message === '') {
		buildCounterMain(); 
	}

	if(params.length > 0) {
		if(params[0] === 'check-commands') {
			packagesCheckObsolete();
		}

		if( params.length > 1 && params[0] === 'load' && params[1] )
		{
			packagesLoadSingle(params[1], user);
		}

		if( params.length > 1 && params[0] === 'unload' && params[1] )
		{
			if (!meushi.commands.checkExists(params[1])) return;
			meushi.commands.unload(params[1]);
			meushi.chat(`I've unloaded ${params[1]}!`);
		}

		if( params.length > 1 && params[0] === 'reload' && params[1] )
		{
			packagesReloadSingle(params[1], user);
		}

		if( params.length > 1 && params[0] === 'version' && params[1] ) {
			packagesReportVersion(params[1], user);
		}

		if( params.length > 1 && params[0] === 'components') {
			const packages = meushi.components.getModulesList();

			meushi.chat(`I have ${packages.length} components installed! `)
		}

		return;
	}

    meushi.chat(package_message);

	return undefined
}

function init(source) {
	meushi = source;
}

module.exports = {
	'properties': properties,
	'init': init,
	'executable': packagesMain,
}
