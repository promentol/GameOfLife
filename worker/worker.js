const GameOfLifeService = require('../services/GameOfLifeService')

const height = process.env.HEIGHT || 250
const width = process.env.WIDTH || 400

GameOfLifeService.iterate(height, width).then((x) => {
    console.log("ITERATION COMPLETE")
    console.log(x)
}).catch(e => {
    console.log("ITERATION ERROR", e)
})