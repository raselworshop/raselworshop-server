const express = require('express');
const nodemailer = require('nodemailer');
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const PORT = process.env.PORT || 5000;
const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());

// console.log(`${process.env.EMAIL_MINE}, ${process.env.EMAIL_PASS}`)


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
        app.post('/send-email', async (req, res) => {
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
                // Configure Nodemailer
                // const transporter = nodemailer.createTransport({
                //   host: 'smtp.protonmail.com',
                //   port: 465,  // SSL পোর্ট
                //   secure: true,  // SSL সক্রিয় করুন
                //   auth: {
                //     user: process.env.EMAIL_MINE, // আপনার Proton Mail ইমেইল
                //     pass: process.env.EMAIL_PASS, // Proton Mail পাসওয়ার্ড বা অ্যাপ পাসওয়ার্ড
                //   },
                // });
                


                const mailOptions = {
                    from: email,
                    to: process.env.EMAIL_MINE, // Your receiving email
                    subject: `Message from ${name}`,
                    text: message,
                };

                // Send Email
                const info = await transporter.sendMail(mailOptions);
                res.status(200).send('Message sent: ' + info.response);
            } catch (error) {
                // console.error('Error in /send-email:', error);
                res.status(500).send('Failed to send email. Please try again later.');
            }
        });

    } catch (error) {
        // console.error('Error connecting to MongoDB:', error);
        process.exit(1);
    }
}

run().catch(console.error);

// Root Endpoint
app.get('/', (req, res) => {
    res.send('Portfolio server is running.');
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
