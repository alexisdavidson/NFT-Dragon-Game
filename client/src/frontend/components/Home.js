import { useState, useEffect } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import Axios from 'axios'

const Home = ({ account }) => {
    const [loading, setLoading] = useState(true)
    const [items, setItems] = useState([])
    const [matchmakingPool, setMatchmakingPool] = useState([])

    const submitPick = (dragonId) => {
        console.log("Pick dragon " + dragonId);
        Axios.post('http://localhost:3001/api/join_matchmaking_pool', {
            walletAddress: account,
            dragonId: dragonId
        })
        
        alert("Matchmaking pool joined.")
        console.log("Matchmaking pool joined.")
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

    const displayMatchmakingPool = async () => {
        Axios.get('http://localhost:3001/api/get_matchmaking_pool').then((response) => {
            setMatchmakingPool(response.data)
        })
    }

    useEffect(() => {
        loadOpenSeaItems()
        displayMatchmakingPool()
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
                                <Card>
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
                                        <Button variant="primary" size="lg" onClick={() => submitPick(item.token_id)}>
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