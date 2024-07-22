const express = require('express');
const router = express.Router();
const token = require('../jwt');
const sqlite = require('sqlite3');

router.get('/', (req, res) => {
    if (req.session.username == undefined) {
        res.redirect('/accounts/sign_in');
    } else {
        res.redirect(`/user/${req.session.username}`);
    }
});

router.get('/:username', (req, res) => {
    const is_my_profile = (req.session.username === req.params.username);
    const db = new sqlite.Database('./database/database.db');
    db.get(`SELECT * FROM user WHERE name="${req.params.username}";`, (err, row) => {
        if (row == undefined) {
            res.render('user.html', {
                username: undefined, description_display: ['찾을 수 없는 사용자에요!'], description: undefined, is_my_profile: false
            });
        } else {
            const desc = (row.desc == undefined) ? undefined : row.desc.split('\n');
            res.render('user.html', {
                username: row.name, description_display: desc, description: desc, is_my_profile: is_my_profile
            });
        }
    });
    db.close();
});

module.exports = router;