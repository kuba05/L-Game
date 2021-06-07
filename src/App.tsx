import react from 'react';
import './App.css';
import { Piece } from './piece';
import { Map } from './map';

class App extends react.Component{
    render() {
    
        let players = ["Player1", "Player2"];
        
        let p = [
            new Piece('blue', [2,2], [1,1,1], [[0,0],[0,1],[0,2],[1,0]]),
            new Piece('green', [5,5], [-1,-1,1], [[0,0],[0,1],[0,2],[1,0]]),
            new Piece('black', [4,3], [1,1,1], [[0,0]]),
            new Piece('black', [3,4], [1,1,1], [[0,0]])
        ];
        
        let moveOrder = [
            [p[0]],
            [p[2],p[3]],
            [p[1]],
            [p[2],p[3]]
        ];
        
        let playersForMoves = [0,0,1,1];
        
        let mandatoryMoves = [0,2];
        
        return <><Map pieces={p} moveOrder={moveOrder} mandatoryMoves={mandatoryMoves} players={players} playersForMoves={playersForMoves}/></>;
    }
}

export default App;
