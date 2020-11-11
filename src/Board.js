import React, {useState, useEffect} from 'react'
import './Board.css'

var aiPlayer = 'X'
var humanPlyer = 'O'
var humanPlyerB = 'T'

var winCombos = [
    [0,1,2],
    [3,4,5],
    [6,7,8],
    [0,3,6],
    [1,4,7],
    [2,5,8],
    [0,4,8],
    [6,4,2],
]

function Board(props) {

    const [board, setBoard] = useState([])
    const [elements, setElements] = useState([])
    const [socket, setSocket] = useState()
    const [replayStart, setReplayStart] = useState(false)
    

    useEffect(() => {
        setSocket(props.socket)
        for(let i = 0; i<9; i++){
            const element = document.getElementById(i)
            if(props.start){
                element.addEventListener('click',turnClick, false)
            }
            element.innerText = ""
            elements.push(element)
            board.push(i)
        }

        props.socket.on('play', (message) => {
            if(props.player === 'O'){
                board[message] = 'X'
                drawMove(message, 'X')
            }else{
                board[message] = 'O'
                drawMove(message, 'O') 
            }
            activateElements()
        })

        props.socket.on('tie', message => {
            if(props.player === 'O'){
                board[message] = 'X'
                drawMove(message, 'X')
            }else{
                board[message] = 'O'
                drawMove(message, 'O') 
            }
            checkTie()
        })

        props.socket.on('gameOver', message => {
            if(props.player === 'O'){
                board[message.move] = 'X'
                drawMove(message.move, 'X')
            }else{
                board[message.move] = 'O'
                drawMove(message.move, 'O') 
            }
            gameOver(message.game)
        })

        props.socket.on('opponentQuit', message => {
            alert('Your opponent left the game')
            props.quit('forceQuit')
        })

        props.socket.on('replayRequest', message => {
            let choice = window.confirm('Your opponent wants to defeat you again')
            if(choice){
               setReplayStart(true)
               resetGame()
               activateElements()
               props.socket.emit('replayAccept', {opponent: props.opponent})
            }else{
                props.quit('forceQuit')
            }
            
        })

        props.socket.on('startReplay', message => {
            setReplayStart(true)
            resetGame()
            disableElements()
        } )

    },[])

    const resetGame = () => {
        
        setBoard([])
        
        for(let i=0; i<9;i++){
            board[i]=i
        }
        console.log(board)
        for(let i = 0; i<9; i++){
            const element = document.getElementById(i)
            if(replayStart){
                element.addEventListener('click',turnClick, false)
            }
            element.innerText = ""
            element.style.backgroundColor = ''
            board.push(elements.push(element))
        }
        
        document.querySelector('.endGame').style.display = "none"
        document.querySelector('.text').innerText = ""
        
    }




    const turnClick = (square) => {
        if(typeof board[square.target.id] == 'number'){
            turn(square.target.id, props.player)
            if(props.typeGame === 'machine'){
                if(!winning(board, humanPlyer) && !checkTie()) turn(bestSpot(board), aiPlayer)
            }else{
                const gamewon = winning(board, props.player)
                const tie = checkTie()
                console.log(tie+ " et " + gamewon)
                if(!gamewon && !tie){
                    props.socket.emit('turn', {move: square.target.id, opponent: props.opponent})
                    disableElements()
                }else{
                    if(tie){
                        props.socket.emit('tie', {move: square.target.id, opponent: props.opponent})
                    }else{
                        props.socket.emit('victory', {move: square.target.id, opponent: props.opponent, game: gamewon})
                    }
                }
            }
        }
    }

    

    const disableElements = () => {
        elements.map(element => element.removeEventListener('click',turnClick, false))
    }

    const activateElements = () => {
        elements.map(element => element.addEventListener('click',turnClick, false))
    }

    const bestSpot = (board) => {
        return minimax(board, aiPlayer).index
    }

    function turn(squareID, player){
        board[squareID] = player
        document.getElementById(squareID).innerText = player
        let gameWon = winning(board, player)
        if(gameWon) gameOver(gameWon)
    }
    
    const checkTie = () => {
        if(getEmptycells().length == 0){
            for(var i = 0; i < elements.length; i++){
                elements[i].style.backgroundColor = "green"
                elements[i].removeEventListener('click', turnClick, false)
            }
            declareWinner("Tie game")
            return true
        }
    
        return false
    }

    function gameOver(gameWon){
        for(let index of winCombos[gameWon.index]){
            document.getElementById(index).style.backgroundColor = gameWon.player == props.player ? "skyblue" : "red"         
        }
    
        for(var i =0; i<elements.length; i++){
            elements[i].removeEventListener('click',turnClick, false)
        }
    
        declareWinner(gameWon.player == props.player ? "You won !!" : "You lose !!" )
    }

    function declareWinner(who){
        document.querySelector('.endGame').style.display = "block"
        document.querySelector('.text').innerText = who
    }
    

    const drawMove = (cell, player) =>{ 
        if(player == humanPlyer){
            elements[cell].innerText = humanPlyer
        }else {
            elements[cell].innerText = aiPlayer
        }
    } 

    const winning = (board, player) => {
        let plays = board.reduce((a,e,i) => (e===player) ? a.concat(i) : a,[])
        let gameWon = null
        for(let [index, win] of winCombos.entries()){
            if(win.every(elem => plays.indexOf(elem) > -1)){
                gameWon = {index: index, player: player}
                break;
            }
        }
        return gameWon
    }

    const getEmptycells = () => {
        return board.filter(cell => typeof cell == 'number')
    }
    

    
    const minimax = (newBoard, player) => {

    var availableSpots = getEmptycells(newBoard)

    if(winning(newBoard, humanPlyer)){
        return {score: -10}
    }else if(winning(newBoard, aiPlayer)){
        return {score: 10}
    }else if(availableSpots.length === 0){
        return {score: 0}
    }

    var moves = []
    // loop throught the availables spots
    for(let i =  0; i< availableSpots.length; i++){
        // create an object for each and store the index of that spot
        var move = {}
        move.index = newBoard[availableSpots[i]]

        //set the empty spot to the ccurrent player
        newBoard[availableSpots[i]] = player

        /* collect the score resulted from calling minimax
        on the opponent of the current player */

        if(player == aiPlayer){
            let result = minimax(newBoard, humanPlyer)
            move.score = result.score
        }else{
            let result = minimax(newBoard, aiPlayer)
            move.score = result.score
        }

        // reset the sport empty

        newBoard[availableSpots[i]] = move.index

        //push the object to the array

        moves.push(move)
    }

    var bestMove
    if(player === aiPlayer){
        var bestScore = -10000
        for(let i = 0; i<moves.length; i++){
            if(moves[i].score > bestScore){
                bestScore = moves[i].score
                bestMove = i
            }
        }
    }else{
        var bestScore = 10000
        for(let i = 0; i<moves.length; i++){
            if(moves[i].score < bestScore){
                bestScore = moves[i].score
                bestMove = i
            }
        }
    }
    return moves[bestMove]
    }

    const replayHandler = () => {
        props.socket.emit('replay', {opponent: props.opponent})
    }


    return (
        <div className="board">
            <div className="buttons">
                <button onClick={replayHandler} > Replay </button>
                <button onClick={props.quit}> Quit </button>
            </div>
            <table>
                <tr>
                    <td id="0"></td>
                    <td id="1"></td>
                    <td id="2"></td>
                </tr>
                <tr>
                    <td id="3"></td>
                    <td id="4"></td>
                    <td id="5"></td>
                </tr>
                <tr>
                    <td id="6"></td>
                    <td id="7"></td>
                    <td id="8"></td>
                </tr>
            </table>
            <div className="endGame">
                <div className="text"></div>
            </div>
        </div>
    )
}

export default Board
