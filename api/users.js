/* eslint-disable no-useless-catch */
require("dotenv").config();
const express = require("express");
const router = express.Router();
const jwt = require('jsonwebtoken')

router.use((req, res, next) => {
    console.log("A request is being made to /users");
  
    next(); // THIS IS DIFFERENT
});
  
const { 
    getUser, 
    getUserByUsername, 
    createUser, 
    getPublicRoutinesByUser, 
    getAllRoutinesByUser 
} = require('../db');

// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const _user = await getUserByUsername(username);
        if (_user) {
            res.send({
                error: 'Error',
                name: 'DuplicateUsername',
                message: `User ${username} is already taken.`
            });
        } else if (password.length < 8) {
            // throw Error("Password Too Short!");
            res.send({
                error: "Error",
                name: "Password-Too-Short",
                message: "Password Too Short!"
            });
        } else {
            const user = await createUser({ username, password });

            const token = jwt.sign({ 
                id: user.id, 
                username: user.username
            }, process.env.JWT_SECRET, {
                expiresIn: '1w'
            });

            res.send({ message: "thanks for signing up", token, user });
        }
    } catch (error) {
        console.log(error);
        next(error);
    } 
});

// POST /api/users/login
router.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    // request must have both
    if (!username || !password) {
        next({
            name: "MissingCredentialsError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUser({ username, password });

    if (user) {
        // create token & return to user
        const token = jwt.sign(
            {
                id: user.id, 
                username:user.username
            }, process.env.JWT_SECRET
        )
        res.send({ message: "you're logged in!", token, user });
    } else {
        next({ 
            name: 'IncorrectCredentialsError', 
            message: 'Username or password is incorrect'
        });
    }
    } catch(error) {
        console.log(error);
        next(error);
    }
});

// GET /api/users/me
router.get('/me', async (req, res, next) => { 
    try {
        if (req.user) {
            res.send({ id: req.user.id, username: req.user.username });
        } else {
            res.status(401).send({
                error: "Error",
                name: "NotLoggedIn",
                message: "You must be logged in to perform this action"
            });
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
});

// GET /api/users/:username/routines
router.get("/:username/routines", async (req, res, next) => {
    const { username } = req.params;
    const publicRoutines = await getPublicRoutinesByUser({ username });
    const routines = await getAllRoutinesByUser({ username });

    try {
        if(req.user.username === username) {
            res.send(routines);
        } else {
            res.send(publicRoutines);
        }
        
    } catch (error) {
        next(error);
    }
})

module.exports = router;
