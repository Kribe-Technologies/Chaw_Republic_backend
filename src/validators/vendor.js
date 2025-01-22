import Joi from "joi";

export const registerVendor = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).message('Password must be at least 6 characters').required(),
  phoneNumber: Joi.string().required(),
  address: Joi.string().required(),
  businessName: Joi.string().required(),
  businessType: Joi.string().required(),
});