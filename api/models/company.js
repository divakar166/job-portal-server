const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

// Define the Company schema
const CompanySchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  website: { type: String },
  description: { type: String },
  registration_date: { type: Date, default: Date.now },
  job_opportunities_posted: { type: Number, default: 0 },
  candidates_hired: { type: Number, default: 0 },
});

// Pre-save middleware to hash the password before saving it
CompanySchema.pre('save', async function (next) {
  if (this.isModified('password') || this.isNew) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    } catch (err) {
      return next(err);
    }
  }
  next();
});

// Method to compare given password with the hashed password in the database
CompanySchema.methods.verifyPassword = async function (plainPassword) {
  return await bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model('Company', CompanySchema);
