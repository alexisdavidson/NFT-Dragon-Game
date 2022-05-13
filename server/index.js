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

    let sqlSelect = "SELECT * FROM matchmaking_pool WHERE wallet_address = ? AND dragon_id = ? LIMIT 1;"
    
    db.query(sqlSelect, [walletAddress, dragonId], (err, result) => {
        if (err) console.log(err)
        if (result) {
            console.log(result)
            if (result.length > 0) {
                console.log("Found dragonId already in pool")
                result[0] = true
                res.send(result)
            }
            else {
                const sqlInsert = "INSERT INTO matchmaking_pool (wallet_address, dragon_id, date_joined) VALUES (?, ?, '" + moment.utc().format('YYYY-MM-DD HH:mm:ss') + "');"
                db.query(sqlInsert, [walletAddress, dragonId], (err2, result2) => {
                    if (err2) console.log(err2)
                    if (result2) console.log(result2.insertId)
            
                    res.send(result2)
                })
            }
        }
    })
})

app.post('/api/play_match', (req, res) => {
    const walletAddress1 = req.body.walletAddress1
    const walletAddress2 = req.body.walletAddress2
    const dragonId1 = req.body.dragonId1
    const dragonId2 = req.body.dragonId2
    const winner = Math.floor(Math.random() * 2) + 1 // todo: the actual fight to determine winner (deterministic)

    const sqlInsert = "INSERT INTO match_history (wallet1, wallet2, dragon1, dragon2, winner, date_played) VALUES (?, ?, ?, ?, ?, '" + moment.utc().format('YYYY-MM-DD HH:mm:ss') + "');"
    db.query(sqlInsert, [walletAddress1, walletAddress2, dragonId1, dragonId2, winner], (err, result) => {
        if (err) console.log(err)
        if (result) {
            const sqlDelete = "DELETE FROM matchmaking_pool WHERE (wallet_address = ? AND dragon_id = ?) OR (wallet_address = ? AND dragon_id = ?);"
            db.query(sqlDelete, [walletAddress1, dragonId1, walletAddress2, dragonId2], (err2, result2) => {
                if (err2) console.log(err2)
                if (result2) {
                    console.log(result)
                    console.log(result2)
                    console.log(result.insertId)
                    res.send([result.insertId])
                }
            })
        }
    })
})

app.get('/api/get_match', (req, res) => {
    const matchId = req.query.matchId

    console.log("Get Match " + matchId)

    const sqlSelect = "SELECT * FROM match_history WHERE id = ? LIMIT 1;"
    
    db.query(sqlSelect, [matchId], (err, result) => {
        if (err) console.log(err)
        if (result) console.log(result)

        res.send(result)
    })
})

app.listen(process.env.PORT, () => {
    console.log('Running on port ' + process.env.PORT)
})