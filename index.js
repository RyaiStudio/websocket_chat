var express = require('express');
var cors = require('express-cors'); // allow access origin
var bodyParser = require('body-parser');
var app = express();
// var server = require('http').createServer(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type,X-CSRF-Token');
    next();
});

var Pusher = require('pusher');

var pusher = new Pusher({
  appId: '419263',
  key: '62310c0e42042fc35881',
  secret: 'ab2a95437b53095a75ee',
  cluster: 'ap1',
  encrypted: true
});

app.get('/pusher/auth', function(req, res) {

  var query = req.query;
  var socketId = query.socket_id;
  var channel = query.channel_name;
  var callback = query.callback;

  var presenceData = {
    user_id: query.user_id,
    user_info: { name: query.name }
  };

  var auth = JSON.stringify(pusher.authenticate(socketId, channel, presenceData));
  var cb = callback.replace(/\"/g,"") + "(" + auth + ");";

  res.set({
    "Content-Type": "application/javascript"
  });

    res.send(cb);
});

app.post('/typing', function (req, res) {
    pusher.trigger(req.body.channel, 'typing', {
      "res": req.body
    })
    res.send(req.body)
})

app.post('/notyping', function (req, res) {
    pusher.trigger(req.body.channel, 'notyping', {
      "res": req.body
    })
    res.send(req.body)
})

app.post('/chat', function (req, res) {
  pusher.trigger(req.body.channel, 'chat', {
      "res": req.body
  })
  res.send(req.body)
})

var port = process.env.PORT || 5000;
app.listen(port, function(){
  console.log('listening to port '+ port)
});