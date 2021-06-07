import { Player, AI } from '../types';

export class AIPlayer implements Player {
    ai: AI;
    
    constructor(ai: AI) {
        this.ai = ai;
    }
    
    makeMove (position: number[]): number[] {
        console.log(position);
        let move = this.ai.query(position.map(x => x/8/16)).map(x=>Math.round(x));
        console.log(move);
        return [move[0]*8*16,move[1]*2, move[2]*8*16];
    }
}