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
        if (err) return console.log(err);
        let desc = undefined;
        if (row == undefined) {
            db.close();
            desc = ['찾을 수 없는 사용자에요!'];
            return res.render('user/index.html', { username: req.params.username, description_display: desc, is_my_profile: is_my_profile });
        } else {
            desc = (row.desc == undefined) ? undefined : row.desc.split('\n');
        }
        db.all(`SELECT * FROM post WHERE id="${row.id}"`, (err, rows) => {
            rows.sort((a, b) => { return b.idx - a.idx; });
            res.render('user/index.html', { username: req.params.username, description_display: desc, posts: rows, is_my_profile: is_my_profile });
            db.close();
        });
    });
});

router.get('/:username/posting', (req, res) => {
    if (req.session.username !== req.params.username || !req.session.isLogined 
        || req.session.uid == undefined)
        return res.redirect(`/user/${req.params.username}`);
    const db = new sqlite.Database('./database/database.db');
    db.get(`SELECT id FROM user WHERE name="${req.params.username}";`, (err, row) => {
        if (err) return console.log(err);
        const desc = (row.desc == undefined) ? undefined : row.desc.split('\n');
        res.render('user/posting.html', { username: req.params.username, description_display: desc });
        db.close();
    });
});

router.post('/:username/posting', (req, res) => {
    if (req.session.username !== req.params.username || !req.session.isLogined 
        || req.session.uid == undefined)
        return res.redirect(`/user/${req.params.username}`);
    const db = new sqlite.Database('./database/database.db');
    const date = new Date();
    let post = {
        id: req.session.uid,
        date: `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`,
        title: req.body.title,
        content: req.body.content,
        likes: 0
    };
    console.log(post);
    db.run(`INSERT INTO post(id, date, title, content, likes) VALUES("${post.id}", "${post.date}", "${post.title}", "${post.content}", ${post.likes});`, (err) => {
        if (err) return console.log(err);
        res.redirect(`/user/${req.params.username}`);
    });
    db.close();
});

router.get('/:username/edit', (req, res) => {
    const is_my_profile = (req.session.username === req.params.username);
    if (!req.session.isLogined || req.session.username == undefined) 
        return res.redirect('/accounts/sign_in');
    else if (!is_my_profile)
        return res.redirect(`/user/${req.session.username}/edit`);

    const db = new sqlite.Database('./database/database.db');
    db.get(`SELECT * FROM user WHERE name="${req.params.username}";`, (err, row) => {
        if (row == undefined) {
            res.render('user/edit.html', {
                username: undefined, description_display: ['찾을 수 없는 사용자에요!'], description: undefined, is_my_profile: false
            });
        } else {
            const desc = (row.desc == undefined) ? undefined : row.desc.split('\n');
            res.render('user/edit.html', {
                username: row.name, description_display: desc, description: row.desc
            });
        }
    });
    db.close();
});

module.exports = router;