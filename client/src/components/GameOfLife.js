import React, { Component } from 'react';
import Board from './Board'
import { placePoints } from '../utils'
const patterns = require('../patterns.json')


class GameOfLife extends Component {
    placeRandom = (pattern) => {
        const A = parseInt(this.props.dimension.height*Math.random())
        const B = parseInt(this.props.dimension.width*Math.random())
        placePoints(pattern.locations.map(({x, y})=>{
            return {
                x: x+A,
                y: y+B
            }
        }))
    }

    render() {
        return (
            <React.Fragment>
                <Board colors={this.props.colors} dimension={this.props.dimension} />
                <div>
                    {patterns.map((pattern) => {
                        return (
                            <div key={pattern.name} onClick={()=>this.placeRandom(pattern)}>
                                <img src={pattern.url} />
                                <h4>{pattern.name}</h4>
                            </div>
                        )
                    })}
                </div>
            </React.Fragment>
        )
    }
}

export default GameOfLife