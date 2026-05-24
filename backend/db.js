const mongoose = require('mongoose');
require('dotenv').config();

// 1. Establish Secure Connection to MongoDB Cloud using our .env URI
if (!process.env.MONGO_URI) {
    console.error("❌ ERROR: MONGO_URI is missing from your .env file!");
    process.exit(1);
}

mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('🍃 Secured Connection to MongoDB Cloud Established!'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err.message));

// 2. The Event Schema (Designed specifically for MongoDB Geospatial Queries)
const EventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: String,
    category: { type: String, enum: ['Live', 'Upcoming', 'Future'], default: 'Upcoming' },
    event_date: Date,
    address: String,
    // This GeoJSON structure is mandatory for MongoDB geospatial calculations
    location: {
        type: { type: String, default: 'Point' },
        coordinates: { type: [Number], required: true } // Array order MUST be: [longitude, latitude]
    }
});

// CRITICAL: Create a 2dsphere index on the location field so MongoDB runs coordinate math natively
EventSchema.index({ location: '2dsphere' });

// 3. The Participant Schema (For tracking user registrations & AI itineraries)
const ParticipantSchema = new mongoose.Schema({
    name: { type: String, required: true },
    topic: String,
    itinerary_text: String,
    email: { type: String, default: 'demo@nexapass.v2' },
    created_at: { type: Date, default: Date.now }
});

// Compile schemas into executable models
const Event = mongoose.model('Event', EventSchema);
const Participant = mongoose.model('Participant', ParticipantSchema);

// Export the models so server.js and init-db.js can use them
module.exports = { Event, Participant };