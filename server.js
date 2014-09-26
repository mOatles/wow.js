var WebSocketServer = require('ws').Server,
    HTTP = require('http'),
    Express = require('express'),
    net = require('net');

var app = Express();
app.use(Express.static(__dirname + '/public'));
var server = HTTP.createServer(app);
var wss = new WebSocketServer({ server: server });

var Config = {
  game_host: '192.168.0.110',
  web_port: 8080
};

wss.on('connection', function (ws) {
  var targetport;
  var gsconnection = new net.Socket({ type: 'tcp4' });

  console.log('WS Client connected');

  ws.on('message', function (message, flags) {
    if (flags.binary) {
      if (gsconnection) {
        gsconnection.write(message);
      }
      return;
    }

    message = JSON.parse(message);

    if (message.port && !targetport) {
      targetport = parseInt(message.port);
      gsconnection.connect(targetport, Config.game_host, function() {
        console.log('Gameclient connected on port', targetport);
      });

      gsconnection.on('error',function(err){console.log(err);});
      gsconnection.on('data',function(data){ws.send(data,{binary:true})});
      gsconnection.on('end',function(){console.log('Gameclient End Connection');});
      gsconnection.on('close',function(){console.log('Gameclient Connection Closed');ws.close();});
    }
  });

  ws.on('close', function (code, message) {
    gsconnection.destroy();
    console.log('WS Close!', code, message)
  });
});

server.listen(Config.web_port);
