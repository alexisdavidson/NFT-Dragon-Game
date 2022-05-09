import { useState, useEffect } from 'react'
import Axios from 'axios'

const MatchHistory = () => {
    const [matchHistory, setMatchHistory] = useState([])

    const displayMatchHistory = async () => {
        Axios.get('http://localhost:3001/api/get_match_history').then((response) => {
            setMatchHistory(response.data)
        })
    }

    useEffect(() => {
        displayMatchHistory()
    }, [])

    return (
        <div className="flex justify-center">
            <h2>Match History</h2>
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Player 1</th>
                        <th scope="col">Player 2</th>
                        <th scope="col">Dragon 1</th>
                        <th scope="col">Dragon 2</th>
                        <th scope="col">Winner</th>
                        <th scope="col">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {matchHistory.map((val) => {
                        return (
                            <tr>
                                <th scope="row">{val.id}</th>
                                <td>{val.wallet1}</td>
                                <td>{val.wallet2}</td>
                                <td>{val.dragon1}</td>
                                <td>{val.dragon2}</td>
                                <td>{val.winner}</td>
                                <td>{val.date_played}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
export default MatchHistory