import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import App from './App';
import { Learning } from './AI';


console.log(Learning);

ReactDOM.render(
    <>
        <App />
        <Learning limit={50}/>
    </>,
    document.getElementById('root')
);