import express from "express";
import http from "http";
import cors from "cors";
import { Server } from "socket.io";

const app=express();
const httpServer=http.createServer(app);

app.use(cors({origin:true}));
app.get("/",(_,res)=>res.json({ok:true,service:"AZENA signaling",version:"1.0"}));
app.get("/health",(_,res)=>res.json({ok:true}));

const io=new Server(httpServer,{
  cors:{origin:"*",methods:["GET","POST"]},
  transports:["websocket","polling"]
});

const rooms=new Map();

io.on("connection",socket=>{
  socket.on("create-room",({room})=>{
    if(!room)return;
    if(rooms.has(room)){socket.emit("room-error","Такая комната уже существует.");return;}
    rooms.set(room,new Set([socket.id]));
    socket.join(room);
    socket.data.room=room;
    socket.emit("room-created",room);
  });

  socket.on("join-room",({room})=>{
    const members=rooms.get(room);
    if(!members){socket.emit("room-error","Комната не найдена. Сначала её нужно создать.");return;}
    if(members.size>=2){socket.emit("room-error","В этой версии комната рассчитана на 2 участников.");return;}
    members.add(socket.id);
    socket.join(room);
    socket.data.room=room;
    socket.emit("room-joined",room);
    socket.to(room).emit("peer-joined");
  });

  socket.on("signal",data=>{
    const room=data?.room;
    if(!room||!rooms.has(room))return;
    socket.to(room).emit("signal",data);
  });

  socket.on("leave-room",({room})=>{
    leave(socket,room);
  });

  socket.on("disconnect",()=>{
    if(socket.data.room)leave(socket,socket.data.room);
  });
});

function leave(socket,room){
  const members=rooms.get(room);
  if(!members)return;
  members.delete(socket.id);
  socket.to(room).emit("peer-left");
  socket.leave(room);
  socket.data.room=null;
  if(members.size===0)rooms.delete(room);
}

const port=process.env.PORT||3000;
httpServer.listen(port,"0.0.0.0",()=>console.log(`AZENA signaling server listening on ${port}`));
