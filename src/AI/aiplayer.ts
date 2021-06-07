import { Player, AI } from '../types';

export class AIPlayer implements Player {
    ai: AI;
    
    constructor(ai: AI) {
        this.ai = ai;
    }
    
    makeMove (position: number[]) {
        console.log(position);
        return this.ai.query(position.map(x => x/8/16));
    }
}