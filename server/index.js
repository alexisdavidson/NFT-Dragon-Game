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

const canFightOwnWallet = process.env.CANFIGHTOWNWALLET

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
    const sqlSelect = "SELECT * FROM match_history ORDER BY id DESC;"
    
    db.query(sqlSelect, (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)

        res.send(result)
    })
})

// Get opponent from matchmaking pool
app.get('/api/get_opponent', (req, res) => {
    const walletAddress = req.query.walletAddress
    const dragonId = req.query.dragonId

    let sqlSelect = "SELECT * FROM matchmaking_pool WHERE wallet_address != ? AND dragon_id != ? LIMIT 1;"
    if (canFightOwnWallet === "TRUE") {
        sqlSelect = "SELECT * FROM matchmaking_pool WHERE dragon_id != ? AND dragon_id != ? LIMIT 1;"
    }
    
    db.query(sqlSelect, [walletAddress, dragonId], (err, result) => {
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

app.get('/api/play_match', (req, res) => {
    const walletAddress1 = req.query.walletAddress1
    const walletAddress2 = req.query.walletAddress2
    const dragonId1 = req.query.dragonId1
    const dragonId2 = req.query.dragonId2
    const winner = Math.floor(Math.random() * 2) + 1 // todo: the actual fight (deterministic)

    const sqlInsert = "INSERT INTO match_history (wallet1, wallet2, dragon1, dragon2, winner, date_played) VALUES (?, ?, ?, ?, ?, '" + moment.utc().format('YYYY-MM-DD HH:mm:ss') + "');"
    db.query(sqlInsert, [walletAddress1, walletAddress2, dragonId1, dragonId2, winner], (err, result) => {
        if (err) console.log(err)
        if (result) {
            console.log(result)
            console.log(result.insertId)
            res.send([result.insertId])
        }
    })
})

app.listen(process.env.PORT, () => {
    console.log('Running on port ' + process.env.PORT)
})