const express = require('express')
const cors = require('cors');
const app = express()
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = "mongodb+srv://cardoctore:s4RTrC8pxKhO2Zka@cluster0.2lraink.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)

        const carCollection = client.db('carDoctor').collection('services');
        const bookingCollection = client.db('carDoctor').collection('booking');

        app.get('/services', async (req, res) => {
            const services = await carCollection.find({}).toArray();
            res.send(services);
        })
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const options = {
                projection: { title: 1, price: 1, service_id: 1, img: 1 }
            };
            const service = await carCollection.findOne(query, options);
            res.send(service);
        })


        // booking api

        app.post('/booking', async (req, res) => {
            const newBooking = req.body;
            const doc = {
                name: newBooking.customerName,
                date: newBooking.date,
                email: newBooking.email,
                dueAmount: newBooking.dueAmount,
                image: newBooking.img
            }
            console.log(newBooking);
            const result = await bookingCollection.insertOne(doc);
            res.json(result);
        });

        app.get('/booking', async (req, res) => {
            const result = await bookingCollection.find({}).toArray();
            res.send(result);
        })

        app.get('/bookings', async (req, res) => {
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            const result = await bookingCollection.find(query).toArray();
            res.send(result);
        })

        app.patch('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const updateDoc = req.body;
            const query = { _id: new ObjectId(id) }
            const update = {
                $set: {
                    status: updateDoc.status
                }
            }
            const result = await bookingCollection.updateOne(query, update);
            res.json(result);
        })

        app.delete('/bookings/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await bookingCollection.deleteOne(query);
            res.json(result);
        })

        // Send a ping to confirm a successful connection
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})