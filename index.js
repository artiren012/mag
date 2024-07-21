const express = require('express');
const session = require('express-session');
const path = require('path');
const bodyParser = require('body-parser');
const nunjucks = require('nunjucks');
const app = express();

app.set('view engine', 'html');
app.use(bodyParser.urlencoded({ extended: true }));

nunjucks.configure('./public/views', { express: app });
app.use(session({
    secret: 'u09w$fh!3',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, secure: false }
}));

app.use('/assets', express.static(path.join(__dirname, 'public/assets')));
app.use('/user', require('./routes/user'));
app.use('/accounts', require('./routes/accounts'));

app.listen(8080, () => {
    console.log('Run at http://localhost:8080');
});

app.get('/', (req, res) => {
    res.render('index.html', {
       message: (req.query.q != undefined) ? req.query.q : 
        'A Korean student developing various things such as web pages, applications, and games.'
    });
});

app.use((req, res) => {
    res.status(404).render('error.html', {
        error_code: '404 Not Found', error_message: `\'${req.path}\' is not found`
    });
});

app.use((err, req, res, next) => {
    res.status(500).render('error.html', {
        error_code: '500 Internal Error', error_message: 'Internal Error'
    });
    console.log(err);
});