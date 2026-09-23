
const Appt = require("./models/appt");
const { Server } = require('socket.io');
const app = require("./app");
const { CHAT_PORT, FRONTEND_URL } = require("./config");
http = require('http');

const server = http.createServer(app);

let chatRoom = ''; 
let allUsers = [];

const io = new Server(server, {
  cors: {
    // Only needed when the React dev server runs on another port; behind the
    // nginx proxy the chat is same-origin
    origin: FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  console.log(`User connected ${socket.id}`);

  socket.on('join_room', async (data) => {

    const { username, room } = data; 

    socket.join(room); 
    chatRoom = room;
    
    allUsers.push({ id: socket.id, username, room });
    chatRoomUsers = allUsers.filter((user) => user.room === room);
    console.log(allUsers);
    console.log(room);
    socket.to(room).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);
    const messages = await Appt.getMessages(room);
    socket.emit('messages', messages);
    socket.emit('chatroom_users', chatRoomUsers);

  });

  socket.on('send_message', async (data) => {
    io.in(data.room).emit('receive_message', data);
    await Appt.addMessage(data);
  });

  socket.on('disconnect', () => {
    console.log('User ' + socket.id + " has disconnected");
    allUsers = allUsers.filter((user) => user.id != socket.id);
    socket.to(chatRoom).emit('chatroom_users', allUsers);
    socket.emit('chatroom_users', allUsers);
  });

  socket.on('cancel', (data) => {
    console.log('User ' + socket.id + " has disconnected");
    allUsers = allUsers.filter((user) => user.id != socket.id);
    socket.to(chatRoom).emit('user_cancelled');
    socket.emit('user_cancelled');
  });



  
});

server.listen(CHAT_PORT, () => console.log(`Chat server running on port ${CHAT_PORT}`));
