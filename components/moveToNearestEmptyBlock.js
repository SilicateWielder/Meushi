const properties = {
    component_id: 'moveToNearestEmptyBlock',
}

const Vec3 = require('vec3');

const offets = {
	north: {x: 0, y: 0, z: 1},
	south: {x: 0, y: 0, z: -1},
	east: {x: -1, y: 0, z: 0},
	west: {x: 1, y: 0, z: 0}
}

// Points back to the main bot instance which loads this. 
let mueshi = null;

async function moveToNearestEmptyBlock () {
    const moveToExactPosition = meushi.components.retrieveExecutable('moveToExactPosition');
    const currentPos = meushi.bot.entity.position;

    const range = 2; // Search range (3x3 diameter means radius of 1 around the bot)

    // Get nearby blocks within the specified range
    const nearbyBlocks = [];

    const blockNorth = {x: currentPos.x + offets.north.x, y: currentPos.y + offets.north.y, z: currentPos.z + offets.north.z};
    const blockSouth = {x: currentPos.x + offets.south.x, y: currentPos.y + offets.south.y, z: currentPos.z + offets.south.z};
    const blockEast = {x: currentPos.x + offets.east.x, y: currentPos.y + offets.east.y, z: currentPos.z + offets.east.z};
    const blockWest = {x: currentPos.x + offets.west.x, y: currentPos.y + offets.west.y, z: currentPos.z + offets.west.z};


    // Check if a nearby empty block was found
    if (nearbyBlocks.length > 0) {
        let emptyBlock = nearbyBlocks[nearbyBlocks.length - 1];
        meushi.log("GOAL:" + JSON.stringify(emptyBlock));

        // Move the bot to the target position

        meushi.log(JSON.stringify(emptyBlock) + '-' + JSON.stringify(currentPos));
        //await meushi.moveToExactPosition(emptyBlock.x, emptyBlock.y, emptyBlock.z);
        await moveToExactPosition(emptyBlock.x , emptyBlock.y, emptyBlock.z);
        //meushi.bot.pathfinder.goto(targetPosition);
    } else {
        // No empty block found within the specified range
        meushi.log('No empty block found nearby.');
    }
}

function init (source) 
{
    meushi = source;

    meushi.bot.on('message', async (message, pos, sender, ver, src = source) => {
        let msg = meushi.parseMessage(message);

        if(msg.message === 'Walk a block to speak in chat.') {
            await moveToNearestEmptyBlock(src);
        }
    })
}

module.exports = {
    'properties': properties,
    'init': init,
    'executable': moveToNearestEmptyBlock,
}