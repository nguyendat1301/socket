import {WebSocketServer} from "ws";

function sendJson(socket, payload){
    if(socket.readyState === socket.OPEN){
        socket.send(JSON.stringify(payload));}
    else return;
}

function broadcast(wss, payload){
    for(const client of wss.clients){
        if(client.readyState !== client.OPEN) return;
        client.send(JSON.stringify(payload));
    }
}

export function attachWebSocketServer(server){
    const wss = new WebSocketServer({
        server,
        path:'/ws',
        maxPayload: 1024 * 1024 , // 1 MB
    })
    
    wss.on('connection', (socket) => {
        sendJson(socket, { type: 'connected' });

        socket.on('error',console.error);
    });

    function broadcastMatchCreate(match){   
        broadcast(wss,{type:'match_create', data:match});
    }

    return {broadcastMatchCreate};
}