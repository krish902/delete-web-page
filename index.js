const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

// ✅ Middleware
app.use(cors()); // Allow all origins (adjust later for production)
app.use(bodyParser.json());

// ✅ Test route
app.get('/', (req, res) => {
  res.send('Account Deletion Backend is running');
});

// ✅ Account deletion route
app.post('/api/v1/user/delete-account-request', (req, res) => {
  const { mobilePrefix, mobileNumber, email, reason, confirm } = req.body;

  // Basic validation
  if (!mobileNumber) {
    return res.status(400).json({ success: false, msg: 'Mobile number is required' });
  }
  if (!confirm) {
    return res.status(400).json({ success: false, msg: 'You must confirm deletion' });
  }

  // Here you would handle actual deletion logic (DB calls, emails, etc.)
  console.log('Account deletion request received:', { mobilePrefix, mobileNumber, email, reason });

  return res.json({ success: true, msg: 'Account deletion request received successfully' });
});

// ✅ Listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
