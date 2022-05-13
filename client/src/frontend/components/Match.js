import { useState, useEffect } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import {useLocation} from 'react-router-dom';
import Axios from 'axios'

const Match = () => {
    const [match, setMatch] = useState([])
    const [loading, setLoading] = useState(true)
    const location = useLocation();
    const [items, setItems] = useState([])

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

        let items = []
        items.push(dragon1)
        items.push(dragon2)

        setLoading(false)
        setItems(items)
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
        })
    }

    useEffect(() => {
        displayMatch()
    }, [])

    if (loading) return (
        <div className="flex justify-center">
            <h2>Fight!</h2>
        </div>
    )

    return (
        <div className="flex justify-center">
            <h2>Fight!</h2>
            {/* <p>Winner of match {location.state.matchId} is: {match.winner}</p> */}
                
            <div className="flex justify-center">
                {items.length > 0 ?
                    <div className="px-5">
                        <Row xs={1} md={2} lg={4} className="g-4 py-5 d-flex justify-content-center">
                            {items.map((item, idx) => (
                                <Col key={idx} className="overflow-hidden">
                                    <Card bg="dark">
                                        <Card.Img variant="top" src={item.image_url} />
                                        <Card.Body color="secondary">
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Text>
                                            {item.owner.address}
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
                                            {idx + 1 == match.winner ?
                                            <h2 className="text-success">Win</h2>
                                            :
                                            <h2 className="text-danger">Lose</h2>
                                            }
                                        </div>
                                        </Card.Footer>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    </div>
                : (
                    <main style={{ padding: "1rem 0" }}>
                        <h2>Loading...</h2>
                    </main>
                )}
            </div>
        </div>
    );
}
export default Match