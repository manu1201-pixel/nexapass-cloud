const mongoose = require('mongoose');
const { Event } = require('./db');
require('dotenv').config();

async function seedRealVenues() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        await Event.deleteMany({});

        const realVenues = [
            {
                title: "India Clean Energy Summit",
                description: "Discussing local infrastructure grid integration and sustainable supply chains.",
                category: "Upcoming",
                event_date: new Date("2026-06-15T10:00:00Z"),
                address: "NIMHANS Convention Centre, Bengaluru",
                location: { type: "Point", coordinates: [77.5929, 12.9431] } // [Lng, Lat]
            },
            {
                title: "Next-Gen DevCon 2026",
                description: "Deep dive workshops covering cloud-native microservices and modern runtime optimization.",
                category: "Live",
                event_date: new Date("2026-05-28T09:00:00Z"),
                address: "BIEC (Bengaluru International Exhibition Centre)",
                location: { type: "Point", coordinates: [77.4741, 13.0624] } // [Lng, Lat]
            },
            {
                title: "AI Systems Roundtable",
                description: "An intimate assembly of engineers discussing edge-computing model inference deployment architectures.",
                category: "Future",
                event_date: new Date("2026-07-04T14:30:00Z"),
                address: "ITC Gardenia, Ashok Nagar",
                location: { type: "Point", coordinates: [77.5966, 12.9694] } // [Lng, Lat]
            }
        ];

        await Event.insertMany(realVenues);
        console.log("🚀 Real Indian venues successfully seeded into MongoDB Atlas!");
    } catch (error) {
        console.error("❌ Seeding Error:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedRealVenues();