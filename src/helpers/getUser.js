function getUser(User,userId) {

    return new Promise( resolve => {
        User.findById(userId, (error,user) => {
            if (error) {
                const err = {status: 500, error: JSON.stringify(error)}
                resolve(err)
            } else {
                if (user === null) {
                    resolve({user: false, status: 401});
                } else {
                    resolve(user)
                }
            }
        })
    })
}


module.exports = getUser;
