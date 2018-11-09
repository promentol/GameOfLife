var CronJob = require('cron').CronJob;
var worker = require('../worker/worker.js');

var job = new CronJob({
  cronTime: "0-59/2 * * * * *",
  onTick: () => worker.start(),
  start: true
});

job.start();
