import React, { Component } from 'react';
import io from 'socket.io-client';

class Board extends Component {
    generateArray = (N) => {
        return Array.apply(null, {length: N}).map(Number.call, Number)
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
                                    return <td onClick={()=>this.placePoint(x, y)} key={y}></td>
                                })}
                            </tr>
                        )
                    })}
                </tbody>
                </table>
            </div>
        )
    }
}

export default Board