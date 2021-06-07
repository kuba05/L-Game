import react from 'react';

import NeuralNetwork from 'deepneuralnet';
import { Map } from '../map';
import { Game } from './game';
import { AI } from '../types';

interface LearningProps {
    limit: number;
}

interface LearningState {
    population: AI[];
    nextPopulation: AI[];
    genNumber: number;
}
                                                    
export class Learning extends react.Component<LearningProps,LearningState> {

    constructor(props: LearningProps) {
        super(props);
        let x = [];
        for (let i = 0; i<50; i++) {
            x.push(new NeuralNetwork ([4, 2, 40, 3]));
        }
        
        this.state = {population: x, nextPopulation: x, genNumber: 0};
    }
    render() {
        let p = this.state.population;
        //shuffle
        for (let i = p.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [p[i], p[j]] = [p[j], p[i]];
        }
        let games = [];
        for (let i = 0; i < p.length/2; i++) {
            games.push(
                <Game key={this.state.genNumber*1000+i} AIone={p[2*i]} AItwo={p[2*i+1]}
                    //kill the loser
                    callback={(winner) => this.kill(p[2*i+1-winner])}
                />
            );
        }
        this.nextGen();
        console.log("gen completed");
        //return <div>as</div>;
        return <div>{games}</div>;
    }
    
    kill = (ai: AI) => {
        this.state.nextPopulation.splice(this.state.nextPopulation.indexOf(ai),1);
    }
    
    nextGen = () => {
        console.log("new gen!");
        let gen = this.state.nextPopulation;
        //shuffle
        for (let i = gen.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gen[i], gen[j]] = [gen[j], gen[i]];
        }    
        let newGen = [];
        
        console.warn(gen);
        
        for (let x of gen) {
            newGen.push(x.copy());
            newGen[newGen.length-1].mutate(y=>y*0.1);
            newGen.push(x.copy());
            newGen[newGen.length-1].mutate(y=>y*0.1);
        }
        this.setState({population: newGen, nextPopulation: newGen, genNumber: this.state.genNumber+1});
    }
    
    shouldComponentUpdate(nextProps: LearningProps, nextState: LearningState) {
        let out = nextState.genNumber !== this.state.genNumber && this.state.genNumber < this.props.limit;
        console.log(out);
        console.log(this.state.genNumber);
        //return false;
        
        return out;
    }
} 