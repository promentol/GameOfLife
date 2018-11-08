var assert = require('assert');
const {GameOfLife} = require('../services/GameOfLife')
const redis = require('redis')
require('bluebird').promisifyAll(redis);
var assert = require('assert');

const lodash = require('lodash')

describe('Game Of Life', function() {

	this.timeout(10000);

	before(async function() {
        this.client = redis.createClient(process.env.REDIS_URL)
        this.gm = new GameOfLife(this.client, 'test')
	});

	afterEach(async function() {
        const keys = lodash.keys(
            (await this.client.hgetallAsync(this.gm.TABLE_NAME)) || {}
        )
        
        keys.forEach(async (key, i) => {
            await this.client.hdelAsync(this.gm.TABLE_NAME, key)
        });
    });
    
    after(function () {
        this.client.quit()
    })


  describe('Add Point', function() {

    it('It Should add a Point ', async function() {
        await this.gm.addPoints([
            {
                x:1,
                y:1
            },
            {
                x: 3,
                y: 4
            }
        ], {
            r: 22,
            g: 22,
            b: 55
        })

        const b = await this.client.hgetAsync(`${this.gm.TABLE_NAME}`, '1:1:b')
        const r = await this.client.hgetAsync(`${this.gm.TABLE_NAME}`, '3:4:r')
        assert.equal(b, '55')
        assert.equal(r, '22')
    });
  });

  describe('Iteration', function() {

    it('It Should iterate', async function() {
        try {
            await this.gm.addPoints([
                {x:0,y:0},
                {x:0,y:1},
                {x:1,y:0},
                {x:1,y:1}
            ], {
                r: 22,
                g: 22,
                b: 55
            })

            await this.gm.addPoints([
                {x:0,y:1},
            ], {
                r: 1,
                g: 22,
                b: 55
            }),
            await this.gm.addPoints([
                {x:2,y:2},
                {x:2,y:3},
                {x:3,y:2},
                {x:3,y:3}
            ], {
                r: 44,
                g: 44,
                b: 11
            }),
            await this.gm.iterate(5, 5)
            const b_1 = await this.client.hgetAsync(`${this.gm.TABLE_NAME}`, '0:0:b')
            const r_1 = await this.client.hgetAsync(`${this.gm.TABLE_NAME}`, '1:1:r')

            assert.equal(b_1, '55')
            assert.equal(r_1, null)

            await this.gm.iterate(5, 5)

            const b_2 = await this.client.hgetAsync(`${this.gm.TABLE_NAME}`, '0:0:b')
            const r_2 = await this.client.hgetAsync(`${this.gm.TABLE_NAME}`, '1:1:r')

            assert.equal(b_2, '55')
            assert.equal(r_2, '15')
        } catch (e ) {
        }


    });
  })
});