const { GameOfLife } = require('../services/GameOfLife')

const height = process.env.HEIGHT || 250
const width = process.env.WIDTH || 400
const redis = require('redis');
require('bluebird').promisifyAll(redis);

const redisConnection = redis.createClient(process.env.REDIS_URL)

const gameOfLife = new GameOfLife(redisConnection, process.env.prefix || "")

gameOfLife.iterate(height, width).then(() => {
    console.log("ITERATION COMPLETE")
}).catch(e => {
    console.log("ITERATION ERROR", e)
}).then(() => {
    redisConnection.end(true)
})