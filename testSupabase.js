// testSupabase.js (Start of file)

// REMOVE DOTENV AND createClient setup
const supabase = require('./supabaseClient.js'); // Import the client
import { scoreProperty } from './scoring.js'; // Keep scoring import

// ... rest of your code remains the same ...
// Note: If you encounter an "import/require" error here, 
// we may need to use a simple 'require' statement for scoreProperty 
// or switch package.json to type: "module" (which we will handle later).