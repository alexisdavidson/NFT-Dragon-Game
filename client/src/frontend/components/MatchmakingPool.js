import { useState, useEffect } from 'react'
import Axios from 'axios'
import configData from "./configData.json";

const MatchmakingPool = () => {
    const [matchmakingPool, setMatchmakingPool] = useState([])

    const displayMatchmakingPool = async () => {
        Axios.get(configData.SERVER_URL + 'api/get_matchmaking_pool').then((response) => {
            setMatchmakingPool(response.data)
        })
    }

    useEffect(() => {
        displayMatchmakingPool()
    }, [])

    return (
        <div className="flex justify-center">
            <h2>Matchmaking Pool</h2>
            <table class="table table-bordered table-striped table-dark">
                <thead>
                    <tr>
                        <th scope="col">#</th>
                        <th scope="col">Wallet</th>
                        <th scope="col">Dragon</th>
                        <th scope="col">Date</th>
                    </tr>
                </thead>
                <tbody>
                    {matchmakingPool.map((val) => {
                        return (
                            <tr>
                                <th scope="row">{val.id}</th>
                                <td>{val.wallet_address}</td>
                                <td>{val.dragon_id}</td>
                                <td>{val.date_joined}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
export default MatchmakingPool