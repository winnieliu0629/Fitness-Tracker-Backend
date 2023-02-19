const client = require("./client");

async function addActivityToRoutine({ routineId, activityId, count, duration }) {
  try {
    const { rows: [ routine_activity ] } = await client.query(`
    INSERT INTO routine_activities("routineId", "activityId", count, duration) 
    VALUES($1, $2, $3, $4) 
    RETURNING *;
    `, [routineId, activityId, count, duration]);
    
    // return the new routine_activity
    return routine_activity;
  } catch(error) {
    console.log("Error creating routines!")
  }
}

async function getRoutineActivityById(id) {
  try{
    const { rows: [routine_activity] } = await client.query(`
    SELECT * 
    FROM routine_activities
    WHERE id =${id};
    `);

    return routine_activity;
  } catch (error) {
    console.log("Error getting routines by id!")
  }
}

async function getRoutineActivitiesByRoutine({ id }) {
  try{
    const { rows: routine_activity } = await client.query(`
    SELECT * 
    FROM routine_activities
    WHERE "routineId" =${id};
    `);

    return routine_activity;
  } catch (error) {
    console.log("Error getting routine activity by routine!")
  }
}

async function updateRoutineActivity({ id, ...fields }) {
    // build the set string
    const setString = Object.keys(fields).map(
      (key, index) => `"${ key }"=$${ index + 1 }`
    ).join(', ');
  
    // return early if this is called without fields
    if (setString.length === 0) {
      return;
    }
  
    try {
        const { rows: [ routine_activity ] } = await client.query(`
          UPDATE routine_activities
          SET ${ setString }
          WHERE id=${id}
          RETURNING *;
        `, Object.values(fields));
  
    return routine_activity;
    } catch (error) {
      console.log("Error updating the routine activity!")
    }
}

async function destroyRoutineActivity(id) {
  const { rows: [routine_activity] } = await client.query(`
  DELETE FROM routine_activities
  WHERE id = $1
  RETURNING *;
  `, [id]);

  return routine_activity;
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try{
    const { rows: [routine] } = await client.query(`
    SELECT *
    FROM routine_activities
    JOIN routines ON routine_activities."routineId" = routines.id AND routine_activities.id =$1;
    `, [routineActivityId]);

    return routine.creatorId === userId;

  } catch (error) {
    console.log("Error editing routine activity!")
  }
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
