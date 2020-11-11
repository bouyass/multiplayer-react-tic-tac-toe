import React, {useEffect, useState} from 'react'
import './App.css';
import Board from './Board'
import socketIOClient from "socket.io-client"

var socket = socketIOClient("http://127.0.0.1:9000");
var interval


function App() {

  const[startGame, setStartGame] = useState(false)
  const[typeGame, setTypeGame] = useState('')
  const[searchingOpponent, setSearcingOpponent] = useState(false)
  const[opponent, setOpponent] = useState()
  const[player, setPlayer] = useState()
  const[start, setStart] =useState()
  const[waitingTime, setWaitingTime] = useState(30)
  const[failedFindOpponent, setFailedFindOpponent] = useState(false)

  const startClickHandler = (type) => {
    setTypeGame(type)
    setStartGame(!startGame)
  }

  useEffect(() => {
    document.querySelector('.button').disabled = false
    document.querySelector('.button').disabled = false
  }, [])


  const findOpponent = (e) => {
    e.preventDefault()
    e.target.disabled = 'true'
    document.getElementById('startButton').disabled = true
    setSearcingOpponent(true)
    socket.emit('opponent', 'find an opponent')
    interval =  setInterval(() => {
      setWaitingTime(waitingTime => waitingTime  - 1)
    },1000)
  }



  const quitHandler = (message) => {
    if(typeGame === 'machine'){
      setStartGame(!startGame)
    }else{
      if(message.length > 0){
        setStartGame(!startGame)
      }else{
        socket.emit('quit', {opponent: opponent})
        setStartGame(!startGame)
      }
    }
  }

  socket.on('startGame', (message) => {
      setSearcingOpponent(false)
      setOpponent(message.socket)
      setPlayer(message.player)
      setStart(message.start)
      clearInterval(interval)
      startClickHandler('opponent')
  })

  socket.on('opponentNotFound', message => {
      clearInterval(interval)
      setFailedFindOpponent(true)
      setSearcingOpponent(false)
      document.querySelector('#findOpponentButton').disabled = false
      document.querySelector('#startButton').disabled = false
      setWaitingTime(30)
      var timeout = setTimeout(()=> {
        setFailedFindOpponent(false)
      },5000)
      clearTimeout(timeout)
  })


  return (
    <div className="App">
      <h1> Tic Tac Toe Game </h1>
      {
       ! startGame ?
        <div className="header">
          { failedFindOpponent ?  <span className="error"> <b>Sorry wern't able to find an opponent</b>  </span> : ''}
          <div className="buttons">
              <button className="button" id="startButton" onClick={() => startClickHandler('machine')} > Start the game </button>
              <button className="button" id="findOpponentButton" onClick={findOpponent}>  {searchingOpponent ? `Searching  ... (${waitingTime})` : 'Find an opponent' }   </button>
          </div>
        </div>
        :
        <Board typeGame={typeGame} start={start} opponent={opponent} player={player} socket={socket} quit={quitHandler} />
      }
        

    </div>
  );
}

export default App;
