const express = require('express')
const path = require('path')
const io = require('socket.io')
const http = require('http')
const {addToUsers, getOpponent, removeFromUsers} = require('./handler')
const { time } = require('console')


const app = express()
const server = http.createServer(app)
const socketio = io(server)

var tiemout

socketio.on('connection', (socket) => {

    socket.on('opponent', (message) => {
        const id = getOpponent()
        if(id !== undefined){
            socket.emit('startGame', {socket:id, player:'X',start:true})
            socket.broadcast.to(id).emit('startGame', {socket:socket.id, player:'O', start:false})
            removeFromUsers(id)
            removeFromUsers(socket.id)
            clearTimeout(timeout)
        }else{
            addToUsers(socket.id)
            console.log('trying to found an opponent ... ')
            timeout = setTimeout(()=> {   
                socket.emit('opponentNotFound', "Sorry we wern't able to find an opponent")
                removeFromUsers(socket.id)
            },30000)
        }
    })

    socket.on('turn', (message) => {
        socket.broadcast.to(message.opponent).emit('play', message.move)
    })

    socket.on('tie', message => {
        socket.broadcast.to(message.opponent).emit('tie', message.move)
    })

    socket.on('victory', message => {
        socket.broadcast.to(message.opponent).emit('gameOver', {move: message.move, game: message.game})
    })

    socket.on('quit', message => {
        console.log('opponent want to leave the game')
        socket.broadcast.to(message.opponent).emit('opponentQuit', 'Game left the game')
    })

    socket.on('replay', message => {
        socket.broadcast.to(message.opponent).emit('replayRequest', 'replay request')
    })

    socket.on('replayAccept', message => {
        socket.broadcast.to(message.opponent).emit('startReplay', 'replay request accepted')
    })
})


server.listen(9000, ()=> {
   console.log('server listening on port 9000') 
})