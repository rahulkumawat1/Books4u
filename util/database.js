const mongodb = require('mongodb');

const mongodbCliet = mongodb.MongoClient;

let db;

const mongodbConnect = (cb) => {
    mongodbCliet.connect('mongodb+srv://root:Rahul@123@cluster0.amlja.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            db = client.db();
            console.log("Connected!!");

            cb();
        })
        .catch(err => {
            console.log(err);
            throw err;
        })
}

const getdb = () => {
    if(db) return db;

    throw "No database is found!";
}

exports.mongodbConnect = mongodbConnect;
exports.getdb = getdb;