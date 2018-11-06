const redis = require('redis');
require('bluebird').promisifyAll(redis);
const { EventEmitter } = require('events');
const fs = require('fs')

const TABLE_NAME = `${prefix}_GAMEOFLIFE_DATA`
const QUEUE_NAME = `${prefix}_GAMEOFLIFE_QUEUE`
const CHANNEL_NAME = `${prefix}_GAMEOFLIFE_CHANNEL`


const client = redis.createClient(process.env.REDIS)
const prefix = process.env.REDIS_PREFIX || ""

client.on("error", function (err) {
    console.log("Error " + err);
});

exports.addPoints = (points, {
    r, g, b
}) => points.reduce((acc, point) => acc.hmset(TABLE_NAME, {
    [`${point.x}:${point.y}:r`]: r,
    [`${point.x}:${point.y}:g`]: g,
    [`${point.x}:${point.y}:b`]: b
}), client.multi()).publish(CHANNEL_NAME, 1).execAsync()

exports.iterate = (height, width) =>  client.evalAsync(fs.readFileSync('../lua/iterate.lua'), 3, TABLE_NAME, QUEUE_NAME, CHANNEL_NAME, height, width)

exports.getAll = () => client.hgetallAsync(TABLE_NAME)

clientSubscriber = redis.createClient(process.env.REDIS)

exports.initSubscriber = () => clientSubscriber.subscribe(CHANNEL_NAME)

exports.events = () => exports._event ? exports._event : exports._event = new EventEmitter

clientSubscriber.on("message", (message) => {
    if(message == CHANNEL_NAME) {
        exports.events().emit('data')
    }
})