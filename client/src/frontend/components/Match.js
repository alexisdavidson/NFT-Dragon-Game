import { useState, useEffect } from 'react'
import Axios from 'axios'

const Match = () => {
    const [match, setMatch] = useState([])

    const displayMatch = async () => {
        Axios.get('http://localhost:3001/api/get_match').then((response) => {
            setMatch(response.data)
        })
    }

    useEffect(() => {
        displayMatch()
    }, [])

    return (
        <div className="flex justify-center">
            <h2>Match</h2>
        </div>
    );
}
export default Match