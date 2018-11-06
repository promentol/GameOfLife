import React, { Component } from 'react';
import io from 'socket.io-client';

class Board extends Component {
    renderCell = () => {

    }
    render() {
        return (
            <div>
                {this.props.dimension.height} x {this.props.dimension.width}
            </div>
        )
    }
}

export default Board