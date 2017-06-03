const MongoClient = require('mongodb').MongoClient
const ObjectID = require('mongoskin').ObjectID
// const db = mongo.db('mongodb://localhost:27017/ltcs')
const db = mongo.db('mongodb://pass:pass@ds139791.mlab.com:39791/ltcs-todo')

exports.list = function () {
  return MongoClient.connect(url)
    .then(db => db.collection('users'))
    .then(collection => collection.find({}).toArray())
}

exports.detail = function (id) {
  return MongoClient.connect(url)
    .then(db => db.collection('users'))
    .then(collection => collection.findOne({_id: new ObjectID(id)}))
}

exports.create = function (user) {
  return MongoClient.connect(url)
    .then(db => db.collection('users'))
    .then(collection => collection.insertOne(user))
    .then(res => res.ops[0]._id)
}

exports.modify = function (id, user) {
  return MongoClient.connect(url)
    .then(db => db.collection('users'))
    .then(collection => collection.updateOne({_id: new ObjectID(id)}, {$set: user}))
}

exports.remove = function (id) {
  return MongoClient.connect(url)
    .then(db => db.collection('users'))
    .then(collection => collection.removeOne({_id: new ObjectID(id)}))
}
