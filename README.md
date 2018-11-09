# Game Of Life
The Game of Life, also known simply as Life, is a cellular automaton devised by the British mathematician John Horton Conway in 1970

The universe of the Game of Life is an infinite, two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, alive or dead, (or populated and unpopulated, respectively). Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:

- Any live cell with fewer than two live neighbors dies, as if by underpopulation.
- Any live cell with two or three live neighbors lives on to the next generation.
- Any live cell with more than three live neighbors dies, as if by overpopulation.
- Any dead cell with exactly three live neighbors becomes a live cell, as if by reproduction.

## Architecture
Application can be divided into two parts - server and client. Server is placed in the root of the project, while client application is placed inside client folder. Client is built by React.js and it is using CRA. This application also contains worker script, which is a periodical running job for generating new cells in Game Of Life, which is located in `clock/clock.js`. It contains a cron job running every 2 seconds. For persistance it is using `Redis` key-value database. `Socket.io` is being used for server-client communication for updating clients with new data. For authenthication, `json web tokens` are being used, thus keeping the server stateless. `lua` is used for `Redis` scripting.

### Prerequirements
This implementation requires  `node.js` installed `v10` or newer. You Should also have `Redis` installed and running

### How to run for development
For development you should first run install all requirements both in server and client (client folder)
```sh
$ npm install
```
For running server you should run in project `root` folder:
```sh
$ npm start
```
For running react application you should navigate to `client` and run:
```sh
$ npm start
```
For running the cron job you should navigate to the root folder and run:
```sh
$ npm start
```
Port `5000` is used by default for http api server, and port `3000` is used for front end application serving.
### Environment variables
The following environmental variables can be set

| Variable | description | default value | 
| ------ | ------ | ------ |
| `REDIS_URL` | Url of `Redis` instance to connect | none / localhost |
| `PORT` | Port of the server application | 5000 |
| `Prefix` | the prefix of `Redis` keys. Usefull for running multiple apps connected to the same `Redis` instance  | none / "" |
| `HEIGHT` | The height of the Game Of Life table | 20 |
| `WIDTH` | The width of the Game Of Life table | 40 |
| `secret` | The secret for being  | none / "" |

### Testing
For testing, `mocha` is used, you can find all unit tests inside `test` folder. Type `npm run test` for running all tests.

### Building and running for production
First we need to install dependencies, then build client application. For that just run the follwoing command inside root project.
```sh
$ npm install
$ npm run heroku-postbuild
```
Then application will be ready to run by:
```sh
$ npm start
```
Do not forget to run periodical jobs
```sh
$ node clock/clock.js
```
### Deploying to heroku
Have heroku command line toolbet ready to use and just run the following:
```sh
$ git push heroku master
```

### Scalability
For scaling application, just setup load balancer and connect to the application instances. Make sure Sticky Sessions are enabled for correct `socket.io` communication. 
All instances should be connected to the same `Redis` instance/cluster. Redis is single threaded, and all commands are running one by one, which is preserving concurent reads. `Redis PubSub` is being used for notifying data changes from Redis to server application.

### Future Adjustments
At this moment the algorithm written in `lua` is looping through all keys and deciding should it be revieved or killed. For the future we can just select all live cells, then select their neighbours as well, and loop only through them. Although theoretically in worst case those two algorithms will have `O(width*height)` complexity, but in practice, this optimisation will behave very good, as not all cells are live
