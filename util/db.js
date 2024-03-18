const mongodb = require('mongodb')
const mongoClient = mongodb.MongoClient

require('dotenv').config()

let _db ;
const mongoConnect = (cb)=>{
    
    mongoClient.connect(process.env.MONGO_URI)
.then(result => 
    {   console.log('connected!')
        _db = result.db()
        cb()
    })
.catch(err =>console.log(err))
}

const getDb = ()=>{
    if(_db)
        return _db;
    throw 'no database found'
}

module.exports = {mongoConnect, getDb};