const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

const cors = require('cors');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6m3jq.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db('travel-zone');
        const destinationCollection = database.collection('destinations');

        // GET API
        app.get('/destinations', async (req, res) => {
            const cursor = destinationCollection.find({});
            const destinations = await cursor.toArray();
            res.send(destinations);
        })

        // GET Single Destination
        app.get('/destinations/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific destination', id);
            const query = { _id: ObjectId(id) };
            const destination = await destinationCollection.findOne(query);
            res.json(destination);
        })

        // POST API
        app.post('/destinations', async (req, res) => {
            const destination = req.body;
            console.log('hit the post api', destination);
            const result = await destinationCollection.insertOne(destination);
            console.log(result);
            res.json(result);
        })

        // Use POST to get data by ids
        app.post('/destinations/byIds', async (req, res) => {
            const ids = req.body;
            const query = { _id: { $in: ids } };
            const destinations = await destinationCollection.find(query).toArray();
            res.json(destinations);
        })

        // DELETE API
        app.delete('/destinations/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await destinationCollection.deleteOne(query);
            res.json(result);
        })

        // Add Destination API
        app.post('/addDestinations', async (req, res) => {
            const destinations = req.body;
            const result = await destinationCollection.insertOne(destinations);
            res.json(result)
        })
    }
    finally {
        // await client.close()
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Running travel-zone Server');
});

app.listen(port, () => {
    console.log('Running travel-zone Server on port: ', port)
})