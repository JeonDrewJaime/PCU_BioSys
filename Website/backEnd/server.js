const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const adminRoutes = require('./routes/adminRoutes'); 

const app = express();

// Allow requests from any origin (open CORS policy)
app.use(cors()); // This allows all origins

app.use(bodyParser.json());

app.use('/admin', adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
