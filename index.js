const app = require('express')();
const http = require('http').Server(app);
const logger = require('morgan');
const _ = require('lodash');

const Docker = require('dockerode');
const docker = new Docker();

let activeContainers = [];
function getActiveContainers() {
  docker.listContainers((err, containers) => {
    activeContainers = containers;
  });
}

setInterval(getActiveContainers, 5 * 1000);
getActiveContainers();

app.use(logger('dev'));
app.get('/containers', (req, res) => {
  res.json({ status: "OK", containers: activeContainers });
});

app.get('/containers/:id', (req, res) => {
  let container = docker.getContainer(req.params.id);
  if (! container) {
    res.end('noop');
    return;
  }

  container.logs({
    follow: true,
    stdout: true,
    stderr: true
  }, (err, stream) => {
    if (err) {
      res.end('noop');
      return;
    }
    stream.pipe(res);
  });

});

http.listen(3000, () => {
  console.log('listening on *:3000');
});
