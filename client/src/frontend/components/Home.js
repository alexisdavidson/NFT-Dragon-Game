import { useState, useEffect } from 'react'
import { Row, Col, Card, Button, Form } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import Axios from 'axios'
import moment from 'moment'
import configData from "./configData.json";
import configContract from "./configContract.json";

const Home = ({ account }) => {
    let navigate = useNavigate(); 
    const routeChangeMatch = (matchId) =>{ 
        let path = '/match'; 
        console.log("Navigate to match " + matchId)
        navigate(path, {
            state: {
                matchId: matchId,
                account: account
            }
        });
    }
    const routeChangeMatchmaking = (dragon) =>{ 
        let path = 'matchmaking'; 
        navigate(path, {
            state: {
                dragon: dragon
            }
        });
    }

    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    const [matchHistory, setMatchHistory] = useState([])

    const displayMatchHistory = async () => {
        Axios.get(configData.SERVER_URL + 'api/get_match_history', {
            params: {
                walletAddress: account
            },
          }).then((response) => {
            setMatchHistory(response.data)
        })
    }

    const submitWatchBattle = (matchId) => {
        console.log("Watch battle of match id " + matchId)
        routeChangeMatch(matchId)
    }

    const getPlayerNameFromStorage = () => {
        // localStorage.removeItem('playerName')
        if (localStorage.getItem('playerName') === null) 
            return ""
        return localStorage.getItem('playerName')
    }

    const submitPick = (dragonId) => {
        console.log("Pick dragon " + dragonId);

        let playerNameElement = document.querySelector('.playerNameControl')
        let playerName = playerNameElement.value.replace(/[^\w\s]/gi, '') // Remove special characters
        console.log("Save username " + playerName);
        localStorage.setItem('playerName', playerName);
        
        Axios.post(configData.SERVER_URL + 'api/pick_nft', {
            walletAddress1: account,
            dragonId1: dragonId,
            player1: playerName
        }).then((response) => {
            const serverResultType = response.data.serverResultType
            const serverResultValue = response.data.serverResultValue
            console.log("Server result type: " + serverResultType)
            console.log("Server result value: " + serverResultValue ?? "null")

            if (serverResultType == "COOLDOWN") {
                alert("This dragon is on cooldown")
            }
            else if (serverResultType == "ALREADY_POOL") {
                alert("This dragon is already in the matchmaking pool.")
            }
            else if (serverResultType == "JOINED_POOL") {
                routeChangeMatchmaking(dragonId)
            }
            else if (serverResultType == "PLAY_MATCH") {
                routeChangeMatch(serverResultValue)
            }
        })
    }

    const loadOpenSeaItems = async () => {
        let items = await fetch(`${configContract.OPENSEA_API}/assets?owner=${account}&asset_contract_address=${configContract.CONTRACT_ADDRESS}&format=json`)
        .then((res) => res.json())
        .then((res) => {
          return res.assets
        })
        .catch((e) => {
          console.error(e)
          console.error('Could not talk to OpenSea')
          return null
        })

        setLoading(false)
        setItems(items)
    }

    useEffect(() => {
        loadOpenSeaItems()
        displayMatchHistory()
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
        </main>
    )

    return (
        <div className="flex justify-center">
            <div className="px-5 container">
                <Row>
                    <Col lg={4} className="g-4">
                        <Form className="pt-2 d-flex">
                            <Form.Group className="mb-3 pr-1" controlId="formPlayerName">
                                <Form.Control className="playerNameControl" type="text" placeholder="Enter player name" defaultValue={getPlayerNameFromStorage()} style={{width: "90%"}}/>
                            </Form.Group>
                            {/* <Button variant="success" type="submit" style={{height: "50%"}}>Save</Button> */}
                        </Form>
                    </Col>
                </Row>

                {items.length > 0 ?
                    <Row xs={1} md={2} lg={4} className="g-4 pb-5 pt-3">
                        {items.map((item, idx) => (
                            <Col key={idx} className="overflow-hidden">
                                <Card bg="dark">
                                    <Card.Img variant="top" src={item.image_url} />
                                    <Card.Body color="secondary">
                                    <Card.Title>{item.name}</Card.Title>
                                    <Card.Text>
                                        {item.description}
                                        <br/>
                                        <br/>
                                        Attack: {item.traits.filter(e => e.trait_type == "Attack")[0].value}
                                        <br/>
                                        Defense: {item.traits.filter(e => e.trait_type == "Defense")[0].value}
                                        <br/>
                                        Luck: {item.traits.filter(e => e.trait_type == "Luck")[0].value}
                                    </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                    <div className='d-grid'>
                                        <Button variant="success" size="lg" onClick={() => submitPick(item.token_id)}>
                                            Pick
                                        </Button>
                                    </div>
                                    </Card.Footer>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2>No listed assets for {account}</h2>
                    </main>
                )}
                
                {matchHistory.length > 0 ?
                    <Row>
                        <h2>Match History</h2>
                        <table className="table table-bordered table-striped table-dark">
                            <thead>
                                <tr>
                                    <th scope="col">Replay</th>
                                    <th scope="col">Result</th>
                                    <th scope="col">Date</th>
                                    <th scope="col">Opponent</th>
                                    <th scope="col">Your Dragon</th>
                                    <th scope="col">Opponent's Dragon</th>
                                </tr>
                            </thead>
                            <tbody>
                                {matchHistory.map((val) => {
                                    return (
                                        <tr>
                                            <td>
                                                <Button className="py-0" variant="secondary" size="sm" onClick={() => submitWatchBattle(val.id)}>
                                                    Replay
                                                </Button>
                                            </td>
                                            <th scope="row">{val.wallet1 == account ? (val.winner == 1 ? <b className="text-success">Victory!</b> : <span className="text-danger">Defeat</span>) 
                                                : (val.winner == 2 ? <b className="text-success">Victory!</b> : <span className="text-danger">Defeat</span>)}</th>
                                            <td>{moment(val.date_played).format('MM/DD/YYYY hh:mm')}</td>
                                            <td>{val.wallet1 == account ? val.wallet2 : val.wallet1}</td>
                                            <td>{val.wallet1 == account ? val.dragon1 : val.dragon2}</td>
                                            <td>{val.wallet1 == account ? val.dragon2 : val.dragon1}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </Row>
                : 
                    <div></div>
                }
            </div>
        </div>
    );
}
export default Home