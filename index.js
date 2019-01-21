const express = require('express');
const bodyParser = require('body-parser');
const mongoClient = require('mongodb').MongoClient;

const dbName = process.env.NODE_ENV === 'dev' ? 'database-test' : 'database';
const url = `mongodb://${process.env.MONGO_INITDB_ROOT_USERNAME}:${
  process.env.MONGO_INITDB_ROOT_PASSWORD
}@${dbName}:27017?authMechanism=SCRAM-SHA-1&authSource=admin`;
const options = {
  useNewUrlParser: true,
  reconnectTries: 60,
  reconnectInterval: 1000
};

const routes = require('./routes/routes');
const port = process.env.PORT || 80;
const app = express();
const http = require('http').Server(app);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/api', routes);
app.use((req, res) => {
  res.status(404);
});

MongoClient.connect(
  url,
  options,
  (err, database) => {
    if (err) {
      console.log(`FATAL MONGODB CONNNECTION ERROR: ${err}:$P{err.stack}`);
      process.exit(1);
    }
    app.locals.db = database.db('api');
    http.listen(port, () => {
      console.log('Listening on port ' + port);
      app.emit('APP_STARTED');
    });
  }
);

module.exports = app;
