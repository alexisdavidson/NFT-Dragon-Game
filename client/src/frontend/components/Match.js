import { useState, useEffect } from 'react'
import { Row, Col, Card } from 'react-bootstrap'
import {useLocation} from 'react-router-dom';
import Axios from 'axios'
import attackIcon from '../images/attack.png'
import defenseIcon from '../images/defense.png'
import luckIcon from '../images/luck.png'

const Match = (account) => {
    const [match, setMatch] = useState([])
    const [loading, setLoading] = useState(true)
    const location = useLocation();
    const [items, setItems] = useState([])
    let [loop, setLoop] = useState([])

    const playedDragonId = 1

    const loadOpenSeaItems = async (match) => {
        let dragon1 = await fetch(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${match.dragon1}`)
        .then((res) => res.json())
        .then((res) => { return res })
        .catch((e) => {
          console.error(e)
          console.error('Could not talk to OpenSea')
          return null
        })

        let dragon2 = await fetch(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${match.dragon2}`)
        .then((res) => res.json())
        .then((res) => { return res })
        .catch((e) => {
          console.error(e)
          console.error('Could not talk to OpenSea')
          return null
        })

        if (dragon2.owner.account === account) playedDragonId = 2

        let items = []
        items.push(dragon1)
        items.push(dragon2)

        setLoading(false)
        setItems(items)
    }

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

        Axios.get('http://localhost:3001/api/get_match', {
            params: {
                matchId: location.state.matchId
            }
        }).then((response) => {
            setMatch(response.data[0])

            console.log("Match winner is " + response.data[0].winner)
            loadOpenSeaItems(response.data[0])

            // var elementResult = document.querySelector('.dragon-hide');
            // elementResult.classList.remove('dragon-hide');
            // elementResult.classList.add('linko-show');
            // elementResult = document.querySelector('.dragon-hide');
            // elementResult.classList.remove('dragon-hide');
            // elementResult.classList.add('linko-show');
        })
    }

    const createIntervalLoop = () => {
        function displayText() {
            var element = document.querySelector('.linko-hide');
          
          if (null === element) {
                clearInterval(loop);
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
            }
          }
          
          setLoop(setInterval(function () {
              displayText();
          }, 3000));
    }


    useEffect(() => {
        if (loop != null) clearInterval(loop);
        displayMatch()
        createIntervalLoop()
    }, [])

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
                                {items[0].traits.filter(e => e.trait_type === "Attack")[0].value} <img src={attackIcon} width="40"></img>
                                {items[0].traits.filter(e => e.trait_type === "Defense")[0].value} <img src={defenseIcon} width="40"></img>
                                {items[0].traits.filter(e => e.trait_type === "Luck")[0].value} <img src={luckIcon} width="40"></img>
                            </p>
                        </Col>
                        <Col><h2>Fight!</h2></Col>
                        <Col xs="3">
                            <p className="py-3">
                                {items[1].traits.filter(e => e.trait_type === "Attack")[0].value} <img src={attackIcon} width="40"></img>
                                {items[1].traits.filter(e => e.trait_type === "Defense")[0].value} <img src={defenseIcon} width="40"></img>
                                {items[1].traits.filter(e => e.trait_type === "Luck")[0].value} <img src={luckIcon} width="40"></img>
                            </p>
                        </Col>
                    </Row>
                    {/* <p>Winner of match {location.state.matchId} is: {match.winner}</p> */}
                    {/* <p>Battle log: {match.battle_log}</p> */}
                    <Row>
                        <Col xs="3">
                            <img src={items[0].image_url} width="300" className="dragon-hide"></img>
                            <div className='d-grid'>
                                {match.winner === 1 ?
                                <h2 className="text-success linko result-hide">Win</h2>
                                :
                                <h2 className="text-danger linko result-hide">Lose</h2>
                                }
                            </div>
                            <div>
                                <span className="text-dark">{match.wallet1}</span>
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
                            <img src={items[1].image_url} width="300" className="dragon-hide"></img>
                            <div className='d-grid'>
                                {match.winner === 2 ?
                                <h2 className="text-success linko result-hide">Win</h2>
                                :
                                <h2 className="text-danger linko result-hide">Lose</h2>
                                }
                            </div>
                            <div>
                                <span className="text-dark">{match.wallet2}</span>
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