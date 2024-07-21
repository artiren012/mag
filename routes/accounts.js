const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const sqlite = require('sqlite3');
const token = require('../jwt');

router.get('/', (req, res) => {
    if (req.session.username != undefined) {
        res.redirect(`/user/${req.session.username}`);
    } else {
        res.redirect('./sign_in');
    }
});

router.get('/sign_in', (req, res) => {
    if (req.session.username != undefined) return res.redirect(`/user/${req.session.username}`);
    res.render('accounts/sign_in.html');
});

router.post('/sign_in', (req, res) => {
    const db = new sqlite.Database('./database/database.db');
    db.get(`SELECT * from user where id="${req.body.id}";`, (err, row) => {
        if (err) {
            db.close();
            return res.status(500).render('error.html', {
                error_code: '500 Internal Error', error_message: 'Internal Error'
            });
        }
        const password = crypto.createHash('sha256').update(req.body.password).digest('base64');
        if (row == undefined) return res.send('accounts/sign_in', { password_error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        if (row.password === password) {
            req.session.username = row.name;
            req.session.isLogined = true;
            res.redirect(`/user/${row.name}`);
        } else {
            res.render('accounts/sign_in', { password_error: '아이디 또는 비밀번호가 일치하지 않습니다.' });
        }
    });
});

router.get('/sign_up', (req, res) => {
    if (req.session.username != undefined) return res.redirect(`/user/${req.session.username}`);
    res.render('accounts/sign_up.html');
});

router.post('/sign_up', (req, res) => {
    const db = new sqlite.Database('./database/database.db');
    let isError = false;
    let args = {
        id_error: undefined, password_error: undefined, password_check_error: undefined, email_error: undefined
    };

    db.get(`SELECT * FROM user WHERE id="${req.body.id}";`, (err, row1) => {
        if (row1 != undefined) {
            isError = true;
            args.id_error = '이미 존재하는 아이디에요!';
        }
        db.get(`select * from user where email="${req.body.email}";`, (err, row2) => {
            if (row2 != undefined) {
                isError = true;
                args.email_error = '이미 가입된 이메일이에요!';
            }
            const password_a = crypto.createHash('sha256').update(req.body.password).digest('base64');
            const password_b = crypto.createHash('sha256').update(req.body.password_check).digest('base64');
            if (password_a !== password_b) {
                isError = true;
                args.password_check_error = '비밀번호가 일치하지 않아요!';
            }

            if (isError) { res.render('accounts/sign_up.html', args); }
            else {
                db.run(`INSERT INTO user(id, name, email, password) VALUES("${req.body.id}", "${req.body.username}", "${req.body.email}", "${password_a}");`, (err) => {
                    if (err) {
                        db.close();
                        return res.status(500).render('error.html', {
                            error_code: '500 Internal Error', error_message: 'Internal Error'
                        });
                    }
                    req.session.username = row.name;
                    req.session.isLogined = true;
                    res.redirect(`/user/${row.name}`);
                });
            }
        });
    });
    db.close();
});

module.exports = router;