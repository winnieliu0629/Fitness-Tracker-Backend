const client = require("./client");

async function createRoutine({ creatorId, isPublic, name, goal }) {
  try {
    const { rows: [ routine ] } = await client.query(`
      INSERT INTO routines("creatorId", "isPublic", name, goal) 
      VALUES($1, $2, $3, $4) 
      ON CONFLICT (name) DO NOTHING
      RETURNING *;
    `, [creatorId, isPublic, name, goal]);
    
    // return the new routine
    return routine;
  } catch(error) {
    console.log("Error creating routines!")
  }
}

async function getRoutineById(id) {
  try{
    const { rows: [routine] } = await client.query(`
      SELECT * 
      FROM routines
      WHERE id =${id};
    `);

    return routine;
  } catch (error) {
    console.log("Error getting routines by id!")
  }
}

async function getRoutinesWithoutActivities() {
  try{
    const { rows: routine } = await client.query(`
      SELECT * 
      FROM routines;
    `);

    return routine;
  } catch (error) {
    console.log("Error getting routines!")
  }
}

async function getAllRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.*
      FROM routines 
      JOIN users ON routines."creatorId" = users.id;
    `);
    
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON activities.id = routine_activities."activityId";
    `);

    routines.forEach((routine) => {
      routine.activities = activities.filter(activity => activity.routineId === routine.id)
    });

    return routines;
  } catch (error) {
    console.log("Error getting all routines!")
  }
}

async function getAllPublicRoutines() {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.*
      FROM routines 
      JOIN users ON routines."creatorId" = users.id
      WHERE "isPublic" = true;
    `);
    
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON activities.id = routine_activities."activityId";
    `);

    routines.forEach((routine) => {
      routine.activities = activities.filter(activity => activity.routineId === routine.id)
    });

    return routines;
  } catch (error) {
    console.log("Error getting all public routines!")
  }
}

async function getAllRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.*
      FROM routines 
      JOIN users ON routines."creatorId" = users.id
      WHERE username = $1;
    `, [username]);
    
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON activities.id = routine_activities."activityId";
    `);

    routines.forEach((routine) => {
      routine.activities = activities.filter(activity => activity.routineId === routine.id)
    });

    // await attachActivitiesToRoutines(routines);

    return routines;
  } catch (error) {
    console.log("Error getting routines by user!")
  }
}

async function getPublicRoutinesByUser({ username }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.*
      FROM routines 
      JOIN users ON routines."creatorId" = users.id
      WHERE username = $1 AND "isPublic" = true;
    `, [username]);
    
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON activities.id = routine_activities."activityId";
    `);

    routines.forEach((routine) => {
      routine.activities = activities.filter(activity => activity.routineId === routine.id)
    });

    return routines;
  } catch (error) {
    console.log("Error getting all public routines by user!")
  }
}

async function getPublicRoutinesByActivity({ id }) {
  try {
    const { rows: routines } = await client.query(`
      SELECT users.username AS "creatorName", routines.*
      FROM routines 
      JOIN users ON routines."creatorId" = users.id
      JOIN routine_activities ON routine_activities."routineId" = routines.id
      WHERE routine_activities."activityId" = $1 AND "isPublic" = true;
    `, [id]);
    
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities 
      JOIN routine_activities ON activities.id = routine_activities."activityId";
    `);

    routines.forEach((routine) => {
      routine.activities = activities.filter(activity => activity.routineId === routine.id)
    });


    return routines;
  } catch (error) {
    console.log("Error getting all public routines by user!")
  }
}

async function updateRoutine({ id, ...fields }) {
  // build the set string
  const setString = Object.keys(fields).map(
    (key, index) => `"${ key }"=$${ index + 1 }`
  ).join(', ');

  // return early if this is called without fields
  if (setString.length === 0) {
    return;
  }

  try {
      const { rows: [ routine ] } = await client.query(`
        UPDATE routines
        SET ${ setString }
        WHERE id=${id}
        RETURNING *;
      `, Object.values(fields));

  return routine;
  } catch (error) {
    console.log("Error updating the routine!")
  }
}

async function destroyRoutine(id) {
  const { rows: [routine] } = await client.query(`
  DELETE FROM routine_activities
  WHERE "routineId" = $1;
  `, [id]);

  await client.query(`
  DELETE FROM routines
  WHERE "id"=$1
  RETURNING *;
  `, [id]);

  return routine;
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
};
