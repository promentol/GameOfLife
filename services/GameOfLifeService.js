const redis = require('redis');
require('bluebird').promisifyAll(redis);
const { EventEmitter } = require('events');
const fs = require('fs')


const client = redis.createClient(process.env.REDIS)
const prefix = process.env.REDIS_PREFIX || ""

client.on("error", function (err) {
    console.log("Error " + err);
});

client.hdelAsync(`${prefix}_GAMEOFLIFE_DATA`, '112:-1:r').then(()=>{
    return client.hdelAsync(`${prefix}_GAMEOFLIFE_DATA`, '112:-1:r')
}).then(()=>{
    return client.hdelAsync(`${prefix}_GAMEOFLIFE_DATA`, '112:-1:g')
}).then(()=>{
    return client.hdelAsync(`${prefix}_GAMEOFLIFE_DATA`, '112:-1:b')
})

exports.addPoints = (points, {
    r, g, b
}) => points.reduce((acc, point) => acc.hmset(`${prefix}_GAMEOFLIFE_DATA`, {
    [`${point.x}:${point.y}:r`]: r,
    [`${point.x}:${point.y}:g`]: g,
    [`${point.x}:${point.y}:b`]: b
}), client.multi()).publish(`${prefix}_GAMEOFLIFE_CHANNEL`, 1).execAsync()

exports.iterate = (height, width) =>  client.evalAsync(fs.readFileSync('../lua/iterate.lua'), 1, prefix, height, width)

exports.getAll = () => client.hgetallAsync(`${prefix}_GAMEOFLIFE_DATA`)

clientSubscriber = redis.createClient(process.env.REDIS)

exports.initSubscriber = () => clientSubscriber.subscribe(`${prefix}_GAMEOFLIFE_CHANNEL`)

exports.events = () => exports._event ? exports._event : exports._event = new EventEmitter

clientSubscriber.on("message", (message) => {
    if(message == `${prefix}_GAMEOFLIFE_CHANNEL`) {
        exports.events().emit('data')
    }
})