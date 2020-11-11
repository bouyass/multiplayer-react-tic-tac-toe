const users = []

const addToUsers = (id) => {
    if(!checkIfExist(id)){
        users.push(id)
    }
    console.log(users.length + " opponent request")
}

const removeFromUsers = (id) => {
    if(checkIfExist(id)){
        users.splice(users.indexOf(id),1)
    }
    console.log(users.length + " opponent request")
}

const checkIfExist = (id) => {
    let exist = false
    if(users.indexOf(id)> -1){
        exist = true
    }else{
        exist = false
    } 
    return exist
} 

const isEmpty = () => {
    return users.length === 0
}

const getOpponent = () => {
    if(!isEmpty()){
        return users[0]
    }
}

module.exports = {
    addToUsers : addToUsers,
    removeFromUsers: removeFromUsers,
    checkIfExist: checkIfExist,
    getOpponent: getOpponent
}