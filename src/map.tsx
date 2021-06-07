import react from 'react';

import { Piece } from './piece';
import { Player } from './types';

const limits: number[] = [2,5];
const size = 8;


interface MapProps {
    pieces: Piece[];
    moveOrder: Piece[][];
    mandatoryMoves: number[];
    players: {[index:number]: string|Player};
    playersForMoves: number[];
    loopback?: (map:Map)=>void;
}


interface MapState {
    active: Piece | null;
    error: boolean;
    errorMessage: String|null;
    
    //which move it is right now
    move: number;
    
    //position of active piece beofre we started to move it
    initialPieceState: number | null;
    
    //is game finished
    finished: boolean;
}



export class Map extends react.Component<MapProps, MapState>{

    /*
    * technical stuff
    */
    constructor(props: MapProps) {
        super(props);
        this.state = {active: null, error: false, errorMessage: null, move: 0, initialPieceState: null, finished: false};
        if (props.loopback) {
            props.loopback(this);
        }
    }
    
    componentDidMount() {
    
        //overload rightclick
        window.oncontextmenu = () => {
            if (this.state.active)
                this.rotateActive(true);
                return false;
        };
        
        //overload middlebutton
        window.onmouseup = (e) => {
            //console.log(e);
            if (e.which === 2 && this.state.active) {
                this.mirrorActive();
                //this doesn't really work here, idk how to fix it tho
                return false;
            }
        }
    }
    
    shouldComponentUpdate(nextProps: MapProps, nextState: MapState) {
        if (JSON.stringify(this.state) === JSON.stringify(nextState) && JSON.stringify(this.props) === JSON.stringify(nextProps))
            return false;
            
        return true;
    }
    
    componentDidUpdate(prevProps: MapProps, prevState: MapState) {
        //remove the error message when it's no longer needed
        if (this.state.errorMessage && prevState.errorMessage && this.state.errorMessage === prevState.errorMessage)
            this.setState({errorMessage: null});
        
        //if a move has been made, check if any legal move exists
        if (this.state.move !== prevState.move)
            this.setState({finished: !this.doesAnyMoveExist()});
    }
    
    
    /*
    * stuff with pieces (might be static)
    */
    //generate number that characerizes given piece
    getPieceData = (piece: Piece) : string => {
        //console.log(JSON.stringify(piece.parts));
        return this.getPieceState(piece) + ";" + piece.color.replace(/;/g, "") + ";" + piece.plaincolor.replace(/;/g, "") + ";" + JSON.stringify(piece.parts);
    }
    
    //recreate a pice from data
    makePieceFromData = (data: string): Piece => {
        let p = new Piece("",[],[],[]);
        let parts = data.split(";");
        this.setPieceState(p, parseInt(parts[0]));
        p.color = parts[1];
        p.plaincolor = parts[2];
        p.parts = JSON.parse(parts[3]);
        return p;
    }
    
    //generate number, that uniquely characterizes piece's position
    getPieceState = (piece: Piece) => {
        let pos = piece.getPosition();
        let rot = piece.getRotation();
        
        //position can't be ever smaller than limits[0] nor bigger than limits[1]
        //therefore position can be modified to pos - limits[0]
        let x = (limits[1]-limits[0]+1)**0 * (pos[0] - limits[0]) + (limits[1]-limits[0]+1)**1 * (pos[1] - limits[0]) + (limits[1]-limits[0]+1)**2 * ( 2**0 * (rot[0]+1)/2 + 2**1 * (rot[1]+1)/2 + 2**2 * (rot[2]+1)/2);
        
        return x;
    }
    
    //set inner state of a piece
    setPieceState = (piece: Piece, state: number) => {
        let data: number[][] = [[],[]]
        
        //now we gotta decode the state
        let x: number = state;
        
        //first we decode position
        for (let i = 0; i < 2; i++) {
            data[0].push(x % (limits[1]-limits[0]+1) + limits[0]);
            x = (x - data[0][i])/ (limits[1]-limits[0]+1);
        }
        
        //and now the rotation
        for (let i = 0; i < 3; i++) {
            //console.log(x);
            data[1].push( (x % 2) * 2 - 1);
            x = (x - x%2)/ 2;
        }
        
        //console.log("rotation: ")
        //console.log(data)
        //and now we change the inner state of the piece
        piece.setPosition(data[0]);
        piece.setRotation(data[1])
    }
    
    
    
    
    /*
    * game stuff
    */
    //set a new piece as active piece
    setActive = (piece: Piece) => {
        //if game has already ended
        if (this.state.finished) {
            return false;
        }
        
        //if current state is illegal, we can't place the block here
        if (this.state.error){
            this.setState({errorMessage: "Block can't be placed here."});
            return false;
        }
        
        //if the piece is not supposed to be moved now, fail
        if (! this.props.moveOrder[this.state.move].includes(piece) ) {
            this.setState({errorMessage: "You can't move this block now!"});
            return false;
        }
        
        //if there is a active piece, put it down
        if (this.state.active) {
            //if a move is mandatory, you can't return a piece to a spot you took it from (that would be like passing a move)
            if (this.state.initialPieceState === this.getPieceState(piece) && this.props.mandatoryMoves.includes(this.state.move)) {
                this.setState({errorMessage: "You can't put the piece where it was before you picked it up!"});
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
            this.setState({active: null});
            //console.log("returned");
            return true;
        }
        
        piece.makeLight();
        this.setState({active: piece, initialPieceState: this.getPieceState(piece)});
        return true;
    }
    
    //pass a move, if it's allowed
    passMove = () => {
        //if move can't be skipped, throw an error
        if (this.props.mandatoryMoves.includes(this.state.move)) {
            this.setState({errorMessage: "This move can't be skipped!"});
            return false;
        }
        
        //if a piece has already been chosen (since the move isn't mandatory), it will be returned where it was before this move
        if (this.state.active && this.state.initialPieceState) {
            this.setPieceState(this.state.active, this.state.initialPieceState);
            this.state.active.makeDark();
            this.setState({active: null, initialPieceState: null});
        }
        
        this.setState(
            (oldState) => {
                this.setState({
                    ...oldState,
                    move: (oldState.move+1) % this.props.moveOrder.length
                })
            }
        );
        return true;
    }
    
    cancelTheMove = () => {
        if (!this.state.active || !this.state.initialPieceState) {
            return false;
        }
        //console.log(this.state);
        this.setPieceState(this.state.active, this.state.initialPieceState);
        //console.log(this.state);
        this.state.active.makeDark();
        this.setState({active: null, initialPieceState: null});
        return true;
    }
    
    //rotate active piece (if any)
    rotateActive = (clockwise: boolean) => {
        if (!this.state.active)
            return
        this.state.active.rotate(clockwise);
        this.forceUpdate();
    }
    
    //mirror active piece (if any)
    mirrorActive = () => {
        if (!this.state.active)
            return
        this.state.active.mirror();
        this.forceUpdate();
    }
    
    //move active piece (if any) to new position
    moveActive = (x: number, y: number) => {
        if (! (this.state.active && this.isInside(x,y)))
            return
        //console.log("moved");
        this.state.active.move(x,y);
        this.forceUpdate();
    }
    
    
    //test, if there is any legal move in this position
    doesAnyMoveExist = () => {
        
        if (!this.props.mandatoryMoves.includes(this.state.move)) {
            //console.log("not mandatory");
            return true;
        }
        
        for (let piece of this.props.moveOrder[this.state.move]) {
            if (this.doesAnyMoveExistHelper(piece)) {
                return true;
            }
        }
        return false;
    }
    
    doesAnyMoveExistHelper = (piece: Piece) => {
        let testPiece = this.makePieceFromData(this.getPieceData(piece));
        //console.group();
        for (let x = limits[0]; x <= limits[1]; x++) {
            for (let y = limits[0]; y <= limits[1]; y++) {
                for (let r = 0; r < 8; r++) {
                    
                    //move testPiece to other location
                    this.setPieceState(testPiece, x + size*y + size**2 *r);
                    //console.group();
                    //console.log("x: " + x + "; y: " + y + "; r: " + r);
                    
                    //console.log(piece);
                    //console.log(testPiece);
                    if (this.getPieceState(piece) === this.getPieceState(testPiece)) {
                        //console.log("default position")
                        //console.groupEnd();
                        continue;
                    }
                    
                    //test, if this position is legal
                    let canBePlaced = true;
                    //console.log(testPiece.show());
                    for (let part of testPiece.show()) {
                        //return if the piece is already known to not be able to be placed
                        if (!canBePlaced) {
                            //console.log("can't be placed");
                            break;
                        }
                        //is inside the field?
                        //console.log(part);
                        if (!this.isInside(part[0],part[1])) {
                            canBePlaced = false;
                            //console.log("isNotInside");
                            break;
                        }
                        //is there any other piece on the same position?
                        for (let otherPiece of this.props.pieces) {
                            if (otherPiece === piece) {
                                //console.log("the same piece");
                                continue;
                            }
                            //console.log("the pieces arent the same");
                            if (otherPiece.show().findIndex(a => JSON.stringify(part) === JSON.stringify(a) ) !== -1) {
                                canBePlaced = false;
                                //console.log("this part can not be placed");
                                break;
                            }
                            //console.log("this part can be placed");
                        }
                    }
                    //console.log("canBePlaced: " + canBePlaced);
                    //console.groupEnd();
                    if (canBePlaced) {
                        return true;
                    }
                    
                }
            }
        }
        return false;
    }
    
    
    
    
    
    render() {
        //if error is true, current position is illegal
        let error: boolean = false;
        
        //first we gotta setup the table
        let table: any[][] = [];
        for (let i = 0; i < size; i++) {
            let row: any[] = [];
            for (let j = 0; j < size; j++) {
                row.push(undefined);
                
            }
            table.push(row); 
        }
        
        //helper for placing pieces
        const helperForPlacingPieces = (piece: Piece) => {
            //show each part of the piece
            for (let part of piece.show()) {
                //if the part is outside the table, don't render it
                if (part[0] < 0 || part[1] < 0 || part[0] >= size || part[1] >= size) {
                    error = true;
                    continue;
                }
                
                //if there is already a piece on this position or the part is outside playing board, the position is not legal
                if (table[part[0]][part[1]] || !this.isInside(part[0],part[1])) {
                    error = true;
                }
                    
                table[part[0]][part[1]] = <td key={part+""+this.getPieceData(piece)} className={this.buildClass(part[0],part[1]) + "color-" + piece.color} onClick={() => this.setActive(piece)} onMouseEnter={() => this.moveActive(part[0],part[1])}/>;
            }
        };
            
            
        //next, we'll show all non active pieces
        for (let piece of this.props.pieces) {
            if (piece === this.state.active)
                continue
            helperForPlacingPieces(piece);
            
        }
        
        //now we gotta do the exact same thing for active piece
        if (this.state.active) {
            helperForPlacingPieces(this.state.active);
        }
        
        
        //change undefined to empty cells
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                //if is undefined
                if (!table[i][j])
                    table[i][j] = <td key={j} className={this.buildClass(i,j)} onMouseEnter={() => this.moveActive(i,j)}/>
            } 
        }
                    
        //console.log("error:" + error);
        
        this.setState({error: error});
        
        return (
            <div className="container">
                <div className="row">
                    <p>{this.state.finished? "game is finished!": null}</p>
                </div>
                
                <div className="row">
                    <div className="col alert alert-primary">It's {this.props.players[this.props.playersForMoves[this.state.move]]}'s move</div>
                    <div className="col alert alert-primary">You should move a {this.props.moveOrder[this.state.move][0].plaincolor} piece</div>
                </div>
                
                {this.state.errorMessage? 
                        <div className="alert alert-danger container position-absolute">{this.state.errorMessage}</div>
                    : null
                }
                
                <table>
                    <tbody>
                        {table.map((row, idx) => <tr key={idx}>{row}</tr>)}
                    </tbody>
                </table>
                <div className="btn-group w-100">
                    <button className="btn btn-primary" disabled={!this.state.active} onClick={() => this.rotateActive(true)}>rotate clockwise</button>
                    <button className="btn btn-primary" disabled={!this.state.active} onClick={() => this.rotateActive(false)}>rotate counterclockwise</button>
                    <button className="btn btn-primary" disabled={!this.state.active} onClick={() => this.mirrorActive()}> rotate </button>
                    <button className="btn btn-primary" onClick={this.passMove}>pass a move</button>
                    <button className="btn btn-primary" onClick={()=>this.cancelTheMove()}> cancel picing a piece</button>
                </div>
            </div>
        );
        
    }
    
    /*
    * helpers for render
    */
    //check if a cell is inside smaller game board
    isInside = (x: number, y: number) => {
        return x >= limits[0] && x <= limits[1] && y >= limits[0] && y <= limits[1];
    }
    
    //make classes for table cells
    buildClass = (x: number, y: number) => {
        let name = "";
        if (x < limits[0] || x > limits[1] || y < limits[0] || y > limits[1])
            return name;
        if (x === limits[0])
            name += "top ";
        if (x === limits[1])
            name += "bottom ";
        if (y === limits[0])
            name += "left ";
        if (y === limits[1])
            name += "right ";
        return name;
    }
    
}