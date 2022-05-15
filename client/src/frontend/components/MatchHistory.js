import { useState, useEffect } from 'react'
import { Button } from 'react-bootstrap'
import { useNavigate } from "react-router-dom";
import Axios from 'axios'

const MatchHistory = () => {
    let navigate = useNavigate(); 
    const routeChangeMatch = (matchId) =>{ 
        let path = '/match'; 
        console.log("Navigate to match " + matchId)
        navigate(path, {
            state: {
                matchId: matchId
            }
        });
    }

    const [matchHistory, setMatchHistory] = useState([])

    const displayMatchHistory = async () => {
        Axios.get('http://localhost:3001/api/get_match_history').then((response) => {
            setMatchHistory(response.data)
        })
    }
    const submitWatchBattle = (matchId) => {
        console.log("Watch battle of match id " + matchId)
        routeChangeMatch(matchId)
    }

    useEffect(() => {
        displayMatchHistory()
    }, [])

    return (
        <div className="flex justify-center">
            <h2>Match History</h2>
            <table className="table table-bordered table-striped table-dark">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Replay</th>
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
                                <td>
                                    <Button className="py-0" variant="secondary" size="sm" onClick={() => submitWatchBattle(val.id)}>
                                        Replay
                                    </Button>
                                </td>
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