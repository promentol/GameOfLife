import React, { Component } from 'react'
import GameOfLife from './components/GameOfLife'

class App extends Component {

  state = {
    ready: false,
    dimension: {
      height: null,
      width: null
    },
    colors: {
      r: null,
      g: null,
      b: null
    }
  }

  componentDidMount() {
    fetch('/token/extend', {
      method: 'POST'
    }).then((data) => {
      if(data.status === 401){
        return fetch('/login', {
          method: 'POST'
        })
      }
      return data
    }).then((data)=>{
      return data.json()
    }).then((data)=>{
      const {dimension, colors} = data
      this.setState({
        ready: true,
        dimension,
        colors
      })
    })
  }
  render() {
    if(!this.state.ready) {
      return (
        <div>
          Loading...
        </div>
      )
    }
    return (
      <div className="App">
        <GameOfLife colors={this.state.colors} dimension={this.state.dimension}/>
      </div>
    );
  }
}

export default App;
