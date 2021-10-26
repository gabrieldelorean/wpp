const WebSocket = require('ws');


function onError(ws, err) {
    console.error(`onError: ${err.message}`);
}

function onMessage(ws, data) {
    console.log(`onMessage: ${data}`);
    ws.send(`recebido!`);
}


function onQR(ws, data) {

    ws.send(`recebido!`);
}

function onConnection(ws, req) {
    ws.on('message', data => onMessage(ws, data));
    ws.on('error', error => onError(ws, error));
    ws.on('qr', error => onError(ws, error));
    console.log(`onConnection`);
}




module.exports = (server) => {
    var wss = new WebSocket.Server({
        server
    });

    wss.on('connection', function connection(ws) {
    ws.on('message', function(message) {
       wss.broadcast(message);  
     });
    });

   
      wss.groupmsg = function groupmsg(id) {
        wss.clients.forEach(function each(client) {
           client.send(JSON.stringify({ event: 'groupmsg', id:id}));
         });
     };

        wss.grouptl = function groupmsg(id) {
        wss.clients.forEach(function each(client) {
           client.send(JSON.stringify({ event: 'grouptl', id:id}));
         });
     };


     wss.open = function open(user) {
        wss.clients.forEach(function each(client) {
           client.send(JSON.stringify({ event: 'open', data: user}));
         });
    };

    wss.qrcode = function qrcode(qr) {
        
        wss.clients.forEach(function each(client) {
           client.send(JSON.stringify({ event: 'qrcode', data: qr }));
         });
    };

    wss.closeqrcode = function closeqrcode() {
        wss.clients.forEach(function each(client) {
           client.send(JSON.stringify({ event: 'closeqrcode', show: false }));
         });
    };




    wss.broadcast = function broadcast(msg) {
        wss.clients.forEach(function each(client) {
            client.send(msg);
         });
    };

    

    console.log(`App Web Socket Server is running!`);
    return wss;
}