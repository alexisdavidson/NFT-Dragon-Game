import { useState, useEffect } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import Axios from 'axios'

const Home = ({ account }) => {
    let navigate = useNavigate(); 
    const routeChangeMatch = (matchId) =>{ 
        let path = 'match'; 
        console.log("Navigate to match " + matchId)
        navigate(path, {
            state: {
                matchId: matchId
            }
        });
    }
    const routeChangeMatchmaking = () =>{ 
        let path = 'matchmaking'; 
        navigate(path);
    }

    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])

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
                        routeChangeMatchmaking()
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
    }, [])

    if (loading) return (
        <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
        </main>
    )

    return (
        <div className="flex justify-center">
            {items.length > 0 ?
                <div className="px-5 container">
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
                </div>
            : (
                <main style={{ padding: "1rem 0" }}>
                    <h2>No listed assets for {account}</h2>
                </main>
            )}
        </div>
    );
}
export default Home