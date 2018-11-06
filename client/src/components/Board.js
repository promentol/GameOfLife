import React, { Component } from 'react';
import io from 'socket.io-client';
import { placePoints } from '../utils'
import {Helmet} from "react-helmet";

class Board extends Component {
    state = {
        data: {}
    }
    componentDidMount() {
        this.socket = io('localhost:5000');
        this.socket.on('data', (data) => {
            this.setState({
                data
            })
        });
    }
    generateArray = (N) => {
        return Array.apply(null, {length: N}).map(Number.call, Number)
    }
    placePoint = (x, y) => {
        placePoints([{x, y}])
        this.setState({
            data: {
                ...this.state.data,
                [`${x}:${y}`]: {
                    r: this.props.colors.r,
                    g: this.props.colors.g,
                    b: this.props.colors.b
                }
            }
        })
    }
    render() {
        const heightArray = this.generateArray(this.props.dimension.height)
        const widthArray = this.generateArray(this.props.dimension.width)
        return (
            <div>
                <table className="game">
                <tbody>
                    {heightArray.map((x) => {
                        return (
                            <tr key={x}>
                                {widthArray.map((y) => {
                                    const colorString = this.state.data[`${x}:${y}`]
                                    const backgroundColor = colorString ? `rgb(${colorString.r},${colorString.g},${colorString.b})` : ''
                                    return <td style={{backgroundColor}} onClick={()=>this.placePoint(x, y)} key={y}></td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
                </table>
                <Helmet>
                    <style>{
                        `.game td:hover {
                                background-color: rgb(${this.props.colors.r},${this.props.colors.g},${this.props.colors.b});
                        }`}
                    </style>
                </Helmet>

            </div>
        )
    }
}

export default Board