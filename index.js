const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Load environment variables
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ----------------- Connect to MongoDB -----------------
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// ----------------- User Model -----------------
const userSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  mobileNumber: String,
  mobilePrefix: String,
  email: String,
  password: String,
  isActive: { type: Boolean, default: true },
  // add other fields if you have them
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ----------------- Routes -----------------

// Test route
app.get('/', (req, res) => res.send('Account Deactivation Backend is running'));

// Deactivate account route
app.post('/api/v1/user/delete-account-request', async (req, res) => {
  try {
    const { mobilePrefix, mobileNumber, email, confirm } = req.body;

    if (!mobileNumber) return res.status(400).json({ success: false, msg: 'Mobile number is required' });
    if (!confirm) return res.status(400).json({ success: false, msg: 'You must confirm deactivation' });

    const fullMobile = mobilePrefix ? `${mobilePrefix}${mobileNumber}` : mobileNumber;
    const user = await User.findOne({ mobileNumber: fullMobile });

    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    if (!user.isActive) return res.status(400).json({ success: false, msg: 'User already deactivated' });

    user.isActive = false; // deactivate account
    await user.save();

    return res.json({ success: true, msg: 'Your account has been deactivated. You cannot login anymore.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

// ----------------- Start Server -----------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
