import { useState, useEffect } from 'react'
import Axios from 'axios'

const MatchHistory = () => {
    const [matchmakingPool, setMatchmakingPool] = useState([])

    const displayMatchmakingPool = async () => {
        Axios.get('http://localhost:3001/api/get_matchmaking_pool').then((response) => {
            setMatchmakingPool(response.data)
        })
    }

    useEffect(() => {
        displayMatchmakingPool()
    }, [])

    return (
        <div className="flex justify-center">
            <h2>Match History</h2>
            <table class="table table-bordered table-striped">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Wallet</th>
                        <th scope="col">Dragon</th>
                    </tr>
                </thead>
                <tbody>
                    {matchmakingPool.map((val) => {
                        return (
                            <tr>
                                <th scope="row">{val.id}</th>
                                <td>{val.wallet_address}</td>
                                <td>{val.dragon_id}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
export default MatchHistory