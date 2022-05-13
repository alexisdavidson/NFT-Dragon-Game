import { useState, useEffect } from 'react'
import { Row, Col, Card, Button } from 'react-bootstrap'
import {useLocation} from 'react-router-dom';
import Axios from 'axios'
import dice from '../images/Dice.PNG'

const Matchmaking = () => {
    const location = useLocation();
    const [item, setItem] = useState([])

    const loadOpenSeaItem = async (dragon) => {
        let item = await fetch(`https://api.opensea.io/api/v1/asset/0x91a96a8ed695b7c59c01f845f7bb522fe906d88d/${dragon}`)
        .then((res) => res.json())
        .then((res) => { return res })
        .catch((e) => {
          console.error(e)
          console.error('Could not talk to OpenSea')
          return null
        })

        setItem(item)
    }

    useEffect(() => {
        loadOpenSeaItem(location.state.dragon)
    }, [])

    return (
        <div className="flex justify-center">
            <h2>Waiting for Opponent...</h2>
            <div className="flex justify-center">
                <div className="px-5">
                    <Row xs={1} md={2} lg={4} className="g-4 py-5 d-flex justify-content-center">
                        <Col className="overflow-hidden">
                            <Card bg="dark">
                                <Card.Img variant="top" src={item.image_url} />
                                <Card.Body color="secondary">
                                <Card.Title>{item.name}</Card.Title>
                                <Card.Text>
                                    <img src={dice} width="40" height="40" className="" alt="" />
                                </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>
        </div>
    );
}
export default Matchmaking