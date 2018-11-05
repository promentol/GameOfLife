const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const path = require('path');
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const jwtMiddleware = require('express-jwt');
const jwt = require('jsonwebtoken');
const GameOfLifeService = require('./services/GameOfLifeService')

const secret = process.env.SECRET || 'asd'
const height = process.env.HEIGHT || 250
const width = process.env.WIDTH || 400

app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

app.post('/login', (req, res, next) => {
  const payload = {
    r: parseInt(256*Math.random()),
    g: parseInt(256*Math.random()),
    b: parseInt(256*Math.random()),
  }
  jwt.sign(payload, secret, {
    expiresIn: "7 days"
  }, (err, token) => {
    if(err) {
      console.log(err)
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

app.get('/points', (req, res) => {
  GameOfLifeService.getAll().then((data)=>{
    var obj = {}
    for (var i in data) {
      var [x, y, z] = i.split(":")
      obj[`${x}:${y}`] = {
        ...obj[`${x}:${y}`],
        [z]: data[i]
      }
    }
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
      console.log(err)
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
  body('points.$.x', 'range').custom(value => value >=0 && value < width),
  body('points.$.y').exists(),
  body('points.$.y').isInt(),
  body('points.$.y', 'range').custom(value => value >=0 && value < height)
], (req, res, next) => {
  const { r, g, b } = req.user
  const { points } = req.body
  console.log(r, g, b)
  console.log(points)
  GameOfLifeService.addPoints(points, {
    r, g, b
  }).then(()=>{
    res.send({})
  }).catch(e=>{
    next(e)
  })
})


app.use((err, req, res, next) => {
  console.log(err)
  res.status(err.status || 500).send(err.name)
})

server.listen(process.env.PORT || 5000);

GameOfLifeService.initSubscriber()

GameOfLifeService.events().on("data", ()=>{
  console.log('new data')
  GameOfLifeService.getAll().then((data)=>{
    var obj = {}
    for (var i in data) {
      var [x, y, z] = i.split(":")
      obj[`${x}:${y}`] = {
        ...obj[`${x}:${y}`],
        [z]: data[i]
      }
    }
    return obj
  }).then((obj)=>{
    console.log(obj)
    io.emit('data', obj)
  })
})