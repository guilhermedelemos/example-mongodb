const cluster = 'cluster.abc.mongodb.net';
const database = 'dbname';
const username = 'user';
const password = 'passwd';
const testCollection = 'test';

const MUUID = require('uuid-mongodb');
const MongoClient = require('mongodb').MongoClient;

const min = 1; // min random number
const max = 1000000; // max random number
const limit = 10; // max collection size

console.log('MongoDB Fundamentals');
console.log('https://docs.mongodb.com/drivers/node/fundamentals/crud');
console.log('https://github.com/cdimascio/uuid-mongodb');

const uri = `mongodb+srv://${username}:${password}@${cluster}/${database}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(async err => {
    const collection = await client.db(database).collection(testCollection);

    // INSERT
    const data = await generateData(2);
    //await collection.insertOne(obj);
    const result = await collection.insertMany(data);
    console.log('documents inserted: ' + result.insertedCount);

    // UPDATE
    const filter = { _id: data[0]._id };
    const options = { upsert: true };
    const updateDoc = {
        $set: {
            //date: new Date()
            "length": random(min, max/2)
        },
    };
    const updateResult = await collection.updateOne(filter, updateDoc, options);
    console.log(`${updateResult.matchedCount} document(s) matched the filter, updated ${updateResult.modifiedCount} document(s)`,);

    // DELETE
    const deleteQuery = { _id: data[1]._id };
    const deleteResult = await collection.deleteOne(deleteQuery);
    //const deleteResult2 = await collection.deleteMany({});
    if (deleteResult.deletedCount === 1) {
        console.log("Successfully deleted one document: " + deleteQuery._id);
    } else {
        console.log("No documents matched the query. Deleted 0 documents: " + deleteQuery._id);
    }

    // FIND
    const cursor = collection.find({}).sort({length: 1, date: -1}).project({ date: 1});
    await cursor.forEach(doc => console.log(`{ _id: ${MUUID.from(doc._id).toString()}, date: ${doc.date.toISOString()} }`));
  
    // COUNT
    const estimate = await collection.estimatedDocumentCount();
    console.log(`Estimated number of documents in the test collection: ${estimate}`);

    const count = await collection.countDocuments({});
    console.log(`Accurate number of documents: ${count}`);

    if(count> limit) {
        const deleteResult2 = await collection.deleteMany({});
        if(deleteResult2.deletedCount > 0) {
            console.log(`Collection cleanned because it reached more than ${limit} records`);
        }
    }
  
    client.close();
});

function random(min, max) {  
    return Math.floor(
      Math.random() * (max - min) + min
    )
}
async function generateData(size) {
    let data = [];
    for(i=0; i<size; i++) {
        const uuid = MUUID.v4();
        console.log('generating a new record: ' + uuid.toString());
        
        if(i>0) {await sleep(1000);}
        const obj = { "_id": uuid, "status": "A", "date": new Date(), "length": random(min, max) };
        data.push(obj);
    }
    return data;
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}
