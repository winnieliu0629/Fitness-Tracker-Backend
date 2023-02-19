const express = require('express');
const router = express.Router();
const { 
    getRoutineActivityById,
    getRoutineById,
    updateRoutineActivity,
    canEditRoutineActivity,
    destroyRoutineActivity
} = require('../db');

// PATCH /api/routine_activities/:routineActivityId
router.patch("/:routineActivityId", async (req, res, next) => {
    const { routineActivityId } = req.params;
    const { count, duration } = req.body;

    try {
        const routineActivity = await getRoutineActivityById(routineActivityId);
        const routine = await getRoutineById(routineActivity.routineId);
        const userCanEdit = await canEditRoutineActivity(routineActivityId, req.user.id);

        if (!userCanEdit) {
            res.send({
                error: "Error",
                name: "UnauthorizedUser",
                message: `User ${req.user.username} is not allowed to update ${routine.name}`
            })
        } else {
            const updateRoutineActicity = await updateRoutineActivity({ id: routineActivityId, count, duration });
            res.send(updateRoutineActicity)
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", async (req, res, next) => {
    const { routineActivityId } = req.params;
    try {
        const routineActivity = await getRoutineActivityById(routineActivityId);
        const routine = await getRoutineById(routineActivity.routineId);

        if (req.user.id === routine.creatorId) {
            const deleteRoutineActicity = await destroyRoutineActivity(routineActivityId);
            res.send(deleteRoutineActicity)
        } else {
            res.status(403).send({
                error: "Error",
                name: "UnauthorizedUser",
                message: `User ${req.user.username} is not allowed to delete ${routine.name}`
            })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})

module.exports = router;
