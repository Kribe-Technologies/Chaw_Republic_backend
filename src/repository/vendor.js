import Vendor from "../models/vendor.js";
import { hashPassword } from "../utils/hash.js";
import { generateToken } from "../utils/jwt.js";
import crypto from 'crypto';

export class VendorRepository {
  static async createVendor(values) {
    const hash = values.password ? await hashPassword(values.password) : undefined;
  
     // Generate a new OTP
      const otp = Array(6).fill(0).map(() => Math.floor(Math.random() * 10)).join("");
    
      const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // New expiration time: 10 minutes
  
    const newToken = await generateToken(values.email);
  
    const vendorData = {
      name: values.name,
      email: values.email,
      phoneNumber: values.phoneNumber,
      password: hash,
      token: newToken,
      otp: hashedOTP,
      otpExpires: expiry,
      address: values.address,
      businessName: values.businessName,
      businessType: values.businessType
    };
    const vendor = await new Vendor(vendorData).save();
    return { vendor, otp };
    
  }  

  static async getVendorByEmail (email) {
    return await Vendor.findOne({ email });
  }

  static async getVendorById (id) {
    return await Vendor.findById(id);
  }

  static async getVendorByToken (token) {
    return await Vendor.findOne({ token })
  };

  static async getVendorByResetToken (token) {
    return await Vendor.findById({ ResetToken: token });
  };

  static async updateVendorPassword (id, password) {
    const hash = await hashPassword(password);

    const vendor = await Vendor.updateOne({
      _id: id
    }, {
      $set: {
        password: hash
      }
    });

    return vendor;
  };
}