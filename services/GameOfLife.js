const { EventEmitter } =require('events')

const fs = require('fs')
const path = require('path')

class GameOfLife {
    constructor(redisClient, prefix) {
        this.TABLE_NAME = `${prefix}_GAMEOFLIFE_DATA`
        this.QUEUE_NAME = `${prefix}_GAMEOFLIFE_QUEUE`
        this.CHANNEL_NAME = `${prefix}_GAMEOFLIFE_CHANNEL`
        
        this.redisClient = redisClient
    }

    iterate (height, width) {
        return this.redisClient.evalAsync(fs.readFileSync(path.join(__dirname, '../lua/iterate.lua')), 3, this.TABLE_NAME, this.QUEUE_NAME, this.CHANNEL_NAME, height, width)
    }

    addPoints (points, {
        r, g, b
    }) {
        return points.reduce((acc, point) => acc.hmset(this.TABLE_NAME, {
            [`${point.x}:${point.y}:r`]: r,
            [`${point.x}:${point.y}:g`]: g,
            [`${point.x}:${point.y}:b`]: b
        }), this.redisClient.multi()).publish(this.CHANNEL_NAME, 1).execAsync()
    }

    getAll() {
        return this.redisClient.hgetallAsync(this.TABLE_NAME).then(formatData)
    }
    
}

class GameOfLifePublisher {
    constructor(redisClient, prefix) {

        this.CHANNEL_NAME = `${prefix}_GAMEOFLIFE_CHANNEL`
        this.clientSubscriber = redisClient
        this.initSubscriber()

        this.events = new EventEmitter()

        this.clientSubscriber.on("message", (message) => {
            if(message == this.CHANNEL_NAME) {
                this.events.emit('data')
            }
        })
    }

    initSubscriber () {
        this.clientSubscriber.subscribe(this.CHANNEL_NAME)
    }

}

function formatData (data) {
  var obj = {}
  for (var i in data) {
    var [x, y, z] = i.split(":")
    obj[`${x}:${y}`] = {
      ...obj[`${x}:${y}`],
      [z]: data[i]
    }
  }
  return obj
}

module.exports = {
    GameOfLife,
    GameOfLifePublisher
}