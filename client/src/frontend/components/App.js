import {
  BrowserRouter,
  Routes,
  Route
} from "react-router-dom"
import './App.css';
import Navigation from './Navbar';
import Home from './Home';
import MatchmakingPool from './MatchmakingPool';
import Matchmaking from './Matchmaking';
import Match from './Match';

import { useState } from 'react'
import { Spinner } from 'react-bootstrap'
import MatchHistory from "./MatchHistory";
 
function App() {
  const [loading, setLoading] = useState(true)
  const [account, setAccount] = useState(null)

  // MetaMask Login/Connect
  const web3Handler = async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0])
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
              <Home account={account} />
            } />
            <Route path="/matchmaking-pool" element={
              <MatchmakingPool account={account} />
            } />
            <Route path="/match-history" element={
              <MatchHistory account={account} />
            } />
            <Route path="/matchmaking" element={
              <Matchmaking account={account} />
            } />
            <Route path="/match" element={
              <Match account={account} />
            } />
          </Routes>
        ) }
      </div>
    </BrowserRouter>
  );
}

export default App;
