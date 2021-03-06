const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwtMiddleware = require('express-jwt');
const jwt = require('jsonwebtoken');
const { GameOfLife, GameOfLifePublisher } = require('./services/GameOfLife')
const redis = require('redis');
require('bluebird').promisifyAll(redis);


const secret = process.env.SECRET || 'asd'
const height = process.env.HEIGHT || 20
const width = process.env.WIDTH || 50

app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.post('/login', (req, res, next) => {
  const colors = {
    r: parseInt(256*Math.random()),
    g: parseInt(256*Math.random()),
    b: parseInt(256*Math.random()),
  }
  jwt.sign(colors, secret, {
    expiresIn: "7 days"
  }, (err, token) => {
    if(err) {
      res.status(500).send({})
    } else {
      res.cookie('authorization', token, { path: '/', secure: false, httpOnly: true });
      res.send({
        colors,
        dimension: {
          height,
          width
        }
      })    
    }
  });
})

app.get('/points', (req, res) => {
  gameOfLife.getAll().then((obj)=>{
    res.send(obj)
  })
})

app.use(jwtMiddleware({
  secret,
  credentialsRequired: true,
  getToken: function  (req) {
    return req.cookies.authorization
  }
}));

app.post('/token/extend', (req, res, next)=>{
  const { r, g, b } = req.user
  jwt.sign({
    r, g, b
  }, secret, {
    expiresIn: "7 days"
  }, (err, token) => {
    if(err) {
      res.status(500).send({})
    } else {
      res.cookie('authorization', token, { path: '/', secure: false, httpOnly: true });
      res.send({
        colors: {
          r, g, b
        },
        dimension: {
          height,
          width
        }
      })        
    }
  });

})

const { body } = require('express-validator/check');

app.post('/points', [
  body('points').exists(),
  body('points').isArray(),
  body('points.$.x').isInt(),
  body('points.$.x').exists(),
  body('points.$.x', 'range').custom(value => value >=0 && value < height),
  body('points.$.y').exists(),
  body('points.$.y').isInt(),
  body('points.$.y', 'range').custom(value => value >=0 && value < width)
], (req, res, next) => {
  const { r, g, b } = req.user
  const { points } = req.body
  gameOfLife.addPoints(points, {
    r, g, b
  }).then(()=>{
    res.send({})
  }).catch(e=>{
    next(e)
  })
})


app.use((err, req, res, next) => {
  res.status(err.status || 500).send(err.name)
})

server.listen(process.env.PORT || 5000);

const gameOfLife = new GameOfLife(redis.createClient(process.env.REDIS_URL), process.env.prefix || "")
const gameOfLifePublisher = new GameOfLifePublisher(redis.createClient(process.env.REDIS_URL), process.env.prefix || "")

gameOfLifePublisher.events.on("data", ()=>{
  gameOfLife.getAll().then((obj)=>{
    io.emit('data', obj)
  })
})

io.on('connection', (socket) => {
  gameOfLife.getAll().then((obj)=>{
    socket.emit('data', obj)
  })
})