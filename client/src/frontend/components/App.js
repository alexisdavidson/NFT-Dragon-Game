import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navigation from './Navbar';
import Home from './Home';
import MatchmakingPool from './MatchmakingPool';

import { useState } from 'react'
import { ethers } from 'ethers'
import { Spinner } from 'react-bootstrap'
import MatchHistory from "./MatchHistory";
 
function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])

    const provider = new ethers.providers.Web3Provider(window.ethereum)

    const signer = provider.getSigner()

    loadContracts(signer)
  }

  const loadContracts = async (signer) => {
    setLoading(false)
  }
  return (
    <BrowserRouter>
      <div className="App">
        <Navigation web3Handler={web3Handler} account={account} />
        { loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh'}}>
            <Spinner animation="border" style={{ display: 'flex' }} />
            <p className='mx-3 my-0'>Awaiting MetaMask Connection...</p>
          </div>
        ) : (
          <Routes>
            <Route path="/" element={
              <Home account={account}/>
            } />
            <Route path="/matchmaking-pool" element={
              <MatchmakingPool />
            } />
            <Route path="/match-history" element={
              <MatchHistory />
            } />
          </Routes>
        ) }
      </div>
    </BrowserRouter>
  );
}

export default App;
