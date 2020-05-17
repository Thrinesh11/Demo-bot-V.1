'use strict';
var dotenv = require('dotenv');
dotenv.load();

const express = require('express');
const app = express();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;
const AI_SESSION_ID = process.env.AI_SESSION_ID;

const dialogflow = require('apiai');
const ai = dialogflow(ACCESS_TOKEN);


app.use(express.static(__dirname + '/views')); // HTML Pages
app.use(express.static(__dirname + '/public')); // CSS, JS & Images


const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});

const socketio = require('socket.io')(server);
socketio.on('connection', function(socket){
  console.log('a user connected');
});

//Serve UI
app.get('/', (req, res) => {
   res.sendFile('index.html');;
});

socketio.on('connection', function(socket) {
  socket.on('chat request', (text) => {
    console.log('Message1: ' + text);

    // Get a reply from API.ai

    let aiReq = ai.textRequest(text, {
      sessionId: AI_SESSION_ID
    });

    aiReq.on('response', (response) => {
      let aiResponse = response.result.fulfillment.speech;
      console.log('AI Response: ' + aiResponse);
      socket.emit('ai response', aiResponse);
    });

    aiReq.on('error', (error) => {
      console.log(error);
    });

    aiReq.end();

  });
});
