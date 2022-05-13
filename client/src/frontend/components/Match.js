import { useState, useEffect } from 'react'
import {useLocation} from 'react-router-dom';
import Axios from 'axios'

const Match = ({ matchId }) => {
    const [match, setMatch] = useState([])
    const location = useLocation();

    const displayMatch = async () => {
        console.log("Display match " + location.state.matchId)

        Axios.get('http://localhost:3001/api/get_match', {
            params: {
                matchId: location.state.matchId
            }
        }).then((response) => {
            setMatch(response.data[0])
            console.log("Match winner is " + match.winner)
        })
    }

    useEffect(() => {
        displayMatch()
    }, [])

    return (
        <div className="flex justify-center">
            <h2>Match</h2>
            <p>Winner of match {location.state.matchId} is: {match.winner}</p>
        </div>
    );
}
export default Match