const express= require('express')
const http= require('http')
const path= require('path');
const port= process.env.PORT||3000
const publicDirectoryPath = path.join(__dirname,'../public');
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage,generateLocationMessage} = require('./utils/messages');
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users')
const app = express();

const server=http.createServer(app);
const io=socketio(server)
app.use(express.static(publicDirectoryPath)); 

io.on('connection',(socket)=>{
  // console.log('new connection with io')
    
   
    socket.on('join',(options,callback)=>{

        const {error,user} = addUser({id:socket.id,...options})

         if(error)
          {
               return callback(error)
          }

        // console.log(user)

        socket.join(user.room)
        socket.emit('nwMsg',generateMessage('Admin','Welcome'))

        socket.broadcast.to(user.room).emit('nwMsg',generateMessage(user.username,`has joined`))
        io.to(user.room).emit('roomData',{
            room:user.room,
            users: getUsersInRoom(user.room)
        })
     callback()
    })

// message server get

     socket.on('sndMsg',(msg,callback)=>{

        const filter = new Filter();

        const user=getUser(socket.id)


        if(filter.isProfane(msg)){

            return callback('profanity is not allowed !!!')
        }

        io.to(user.room).emit('nwMsg',generateMessage(user.username,msg))

           callback('delivered')

     })

     socket.on('sendLocation',({lat,long},callback)=>{
        const user=getUser(socket.id)
        io.to(user.room).emit('locationMsg',generateLocationMessage(user.username,`https://google.com/maps?q=${lat},${long}`))
         callback()
     })

     socket.on('disconnect',()=>{

        const user= removeUser(socket.id)
         
        if(user)
        {
            io.to(user.room).emit('nwMsg',generateMessage('Admin',`${user.username}-has been left `))

            io.to(user.room).emit('roomData',{
                room:user.room,
                users: getUsersInRoom(user.room)
            })
        }
         
        
        
     })
})

server.listen(port,()=>{

    console.log('server is running on ', port)

})
