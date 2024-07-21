const express = require('express');
const router = express.Router();
const token = require('../jwt');

router.get('/', (req, res) => {
    if (req.session.username == undefined) {
        res.redirect('/accounts/sign_in');
    } else {
        res.redirect(`/user/${req.session.username}`);
    }
});

router.get('/:username', (req, res) => {
    res.send(req.session.username + '<br>' + req.params.username);
});

module.exports = router;