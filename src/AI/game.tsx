import { Map } from '../map';
import { AI } from '../types';
import { AIPlayer } from './aiplayer'; 
import mapConfig from "../mapConfig";

export class Game {
    component: any;
    callback: (winner: number) => void;
    
    constructor (AIOne: AI, AITwo: AI, callback: (winner: number) => void, show?: (component: any) => void) {
        this.component = <Map
            //this is all standart setup 
            pieces={mapConfig.pieces} moveOrder={mapConfig.moveOrder} mandatoryMoves={mapConfig.mandatoryMoves}  playersForMoves={mapConfig.playersForMoves}
            //we have to create new AIPlayers for each of our AIs
            players={[new AIPlayer(AIOne), new AIPlayer(AITwo)]}/>;
        this.callback = callback;
    }
    
    gameEnded (winner: number) {
        this.callback(winner);
    } 
}