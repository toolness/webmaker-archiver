var express = require('express');

var webmakerArchiver = require('./webmaker-archiver');

var PORT = process.env.PORT || 3000;

var app = express();

app.param('username', function(req, res, next, value) {
  if (!/^[A-Za-z0-9_\-]+$/.test(value)) return next('route');
  req.username = value;
  next();
});

app.get('/user/:username.zip', function(req, res, next) {
  res.type('application/zip');
  res.set('Content-Disposition',
          'attachment; filename=' + req.username + '.zip;');
  webmakerArchiver.create(req.username, 'zip').pipe(res);
});

app.use(express.static(__dirname + '/static'));

app.listen(PORT, function() {
  console.log("listening on port " + PORT);
});
