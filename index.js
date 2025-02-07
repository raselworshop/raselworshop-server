const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();

app.use(cors({
    origin: [
        "http://localhost:5173",
        "https://raselworshop.netlify.app",
        "https://www.raselworshop.netlify.app"
    ],
    
}))

app.use(bodyParser.json());
app.use(express.json());

// MongoDB URI & Client
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.5hy3n.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    },
});

// Main Function
async function run() {
    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const database = client.db('port-folio-mail'); // Database name
        const messagesCollection = database.collection('messages'); // Collection name

        // API Endpoint: Send Email
        app.post('/email', async (req, res) => {

            try {
                const { name, email, message } = req.body;

                // Validate input
                if (!name || !email || !message) {
                    return res.status(400).send('All fields are required.');
                }

                // Save message to MongoDB
                const result = await messagesCollection.insertOne({
                    name,
                    email,
                    message,
                    date: new Date(),
                });

                if (!result.acknowledged) {
                    return res.status(500).send('Failed to save message in database.');
                }

                // API Endpoint: Send Email
                // in production mode need a valid sandbox
                // try {
                //     const data = await mg.messages.create(process.env.EMAIL_SENDING_DOMAIN, {
                //         from: `Mailgun Sandbox <postmaster@${process.env.EMAIL_SENDING_DOMAIN}>`,
                //         to: ["Md. Rasel mia <raselworshop@gmail.com>"],
                //         subject: `New Message from ${name}`,
                //         html: `<div>
                //                 <h3>Sender: ${email}</h3>
                //                 <p>Message: ${message}</p>
                //               </div>`,
                //     });

                //     // console.log(data); // logs response data
                // } catch (error) {
                //     console.log(error); //logs any error
                // }
                res.status(200).send({ success: true, message: "Email send successfull" });
            } catch (error) {
                // console.error('Error in /send-email:', error);
                res.status(500).send('Failed to send email. Please try again later.');
            }
        });

    } catch (error) {
        // console.error('Error connecting to MongoDB:', error);
        // process.exit(1);
    }
}

run().catch(console.dir);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Portfolio server is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
