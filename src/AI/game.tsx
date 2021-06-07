import react from 'react';

import { Map } from '../map';
import { AI } from '../types';
import { AIPlayer } from './aiplayer'; 
import mapConfig from "../mapConfig";

interface GameProps {
    AIone: AI;
    AItwo: AI;
    callback: (winner: number) => void;
}

export class Game extends react.Component<GameProps>{
    render() {
        //return <div>a</div>;
        return <Map
            //this is all standart setup 
            pieces={mapConfig.pieces} moveOrder={mapConfig.moveOrder} mandatoryMoves={mapConfig.mandatoryMoves}  playersForMoves={mapConfig.playersForMoves}
            //set callback
            callback={this.gameEnded}
            //we have to create new AIPlayers for each of our AIs
            players={[new AIPlayer(this.props.AIone), new AIPlayer(this.props.AItwo)]}/>;
    }
    
    gameEnded = (winner: number) => {
        console.log("gameEnded");
        console.log(winner);
        this.props.callback(winner);
    } 
}