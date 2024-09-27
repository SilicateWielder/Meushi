const properties = {
    component_id: 'moveToRelativePosition',
}

let meushi = null;

async function moveToRelativePosition(dx, dy, dz) {
    function round(number) {
      return (number < 0) ? Math.ceil(number) : Math.floor(number);
    }
  
    const coords = {
      x: round(meushi.bot.entity.position.x),
      y: round(meushi.bot.entity.position.y),
      z: round(meushi.bot.entity.position.z),
    };
  
    const targetPosition = {
      x: coords.x + parseInt(dx),
      y: coords.y + parseInt(dy),
      z: coords.z + parseInt(dz),
    };
    
    meushi.log(`Position - X: ${coords.x} Y: ${coords.y} Z: ${coords.z}`);
    meushi.log(`Moving by X: ${dx} Y: ${dy} Z: ${dz}`);
    meushi.log(`Moving from X: ${coords.x}, Y: ${coords.y}, Z: ${coords.z} to X: ${targetPosition.x}, Y: ${targetPosition.y}, Z: ${targetPosition.z} ...`)
  
    const mcDataInstance = meushi.mcData(meushi.bot.version);
    const movements = new meushi.Movements(meushi.bot, mcDataInstance);
    movements.canDig = false;
    movements.allow1by1towers = false;
  
    meushi.bot.pathfinder.setMovements(movements);
    meushi.bot.pathfinder.setGoal(new meushi.goals.GoalBlock(targetPosition.x, targetPosition.y, targetPosition.z));
  
    return ({old: coords, new: targetPosition});
}

function init (source) {
    meushi = source;
}

module.exports = {
    'properties': properties,
    'init': init,
    'executable': moveToRelativePosition,
}