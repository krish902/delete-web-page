const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));


const userSchema = new mongoose.Schema({
  firstName: String,
  middleName: String,
  lastName: String,
  mobileNumber: String,
  mobilePrefix: String,
  email: String,
  password: String,
  isActive: { type: Boolean, default: true },
  isDelete: { type: Boolean, default: false },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

app.use(express.static('public'));

app.post('/api/v1/user/delete-account-request', async (req, res) => {
  try {
    const { mobilePrefix, mobileNumber, email, confirm } = req.body;

    if (!mobileNumber) return res.status(400).json({ success: false, msg: 'Mobile number is required' });
    if (!confirm) return res.status(400).json({ success: false, msg: 'You must confirm deactivation' });

    const fullMobile = mobilePrefix ? `${mobilePrefix}${mobileNumber}` : mobileNumber;
    const user = await User.findOne({ mobileNumber: fullMobile });

    if (!user) return res.status(404).json({ success: false, msg: 'User not found' });

    if (!user.isActive && user.isDelete)
      return res.status(400).json({ success: false, msg: 'User already deactivated & deleted' });

    user.isActive = false;
    user.isDelete = true;
    await user.save();

    return res.json({ success: true, msg: 'Your account has been deactivated. You cannot login anymore.' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, msg: 'Server error', error: err.message });
  }
});

module.exports = app;
