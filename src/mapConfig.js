import { Piece } from './Piece';

const pieces = [
    new Piece('blue', [2, 2], [1, 1, 1], [[0, 0], [0, 1], [0, 2], [1, 0]]),
    new Piece('green', [5, 5], [-1, -1, 1], [[0, 0], [0, 1], [0, 2], [1, 0]]),
    new Piece('black', [4, 3], [1, 1, 1], [[0, 0]]),
    new Piece('black', [3, 4], [1, 1, 1], [[0, 0]])
];

export default {
    pieces: pieces,
    moveOrder: [
        [pieces[0]],
        [pieces[2], pieces[3]],
        [pieces[1]],
        [pieces[2], pieces[3]]
    ],
    playersForMoves: [0, 0, 1, 1],
    mandatoryMoves: [0, 2]
};
