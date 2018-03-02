const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
//to get .env config
require('dotenv').config()
//connect to MongoDB
mongoose.Promise = global.Promise
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/Recurly', {useMongoClient: true})
const db = mongoose.connection

//handle mongo error
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', ()=>{
    // we're connected!
})

//to clear db if needed
// db.dropDatabase()

//use sessions for tracking logins
app.use(session({
    secret: 'work hard',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}))

// parse incoming requests
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))


// include routes
const routes = require('./routes/router')
app.use('/', routes)

// catch 404 and forward to error handler
app.use((req, res, next) => {
    const err = new Error('File Not Found')
    err.status = 404
    next(err)
})

// error handler
// define as the last app.use callback
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send(err.message)
})


// listen on port 5000
app.listen(process.env.PORT || 5000,() => {
    console.log('Express app listening on port 5000')
})