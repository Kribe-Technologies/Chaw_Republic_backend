import { Schema, model } from 'mongoose';

const vendorSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { 
    type: String,
    required: true
  },
  phoneNumber: { type: String, unique: true, required: true },
  address: { type: String, required: true },
  businessType: { type: String, required: true },
  businessName: { type: String, unique: true, required: true },
  isVerified: { type: Boolean, default: false },
  token: { type: String, select: false },
  otp: String,
  otpExpires: Date,
  resetToken: String,
  resetTokenExpires: Date
},
{
  toJSON: {
    transform: function (doc, ret) {
      delete ret.password,
      delete ret.__v,
      delete ret.createdAt,
      delete ret.updatedAt,
      delete ret.otpExpires,
      delete ret.otp
    }
  },
  timestamps: true
});

const Vendor = model('Vendor', vendorSchema);

export default Vendor;