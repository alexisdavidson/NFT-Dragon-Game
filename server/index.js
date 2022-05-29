import express from 'express'
import mysql from 'mysql'
import dotenv from 'dotenv'
import cors from 'cors'
import bodyParser from 'body-parser'
import moment from 'moment'
import { battle } from './battle.js'

const app = express()

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
    let sqlSelect = "SELECT * FROM match_history"

    const walletAddress = req.query.walletAddress
    const lettersAndNumbersPattern = /^[a-z0-9]+$/;
    if(walletAddress != undefined && walletAddress != null && !walletAddress.match(lettersAndNumbersPattern))
        return res.status(400).json({ err: "Invalid input. No special characters and no numbers, please!"})

    if (walletAddress != undefined && walletAddress != null) sqlSelect += " WHERE wallet1 = '" + walletAddress + "' OR wallet2 = '" + walletAddress + "'"
    sqlSelect += " ORDER BY id DESC"
    if (walletAddress != undefined && walletAddress != null) sqlSelect += " LIMIT 10"
    sqlSelect += ";"
    
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

    const lettersAndNumbersPattern = /^[a-z0-9]+$/;
    if(walletAddress != undefined && walletAddress != null && !walletAddress.match(lettersAndNumbersPattern))
        return res.status(400).json({ err: "Invalid input. walletAddress no special characters and no numbers, please!"})

    const numbersPattern = /^[0-9]+$/;
    if(dragonId != undefined && dragonId != null && !dragonId.match(numbersPattern))
        return res.status(400).json({ err: "Invalid input. dragonId only numbers!"})

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

    const lettersAndNumbersPattern = /^[a-z0-9]+$/;
    if(walletAddress != undefined && walletAddress != null && !walletAddress.match(lettersAndNumbersPattern))
        return res.status(400).json({ err: "Invalid input. walletAddress no special characters and no numbers, please!"})

    const numbersPattern = /^[0-9]+$/;
    if(dragonId != undefined && dragonId != null && !dragonId.match(numbersPattern))
        return res.status(400).json({ err: "Invalid input. dragonId only numbers!"})

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

app.post('/api/play_match', async (req, res) => {
    const walletAddress1 = req.body.walletAddress1
    const walletAddress2 = req.body.walletAddress2
    const dragonId1 = req.body.dragonId1
    const dragonId2 = req.body.dragonId2
    console.log("Call play match " + walletAddress1 + " (" + dragonId1 + ") vs " + walletAddress2 + " (" + dragonId2 + ")")

    const lettersAndNumbersPattern = /^[a-z0-9]+$/;
    if(walletAddress1 != undefined && walletAddress1 != null && !walletAddress1.match(lettersAndNumbersPattern))
        return res.status(400).json({ err: "Invalid input. walletAddress1 no special characters and no numbers, please!"})
    if(walletAddress2 != undefined && walletAddress2 != null && !walletAddress2.match(lettersAndNumbersPattern))
        return res.status(400).json({ err: "Invalid input. walletAddress2 no special characters and no numbers, please!"})

    const numbersPattern = /^[0-9]+$/;
    if(dragonId1 != undefined && dragonId1 != null && !dragonId1.match(numbersPattern))
        return res.status(400).json({ err: "Invalid input. dragonId1 only numbers!"})
    if(dragonId2 != undefined && dragonId2 != null && !dragonId2.match(numbersPattern))
        return res.status(400).json({ err: "Invalid input. dragonId2 only numbers!"})

    const battleLog = await battle(dragonId1, dragonId2)
    if (battleLog == null) {
        console.log("battleLog is null")
        return;
    }

    const winner = battleLog.winner
    delete battleLog["winner"]
    console.log("battleLog:")
    console.log(battleLog)

    const sqlInsert = "INSERT INTO match_history (wallet1, wallet2, dragon1, dragon2, battle_log, winner, date_played) VALUES (?, ?, ?, ?, ?, ?, '" + moment.utc().format('YYYY-MM-DD HH:mm:ss') + "');"
    db.query(sqlInsert, [walletAddress1, walletAddress2, dragonId1, dragonId2, JSON.stringify(battleLog), winner], (err, result) => {
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

    const numbersPattern = /^[0-9]+$/;
    if(matchId != undefined && matchId != null && !matchId.match(numbersPattern))
        return res.status(400).json({ err: "Invalid input. matchId only numbers!"})

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