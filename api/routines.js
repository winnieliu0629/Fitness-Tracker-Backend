const express = require('express');
const router = express.Router();
const { 
    getRoutineById,
    getAllRoutines,
    getRoutineActivitiesByRoutine,
    createRoutine,
    updateRoutine,
    destroyRoutine,
    attachActivitiesToRoutines
} = require('../db');


// GET /api/routines
router.get('/', async (req, res) => {
    const allRoutines = await getAllRoutines();
    res.send(allRoutines);
});

// POST /api/routines
router.post('/', async (req, res, next) => {
    const { isPublic, name, goal } = req.body;
    try {
        if (!req.user) {
            res.send({
                error: "Error",
                name: "UnauthorizedUser",
                message: "You must be logged in to perform this action"
            })
        } else {
            const newRoutine = await createRoutine({ creatorId:req.user.id, isPublic, name, goal });
            res.send(newRoutine);
        }
    } catch(error) {
        next(error)
    } 
});

// PATCH /api/routines/:routineId
router.patch("/:routineId", async (req, res, next) => {
    const { routineId } = req.params;
    const { creatorId, isPublic, name, goal } = req.body;

    try {
        const routine = await getRoutineById(routineId);

        if (!req.user) {
            res.status(403).send({
                error: "Error",
                name: "NotLoggedIn",
                message: "You must be logged in to perform this action"
            });
        }
        
        if (routine.creatorId === req.user.id) {
            const updateActicity = await updateRoutine({ id: routineId, creatorId, isPublic, name, goal });
            res.send(updateActicity)
        } else {
            res.status(403).send({
                error: "Error",
                name: "UnauthorizedUserError",
                message: `User ${req.user.username} is not allowed to update ${routine.name}`
            })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})

// DELETE /api/routines/:routineId
router.delete("/:routineId", async (req, res, next) => {
    const { routineId } = req.params;
    try {
        const routine = await getRoutineById(routineId);

        if (req.user.id === routine.creatorId) {
            const deleteRoutine = await destroyRoutine(routineId);
            res.send(deleteRoutine)
        } else {
            res.status(403).send({
                error: "Error",
                name: "UnauthorizedUserError",
                message: `User ${req.user.username} is not allowed to delete ${routine.name}`
            })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})

// POST /api/routines/:routineId/activities
router.post("/:routineId/activities", async (req, res, next) => {
    const { routineId } = req.params;
    const { activityId, count, duration } = req.body;

    try {
        const routineActivities = await getRoutineActivitiesByRoutine({ id: routineId });
        const hasActivity = routineActivities.find(routineActivity => routineActivity.activityId === activityId)

        if (hasActivity) {
            res.send({
                error: "Error",
                name: "RoutineActivityAlreadyExistsError",
                message: `Activity ID ${activityId} already exists in Routine ID ${routineId}`
            })

        } 
        
        const updateActivity = await attachActivitiesToRoutines({ activityId, count, duration })
        res.send(updateActivity)
        
    } catch (error) {
        console.log(error);
        next(error);
    }
})

module.exports = router;
