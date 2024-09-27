
const properties = {
    component_id: 'moveToExactPosition',
}

let meushi = null;

async function moveToExactPosition(x, y, z) {
    meushi.log(`Moving to X: ${x} Y: ${y} Z: ${z}`)
    const mcDataInstance = meushi.mcData(meushi.bot.version);
    const movements = new meushi.Movements(meushi.bot, mcDataInstance);
  
    movements.canDig = false;
    movements.allow1by1towers = false;

    meushi.bot.pathfinder.setMovements(movements);
    meushi.bot.pathfinder.setGoal(new meushi.goals.GoalBlock(x, y, z));

    return;
}

function init (source) {
    meushi = source;
}

module.exports = {
    'properties': properties,
    'init': init,
    'executable': moveToExactPosition,
}