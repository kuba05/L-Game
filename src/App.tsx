import react from 'react';
import './App.css';
import { Piece } from './Piece';
import { Map } from './Map';

class App extends react.Component {
  render (): React.ReactNode {
    const players = ['Player 1', 'Player 2'];

    const p = [
      new Piece('blue', [2, 2], [1, 1, 1], [[0, 0], [0, 1], [0, 2], [1, 0]]),
      new Piece('green', [5, 5], [-1, -1, 1], [[0, 0], [0, 1], [0, 2], [1, 0]]),
      new Piece('black', [4, 3], [1, 1, 1], [[0, 0]]),
      new Piece('black', [3, 4], [1, 1, 1], [[0, 0]])
    ];

    const [blue, green, black1, black2] = p;

    const moveOrder = [
      [blue],
      [black1, black2],
      [green],
      [black1, black2]
    ];

    const playersForMoves = [0, 0, 1, 1];

    const mandatoryMoves = [0, 2];

    return (
      <Map
        pieces={p}
        moveOrder={moveOrder}
        mandatoryMoves={mandatoryMoves}
        players={players}
        playersForMoves={playersForMoves}
      />
    );
  }
}

export default App;
