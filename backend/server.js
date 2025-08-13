
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const { seedDevData } = require('./config/seed');

dotenv.config();


const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/shifts', require('./routes/shiftsRoutes'));
app.use('/api/requests', require('./routes/requestsRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/availability', require('./routes/availabilityRoutes'));

// Export the app object for testing
if (require.main === module) {
    (async () => {
      await connectDB();
      if (!process.env.MONGO_URI || process.env.MONGO_URI.includes('<YOUR')) {
        await seedDevData();
      }
      const PORT = process.env.PORT || 5001;
      app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })();
  }


module.exports = app
