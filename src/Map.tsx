import react from 'react';

import { Piece } from './Piece';
import { Player } from './types';
import { jsonCompare } from './utils';

const limits: number[] = [2, 5];
const size = 8;

interface MapProps {
    pieces: Piece[]
    moveOrder: Piece[][]
    mandatoryMoves: number[]
    players: {[index: number]: string|Player}
    playersForMoves: number[]
    loopback?: (result: number) => void
}

interface MapState {
    active: Piece | null
    error: boolean
    errorMessage: String|null

    // which move it is right now
    move: number

    // position of active piece beofre we started to move it
    initialPieceState: number | null

    // is game finished
    finished: boolean
}

export class Map extends react.Component<MapProps, MapState> {
    /*
    * technical stuff
    */
    constructor (props: MapProps) {
        super(props);
        this.state = {
            active: null,
            error: false,
            errorMessage: null,
            move: 0,
            initialPieceState: null,
            finished: false
        };
    }

    componentDidMount (): void {
    // overload rightclick
        window.oncontextmenu = () => {
            if (this.state.active !== null) this.rotateActive(true);
            return false;
        };

        // overload middlebutton
        window.onmouseup = (e: MouseEvent) => {
            // console.log(e);
            if (e.which === 2 && this.state.active !== null) {
                this.mirrorActive();
                // this doesn't really work here, idk how to fix it tho
                return false;
            }
        };
    }

    shouldComponentUpdate (nextProps: MapProps, nextState: MapState): boolean {
        return !(
            jsonCompare(this.state, nextState) &&
            jsonCompare(this.props, nextProps)
        );
    }

    componentDidUpdate (prevProps: MapProps, prevState: MapState): void {
    // remove the error message when it's no longer needed
        if (
            this.state.errorMessage !== null &&
            prevState.errorMessage !== null &&
            this.state.errorMessage === prevState.errorMessage
        ) this.setState({ errorMessage: null });

        // if a move has been made, check if any legal move exists
        if (this.state.move !== prevState.move) {
            const isEnd = !this.doesAnyMoveExist();
            this.setState({ finished: isEnd });
            // and if the loopback is set to a function, we will return who won (winner's index in PlayersForMove)
            if (isEnd && this.props.loopback !== undefined) this.props.loopback(this.props.playersForMoves[this.state.move - 1]);
        }
    }

    /*
    * AI turn
    */
    AITurn = (): boolean => {
        if (typeof this.props.players[this.props.playersForMoves[this.state.move]] === 'string') return false;

        const move = (this.props.players[this.props.playersForMoves[this.state.move]] as Player)
            .makeMove(this.props.pieces.map(piece => this.getPieceState(piece)));
        if (!this.checkIfMoveIsLegal(this.props.moveOrder[this.state.move][0], move[0])) return false;

        this.setPieceState(this.props.moveOrder[this.state.move][0], move[0]);
        this.forceUpdate();
        this.setState({ move: (this.state.move + 1) % this.props.moveOrder.length });

        if (!this.checkIfMoveIsLegal(this.props.moveOrder[this.state.move][move[2]], move[1])) return false;

        this.setPieceState(this.props.moveOrder[this.state.move][move[2]], move[1]);
        this.forceUpdate();
        this.setState({ move: (this.state.move + 1) % this.props.moveOrder.length }); ;
        return true;
    };

    checkIfMoveIsLegal = (piece: Piece, state: number): boolean => {
        const testPiece = this.setPieceState(this.makePieceFromData(this.getPieceData(piece)), state);
        for (const part of testPiece.show()) {
            // is inside the field?
            // console.log(part);
            if (!this.isInside(part[0], part[1])) return false;
            // is there any other piece on the same position?
            for (const otherPiece of this.props.pieces) {
                if (otherPiece === piece) {
                    // console.log("the same piece");
                    continue;
                }
                // console.log("the pieces arent the same");
                if (otherPiece.show().findIndex(a => jsonCompare(part, a)) !== -1) return false;
                // console.log("this part can be placed");
            }
        }
        return true;
    };

    /*
    * stuff with pieces (might be static)
    */
    // generate number that characerizes given piece
    getPieceData = (piece: Piece): string => {
        const { color, plaincolor, parts } = piece;

        return `${this.getPieceState(piece)};${color.replace(/;/g, '')};${plaincolor.replace(/;/g, '')};${JSON.stringify(parts)}`;
    };

    // recreate a piece from data
    makePieceFromData = (data: string): Piece => {
        const p = new Piece('', [], [], []);
        const parts = data.split(';');
        this.setPieceState(p, parseInt(parts[0]));
        p.color = parts[1];
        p.plaincolor = parts[2];
        p.parts = JSON.parse(parts[3]);
        return p;
    };

    // generate number, that uniquely characterizes piece's position
    getPieceState = (piece: Piece): number => {
        const pos = piece.getPosition();
        const rot = piece.getRotation();

        // position can't be ever smaller than limits[0] nor bigger than limits[1]
        // therefore position can be modified to pos - limits[0]
        const x = (limits[1] - limits[0] + 1) ** 0 * (pos[0] - limits[0]) + (limits[1] - limits[0] + 1) ** 1 * (pos[1] - limits[0]) + (limits[1] - limits[0] + 1) ** 2 * (2 ** 0 * (rot[0] + 1) / 2 + 2 ** 1 * (rot[1] + 1) / 2 + 2 ** 2 * (rot[2] + 1) / 2);

        return x;
    };

    // set inner state of a piece
    setPieceState = (piece: Piece, state: number): Piece => {
        const data: number[][] = [[], []];

        // now we gotta decode the state
        let x: number = state;

        // first we decode position
        for (let i = 0; i < 2; i++) {
            data[0].push(x % (limits[1] - limits[0] + 1) + limits[0]);
            x = (x - x % (limits[1] - limits[0] + 1)) / (limits[1] - limits[0] + 1);
        }

        // and now the rotation
        for (let i = 0; i < 3; i++) {
            // console.log(x);
            data[1].push((x % 2) * 2 - 1);
            x = (x - x % 2) / 2;
        }

        // console.log("rotation: ")
        // console.log(data)
        // and now we change the inner state of the piece
        piece.setPosition(data[0]);
        piece.setRotation(data[1]);
        return piece;
    };

    /*
    * game stuff
    */
    // set a new piece as active piece
    setActive = (piece: Piece): boolean => {
        // if game has already ended
        if (this.state.finished) {
            return false;
        }

        // if current state is illegal, we can't place the block here
        if (this.state.error) {
            this.setState({ errorMessage: "Block can't be placed here." });
            return false;
        }

        // if the piece is not supposed to be moved now, fail
        if (!this.props.moveOrder[this.state.move].includes(piece)) {
            this.setState({ errorMessage: "You can't move this block now!" });
            return false;
        }

        // if there is a active piece, put it down
        if (this.state.active !== null) {
            // if a move is mandatory, you can't return a piece to a spot you took it from (that would be like passing a move)
            if (this.state.initialPieceState === this.getPieceState(piece) && this.props.mandatoryMoves.includes(this.state.move)) {
                this.setState({ errorMessage: "You can't put the piece where it was before you picked it up!" });
                return false;
            }

            this.state.active.makeDark();
            this.setState(
                oldState => {
                    return {
                        ...oldState,
                        move: (oldState.move + 1) % this.props.moveOrder.length,
                        initialPieceState: null
                    };
                }
            );
        }

        if (this.state.active === piece) {
            this.setState({ active: null });
            // console.log("returned");
            return true;
        }

        piece.makeLight();
        this.setState({ active: piece, initialPieceState: this.getPieceState(piece) });
        console.log('changed initialPieceState');
        return true;
    };

    // pass a move, if it's allowed
    passMove = (): boolean => {
        // if move can't be skipped, throw an error
        if (this.props.mandatoryMoves.includes(this.state.move)) {
            this.setState({ errorMessage: "This move can't be skipped!" });
            return false;
        }

        // if a piece has already been chosen (since the move isn't mandatory), it will be returned where it was before this move
        if (this.state.active !== null && this.state.initialPieceState !== null) {
            this.setPieceState(this.state.active, this.state.initialPieceState);
            this.state.active.makeDark();
            this.setState({ active: null, initialPieceState: null });
        }

        this.setState(
            (oldState) => {
                this.setState({
                    ...oldState,
                    move: (oldState.move + 1) % this.props.moveOrder.length
                });
            }
        );
        return true;
    };

    cancelTheMove = (): boolean => {
        if (this.state.active === null || this.state.initialPieceState === null) return false;
        console.log(this.state);
        this.setPieceState(this.state.active, this.state.initialPieceState);
        console.log(this.state);
        console.log(this.state.active);
        this.state.active.makeDark();
        this.setState({ active: null, initialPieceState: null });
        return true;
    };

    // rotate active piece (if any)
    rotateActive = (clockwise: boolean): void => {
        if (this.state.active === null) { return; }
        this.state.active.rotate(clockwise);
        this.forceUpdate();
    };

    // mirror active piece (if any)
    mirrorActive = (): void => {
        if (this.state.active === null) { return; }
        this.state.active.mirror();
        this.forceUpdate();
    };

    // move active piece (if any) to new position
    moveActive = (x: number, y: number): void => {
        if (!(this.state.active !== null && this.isInside(x, y))) { return; }
        // console.log("moved");
        this.state.active.move(x, y);
        this.forceUpdate();
    };

    // test, if there is any legal move in this position
    doesAnyMoveExist = (): boolean => {
        if (!this.props.mandatoryMoves.includes(this.state.move)) {
            // console.log("not mandatory");
            return true;
        }

        for (const piece of this.props.moveOrder[this.state.move]) {
            if (this.doesAnyMoveExistHelper(piece)) {
                return true;
            }
        }
        return false;
    };

    doesAnyMoveExistHelper = (piece: Piece): boolean => {
        // const testPiece = this.makePieceFromData(this.getPieceData(piece));
        // console.group();
        for (let x = limits[0]; x <= limits[1]; x++) {
            for (let y = limits[0]; y <= limits[1]; y++) {
                for (let r = 0; r < 8; r++) {
                    if (this.getPieceState(piece) === x + (limits[1] - limits[0] + 1) * y + (limits[1] - limits[0] + 1) ** 2 * r) {
                        continue;
                    }

                    if (this.checkIfMoveIsLegal(piece, x + (limits[1] - limits[0] + 1) * y + (limits[1] - limits[0] + 1) ** 2 * r)) {
                        return true;
                    }
                }
            }
        }
        return false;
    };

    render (): React.ReactElement {
        // if error is true, current position is illegal
        let error: boolean = false;

        // first we gotta setup the table
        const table: Array<Array<JSX.Element | undefined>> = [];
        for (let i = 0; i < size; i++) {
            const row: any[] = [];
            for (let j = 0; j < size; j++) {
                row.push(undefined);
            }
            table.push(row);
        }

        // helper for placing pieces
        const helperForPlacingPieces = (piece: Piece): void => {
            // show each part of the piece
            for (const part of piece.show()) {
                const [partX, partY] = part;
                // if the part is outside the table, don't render it
                if (
                    partX < 0 ||
                    partY < 0 ||
                    partX >= size ||
                    partY >= size
                ) {
                    error = true;
                    continue;
                }

                // if there is already a piece on this position or the part is outside playing board, the position is not legal
                if (table[partX][partY] !== undefined || !this.isInside(partX, partY)) {
                    error = true;
                }

                table[partX][partY] = (
                    <td
                        key={`${part.join('')}${this.getPieceData(piece)}`}
                        className={`${this.buildClass(partX, partY)} color-${piece.color}`}
                        onClick={() => this.setActive(piece)}
                        onMouseEnter={() => this.moveActive(partX, partY)}
                    />
                );
            }
        };

        // next, we'll show all non active pieces
        for (const piece of this.props.pieces) {
            if (piece === this.state.active) continue;
            helperForPlacingPieces(piece);
        }

        // now we gotta do the exact same thing for active piece
        if (this.state.active !== null) {
            helperForPlacingPieces(this.state.active);
        }

        // change undefined to empty cells
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                // if is undefined
                if (table[i][j] === undefined) {
                    table[i][j] = <td
                        key={j}
                        className={this.buildClass(i, j)}
                        onMouseEnter={() => this.moveActive(i, j)}/>;
                }
            }
        }

        // console.log("error:" + error);

        this.setState({ error: error });

        return (
            <div className="container">
                <div className="row">
                    <p>{this.state.finished ? 'game is finished!' : null}</p>
                </div>

                <div className="row">
                    <div className="col alert alert-primary">It's {this.props.players[this.props.playersForMoves[this.state.move]]}'s move</div>
                    <div className="col alert alert-primary">You should move a {this.props.moveOrder[this.state.move][0].plaincolor} piece</div>
                </div>

                {this.state.errorMessage !== null
                    ? <div className="alert alert-danger container position-absolute">{this.state.errorMessage}</div>
                    : null
                }

                <table>
                    <tbody>
                        {table.map((row, idx) => <tr key={idx}>{row}</tr>)}
                    </tbody>
                </table>
                <div className="btn-group w-100">
                    <button className="btn btn-primary" disabled={this.state.active === null} onClick={() => this.rotateActive(true)}>rotate clockwise</button>
                    <button className="btn btn-primary" disabled={this.state.active === null} onClick={() => this.rotateActive(false)}>rotate counterclockwise</button>
                    <button className="btn btn-primary" disabled={this.state.active === null} onClick={() => this.mirrorActive()}>rotate</button>
                    <button className="btn btn-primary" disabled={this.state.active === null} onClick={() => this.cancelTheMove()}>cancel picing a piece</button>
                    <button className="btn btn-primary" onClick={this.passMove}>pass a move</button>
                </div>
            </div>
        );
    }

    /*
    * helpers for render
    */
    // check if a cell is inside smaller game board
    isInside = (x: number, y: number): boolean => {
        return x >= limits[0] && x <= limits[1] && y >= limits[0] && y <= limits[1];
    };

    // make classes for table cells
    buildClass = (x: number, y: number): string => {
        let name = '';
        if (x < limits[0] || x > limits[1] || y < limits[0] || y > limits[1]) { return name; }
        if (x === limits[0]) name += 'top ';
        if (x === limits[1]) name += 'bottom ';
        if (y === limits[0]) name += 'left ';
        if (y === limits[1]) name += 'right ';
        return name;
    };
}
