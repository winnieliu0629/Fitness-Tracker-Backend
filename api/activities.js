const express = require('express');
const router = express.Router();
const { 
    getAllActivities, 
    createActivity, 
    getActivityById, 
    getActivityByName, 
    getPublicRoutinesByActivity, 
    updateActivity 
} = require('../db');

// GET /api/activities/:activityId/routines
router.get("/:activityId/routines", async (req, res, next) => {
    const { activityId } = req.params;

    try {
        const activity = await getActivityById(activityId);

        if (!activity) {
            res.send({
                error: 'Error',
                name: 'ActivityNotFoundError',
                message: `Activity ${activityId} not found`
            })
        } else {
            const publicActivity = await getPublicRoutinesByActivity(activity);
            res.send(publicActivity)
        }

    } catch (error) {
        console.log(error);
        next(error);
    }
})

// GET /api/activities
router.get('/', async (req, res) => {
    const allActivities = await getAllActivities();
    res.send(allActivities);
})

// POST /api/activities
router.post('/', async (req, res, next) => {
    const { name, description } = req.body;
  
    try {
        const activityName = await getActivityByName(name);

        if (activityName) {
            res.send({
                error: "Error",
                name: "ActivityAlreadyExistsError",
                message: `An activity with name ${name} already exists`
            })
        } else {
            const newActivity = await createActivity({ name, description });
            res.send(newActivity);
        }
    } catch(error) {
        next(error)
    } 
});

// PATCH /api/activities/:activityId
router.patch("/:activityId", async (req, res, next) => {
    const { activityId } = req.params;
    const { name, description } = req.body;

    try {
        const getActivityId = await getActivityById(activityId);
        const activityName = await getActivityByName(name);

        if (!getActivityId) {
            res.send({
                error: "Error",
                name: "ActivityNotFoundError",
                message: `Activity ${activityId} not found`
            })
        } else if (activityName) {
            res.send({
                error: "Error",
                name: "ActivityAlreadyExistsError",
                message: `An activity with name ${name} already exists`
            })
        } else {
            const updateActicity = await updateActivity({ id: activityId, name, description });
            res.send(updateActicity)
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})

module.exports = router;
