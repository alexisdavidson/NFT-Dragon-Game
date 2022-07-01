import { useState, useEffect } from 'react'
import { Row, Col, ProgressBar } from 'react-bootstrap'
import {useLocation} from 'react-router-dom';
import Axios from 'axios'
import attackIcon from '../images/attack.png'
import defenseIcon from '../images/defense.png'
import luckIcon from '../images/luck.png'
import configData from "./configData.json";

const Match = (account) => {
    const [match, setMatch] = useState([])
    const [loading, setLoading] = useState(true)
    const location = useLocation();
    const [items, setItems] = useState([])
    const [matchLength, setMatchLength] = useState([])
    const [matchInitiated, setMatchInitiated] = useState(false)
    const [startingDragon, setStartingDragon] = useState(0)

    let playedDragonId = 1
    let dragonNoflip = null
    let dragonFlip = null
    let currentActiveDragon = 0
    let displayOffset = 2
    let elementsShown = 0

    const typeToHealth = (breed) => {
        if (breed == "Green") {
            return 55
        }
        if (breed == "Gold") {
            return 60
        }
        if (breed == "Red") {
            return 70
        }
        
        return 50
    }

    const setCurrentActiveDragon = (activeDragon) => {
        console.log("setCurrentActiveDragon " + currentActiveDragon + " to " + activeDragon)
        currentActiveDragon = activeDragon
    }

    const loadOpenSeaItems = async (match) => {
        let dragons = []
        dragons.push(await fetch(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${match.dragon1}`)
        .then((res) => res.json())
        .then((res) => { return res })
        .catch((e) => {
          console.error(e)
          console.error('Could not talk to OpenSea')
          return null
        }))

        dragons.push(await fetch(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${match.dragon2}`)
        .then((res) => res.json())
        .then((res) => { return res })
        .catch((e) => {
          console.error(e)
          console.error('Could not talk to OpenSea')
          return null
        }))

        if (dragons[1].owner.account === account) playedDragonId = 2

        let items = []
        for(let i = 0; i < dragons.length; i ++) {
            items.push({
                ImageUrl: dragons[i].image_url,
                Health: typeToHealth(dragons[i].traits.filter(e => e.trait_type == "Breed")[0].value),
                HealthMax: typeToHealth(dragons[i].traits.filter(e => e.trait_type == "Breed")[0].value),
                Attack: dragons[i].traits.filter(e => e.trait_type == "Attack")[0].value,
                Luck: dragons[i].traits.filter(e => e.trait_type == "Luck")[0].value,
                Defense: dragons[i].traits.filter(e => e.trait_type == "Defense")[0].value
            })
        }

        setLoading(false)
        setItems(items)
    }

    // const showDragons = () => {
    //     var elementResult = document.querySelector('.dragon-hide');
    //     if (elementResult != null) {
    //         elementResult.classList.remove('dragon-hide');
    //         elementResult.classList.add('linko-show');
    //         elementResult = document.querySelector('.dragon-hide');
    //         elementResult.classList.remove('dragon-hide');
    //         elementResult.classList.add('linko-show');
    //     }
    // }

    const attackText = (dragonId) => {
        // console.log("dragonId: " + dragonId + ", playerDragonId: " + playedDragonId)
        if (dragonId === playedDragonId)
            return "You attack"
        else return "Opponent attacks"
    }

    const goFirstText = (dragonId) => {
        // console.log("dragonId: " + dragonId + ", playerDragonId: " + playedDragonId)
        if (dragonId === playedDragonId)
            return "You go first!"
        else return "Opponent goes first!"
    }

    const defeatedText = () => {
        let battle_log = JSON.parse(match.battle_log)
        let lastDragonAttacking = battle_log[battle_log.length - 1].dragon

        if (lastDragonAttacking === playedDragonId)
            return "You have defeated the opponent!"
        else return "You have been defeated."
    }

    const victoryOrDefeatText = () => {
        let battle_log = JSON.parse(match.battle_log)
        let lastDragonAttacking = battle_log[battle_log.length - 1].dragon

        if (lastDragonAttacking === playedDragonId)
            return "Victory!"
        else return "Defeat."
    }

    const displayMatch = async () => {
        console.log("Display match " + location.state.matchId)

        Axios.get(configData.SERVER_URL + 'api/get_match', {
            params: {
                matchId: location.state.matchId
            }
        }).then((response) => {
            const matchTemp = response.data[0]
            setMatch(matchTemp)
            setMatchLength(JSON.parse(matchTemp.battle_log).length)
            setStartingDragon(JSON.parse(matchTemp.battle_log)[0].dragon)

            console.log("matchTemp.battle_log[0].dragon: " + currentActiveDragon)
            console.log("Match winner is " + matchTemp.winner)

            loadOpenSeaItems(matchTemp)
        })
    }

    const updateDragonGlow = () => {
        console.log("updateDragonGlow, currentActiveDragon: " + currentActiveDragon)
        let dragonGlow = document.querySelector('.dragon-glow');
        if (dragonGlow != null) dragonGlow?.classList?.remove('dragon-glow')

        if (currentActiveDragon === 1) {
            dragonFlip.classList.add('dragon-glow');
        }
        else {
            dragonNoflip.classList.add('dragon-glow');
        }
    }

    const startBattleEventAnimation = () => {
        // console.log("startBattleEventAnimation")
        // console.log(currentActiveDragon)
        // console.log(dragonFlip)
        // console.log(dragonNoflip)

        if (currentActiveDragon === 1) {
            dragonFlip.classList.add('dragon-flip-attack');
            dragonNoflip.classList.add('dragon-hurt');
        }
        else {
            dragonNoflip.classList.add('dragon-attack');
            dragonFlip.classList.add('dragon-flip-hurt');
        }
        
        setCurrentActiveDragon(1 - (currentActiveDragon - 1) + 1)

        setTimeout(function(){
            if (elementsShown - displayOffset < matchLength) {
                let dragonAttack = document.querySelector('.dragon-attack')
                if (dragonAttack != null) dragonNoflip.classList.remove('dragon-attack');
                let dragonHurt = document.querySelector('.dragon-hurt')
                if (dragonHurt != null) dragonNoflip.classList.remove('dragon-hurt');
                let dragonFlipAttack = document.querySelector('.dragon-flip-attack')
                if (dragonFlipAttack != null) dragonFlip.classList.remove('dragon-flip-attack');
                let dragonFlipHurt = document.querySelector('.dragon-flip-hurt')
                if (dragonFlipHurt != null) dragonFlip.classList.remove('dragon-flip-hurt');

                updateDragonGlow();
            }
        }, 1200);
    }

    const damageDragon = (dragonId) => {
        setTimeout(function(){
            let attackValue = JSON.parse(match.battle_log)[elementsShown - displayOffset - 1].attackValue
            console.log("attackValue: " + attackValue)
            
            items[dragonId].Health -= attackValue
            if (items[dragonId].Health < 0) items[dragonId].Health = 0
            console.log("Dragon " + dragonId + ": " + items[dragonId].Health)

            setItems([...items])
        }, 300);
    }

    const createIntervalLoop = () => {
        function displayText() {
            var element = document.querySelector('.linko-hide');
          
            if (null === element) {
                var elementResult = document.querySelector('.result-hide');
                if (elementResult != null) {
                    elementResult.classList.remove('result-hide');
                    elementResult.classList.add('linko-show');
                    elementResult = document.querySelector('.result-hide');
                    elementResult.classList.remove('result-hide');
                    elementResult.classList.add('linko-show');
                }
            } else {
                element.classList.remove('linko-hide');
                element.classList.add('linko-show');

                // console.log("element != null")
                // console.log("elementsShown: " + elementsShown)
                // console.log("displayOffset: " + displayOffset)
                // console.log("matchLength: " + matchLength)

                if (elementsShown >= displayOffset && elementsShown - displayOffset < matchLength) {
                    // console.log("Call startBattleEventAnimation")
                    startBattleEventAnimation()
                    damageDragon(currentActiveDragon - 1)
                }

                elementsShown += 1
            }
          }
          
          return setInterval(function () {
                displayText();
            }, 3000)
    }

    const clearAllIntervals = () => {
        const interval_id = setInterval(function(){}, Number.MAX_SAFE_INTEGER);
        for (let i = 1; i < interval_id; i++) {
            clearInterval(i);
        }
    }

    useEffect(() => {
        clearAllIntervals()
        displayMatch()
    }, [])

    useEffect(() => {
        if (!(matchInitiated === true) && startingDragon != 0 && items.length > 0 && matchLength > 0 && match != null && match != undefined) {
            console.log("items updated.")
            console.log(items)
            
            setCurrentActiveDragon(startingDragon)
            console.log("Dragon to start is " + currentActiveDragon)
            dragonFlip = document.querySelector('.dragon-flip');
            dragonNoflip = document.querySelector('.dragon-noflip');
            updateDragonGlow()
            
            createIntervalLoop()

            setMatchInitiated(true)
        }
    }, [items, match, matchLength]);

    if (loading) return (
        <div className="flex justify-center">
            <h2>Fight!</h2>
        </div>
    )

    return (
        <div className="flex justify-center">
            {items.length > 0 ?
                <div className="px-5 container">
                    <Row>
                        <Col xs="3">
                            <p className="py-3">
                                {items[0].Attack} <img src={attackIcon} width="40"></img>
                                {items[0].Defense} <img src={defenseIcon} width="40"></img>
                                {items[0].Luck} <img src={luckIcon} width="40"></img>
                            </p>
                        </Col>
                        <Col><h2>Fight!</h2></Col>
                        <Col xs="3">
                            <p className="py-3">
                                {items[1].Attack} <img src={attackIcon} width="40"></img>
                                {items[1].Defense} <img src={defenseIcon} width="40"></img>
                                {items[1].Luck} <img src={luckIcon} width="40"></img>
                            </p>
                        </Col>
                    </Row>
                    {/* <p>Winner of match {location.state.matchId} is: {match.winner}</p> */}
                    {/* <p>Battle log: {match.battle_log}</p> */}
                    <Row>
                        <Col xs="3">
                            <img src={items[0].ImageUrl} width="300" className="dragon-flip dragon-glow"></img>
                            <Row>
                                <ProgressBar style={{marginTop: "40px", height:"40px", width:"100%", backgroundColor: "black", fontSize: "18px"}}
                                variant="danger" now={100 * items[0].Health / items[0].HealthMax} label={items[0].Health + '/' + items[0].HealthMax} />
                            </Row>
                            <div className='d-grid'>
                                <br/>
                                {match.winner === 1 ?
                                <h2 className="text-success linko result-hide">Victory</h2>
                                :
                                <h2 className="text-danger linko result-hide">Defeat</h2>
                                }
                            </div>
                            <div style={{textAlign: "center"}}>
                                <span style={{fontSize: "18px", fontWeight: "bold"}}>{match.player1}</span><br/>
                                <span style={{fontSize: "12px"}} className="text-dark">{match.wallet1}</span>
                            </div>
                        </Col>
                        
                        <Col xs="1"></Col>
                        <Col>
                            <p style={{textAlign:"left"}} className="linko linko-hide"> The Battle Begins! </p>
                            <p style={{textAlign:"left"}} className="linko linko-hide"> {goFirstText(JSON.parse(match.battle_log)[0].dragon)} </p>
                            {JSON.parse(match.battle_log).map((val) => {
                                return (
                                    <p style={{textAlign:"left"}} className="linko linko-hide">
                                        {
                                            attackText(val.dragon)} for {val.attackValue} damage. {val.isCriticalStrike ? <b> Critical Strike! </b> : <span></span>
                                        }
                                    </p>
                                );
                            })}
                            <p style={{textAlign:"left"}} className="linko linko-hide"> {defeatedText()} </p>
                            <p style={{textAlign:"left"}} className="linko linko-hide"> {victoryOrDefeatText()} </p>
                        </Col>

                        <Col xs="3">
                            <img src={items[1].ImageUrl} width="300" className="dragon-noflip"></img>
                            <Row>
                                <ProgressBar style={{marginTop: "40px", height:"40px", width:"100%", backgroundColor: "black", fontSize: "18px"}}
                                variant="danger" now={100 * items[1].Health / items[1].HealthMax} label={items[1].Health + '/' + items[1].HealthMax} />
                            </Row>
                            <div className='d-grid'>
                                <br/>
                                {match.winner === 2 ?
                                <h2 className="text-success linko result-hide">Victory</h2>
                                :
                                <h2 className="text-danger linko result-hide">Defeat</h2>
                                }
                            </div>
                            <div style={{textAlign: "center"}}>
                                <span style={{fontSize: "18px", fontWeight: "bold"}}>{match.player2}</span><br/>
                                <span style={{fontSize: "12px"}} className="text-dark">{match.wallet2}</span>
                            </div>
                        </Col>
                    </Row>
                    {/* <Row>
                        <h2>Battle Summary</h2>
                        <table style={{textAlign:"center"}} className="table table-bordered table-striped table-dark">
                            <thead>
                                <tr>
                                    <th scope="col">Dragon</th>
                                    <th scope="col">Attack</th>
                                </tr>
                            </thead>
                            <tbody>
                                {JSON.parse(match.battle_log).map((val) => {
                                    return (
                                        <tr>
                                            <th scope="row">{val.dragon}</th>
                                            <td>
                                                {val.isCriticalStrike ? 
                                                    <b> 
                                                        {val.attackValue}!
                                                    </b>
                                                :
                                                    <span> 
                                                        {val.attackValue}
                                                    </span>
                                                }
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Row> */}
                </div>
            : (
                <main style={{ padding: "1rem 0" }}>
                    <h2>Loading...</h2>
                </main>
            )}
        </div>
    );
}
export default Match