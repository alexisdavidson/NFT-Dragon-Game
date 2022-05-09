const express = require('express')
const app = express()
const mysql = require('mysql')
const dotenv = require('dotenv')
const cors = require('cors')
const bodyParser = require('body-parser')
const moment = require('moment')

dotenv.config()

const db = mysql.createPool({
    host: process.env.DBHOST,
    user: process.env.DBUSER,
    password: process.env.DBPASSWORD,
    database: process.env.DB
})

app.use(cors())
app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))

app.get('/api/get_matchmaking_pool', (req, res) => {
    const sqlSelect = "SELECT * FROM matchmaking_pool;"
    
    db.query(sqlSelect, (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)

        res.send(result)
    })
})

app.get('/api/get_match_history', (req, res) => {
    const sqlSelect = "SELECT * FROM match_history;"
    
    db.query(sqlSelect, (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)

        res.send(result)
    })
})

app.post('/api/join_matchmaking_pool', (req, res) => {
    const walletAddress = req.body.walletAddress
    const dragonId = req.body.dragonId

    const sqlInsert = "INSERT INTO matchmaking_pool (wallet_address, dragon_id, date_joined) VALUES (?, ?, '" + moment.utc().format('YYYY-MM-DD HH:mm:ss') + "');"
    db.query(sqlInsert, [walletAddress, dragonId], (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)
    })
})

app.listen(process.env.PORT, () => {
    console.log('Running on port ' + process.env.PORT)
})