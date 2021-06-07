import react from 'react';
import './App.css';
import { Piece } from './piece';
import { Map } from './map';
import mapConfig from "./mapConfig";

class App extends react.Component{
    render() {let players = ["Player1", "Player2"];
        
        return <><Map pieces={mapConfig.pieces} moveOrder={mapConfig.moveOrder} mandatoryMoves={mapConfig.mandatoryMoves} players={players} playersForMoves={mapConfig.playersForMoves}/></>;
    }
}

export default App;
