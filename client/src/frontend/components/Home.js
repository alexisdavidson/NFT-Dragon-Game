import { useState, useEffect } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import Axios from 'axios'
import moment from 'moment'

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
        Axios.get('http://localhost:3001/api/get_match_history', {
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

    const submitPick = (dragonId) => {
        console.log("Pick dragon " + dragonId);
        
        Axios.get('http://localhost:3001/api/get_opponent', {
            params: {
                walletAddress: account,
                dragonId: dragonId
            },
          }).then((response) => {
            if (response.data.length == 0) {
                // No suitable opponent in matchmaking pool -> join the pool 
                console.log("No opponent found. Joining matchmaking pool")
                Axios.post('http://localhost:3001/api/join_matchmaking_pool', {
                    walletAddress: account,
                    dragonId: dragonId
                }).then((response) => {
                    if (response.data[0] == true) {
                        console.log("Already in matchmaking pool.")
                        alert("This dragon is already in the matchmaking pool.")
                    }
                    else {
                        console.log("Matchmaking pool joined.")
                        routeChangeMatchmaking(dragonId)
                    }
                    console.log(response)
                })
            }
            else {
                // Suitable opponent found -> play match
                console.log(response.data)
                
                console.log("Opponent found. Starting match against " + response.data[0].dragon_id + ", " + response.data[0].wallet_address)
                
                Axios.post('http://localhost:3001/api/play_match', {
                    walletAddress1: account,
                    dragonId1: dragonId,
                    walletAddress2: response.data[0].wallet_address,
                    dragonId2: response.data[0].dragon_id,
                }).then((response) => {
                    console.log("Play match result: ")
                    let matchId = response.data[0]
                    console.log(matchId)
                    
                    routeChangeMatch(matchId)
                })

            }
        })
        
    }

    const loadOpenSeaItems = async () => {
        let items = await fetch(`https://api.opensea.io/api/v1/assets?owner=${account}&asset_contract_address=0x91a96a8ed695b7c59c01f845f7bb522fe906d88d&format=json`)
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
                {items.length > 0 ?
                    <Row xs={1} md={2} lg={4} className="g-4 py-5">
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