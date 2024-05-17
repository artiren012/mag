const express = require('express');
const nunjucks = require('nunjucks');
const app = express();

app.set('view engine', 'html');
nunjucks.configure('./views', { express: app });

app.listen(8080, () => {
    console.log('Run at localhost:8080');
});

app.get('/', (req, res) => {
    res.render('index.html', {
       title: 'Hello World!' 
    });
});