// server.js (Updated to use ES Modules)

import express from 'express';
import supabase from './supabaseClient.js'; // Note the .js extension is required
import dotenv from 'dotenv'; 

dotenv.config(); // We need to run dotenv here to ensure process.env is populated

const app = express();
const PORT = process.env.PORT || 3000; 

app.use(express.json());

// API Endpoint: Fetch all properties from the 'properties' table
app.get('/properties', async (req, res) => {
    // ... rest of the code remains the same ...
    const { data, error } = await supabase
        .from('properties')
        .select('id, address, confidence_score'); 
    
    if (error) {
        console.error('Supabase Query Error:', error);
        return res.status(500).json({ 
            error: 'Could not fetch properties', 
            details: error.message 
        });
    }

    res.status(200).json({
        message: 'Successfully established connection and fetched data!',
        count: data ? data.length : 0,
        data: data
    });
});

// Start the Server
app.listen(PORT, () => {
    console.log(`✅ Phase 1 Server is running on port ${PORT}`);
});