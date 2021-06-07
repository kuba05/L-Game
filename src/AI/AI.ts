import NeuralNetwork from 'deepneuralnet';
import { Map } from '../map';

let nn = new NeuralNetwork ([4, 20, 20, 1]);



console.log(nn.query([0.1020,0.213,0.414,0.2154]));



export default 1;


/*
position/16/8
position/16/8

position/16/8

position/16/8
*/