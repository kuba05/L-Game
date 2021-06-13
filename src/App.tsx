import react from 'react';
import './App.css';
import { Map } from './Map';
import mapConfig from './mapConfig';

class App extends react.Component {
    render (): React.ReactElement {
        const players = ['Player1', 'Player2'];

        return <Map
            pieces={mapConfig.pieces}
            moveOrder={mapConfig.moveOrder}
            mandatoryMoves={mapConfig.mandatoryMoves}
            players={players}
            playersForMoves={mapConfig.playersForMoves}/>;
    }
}

export default App;
