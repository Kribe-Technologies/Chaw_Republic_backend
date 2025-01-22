import bcrypt from 'bcrypt';

export const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10)
};

export const comparePassword = async(password, userPassword) => {
  return await bcrypt.compare(password, userPassword)
};

export const hashToken = async (token) => {
  return await bcrypt.hash(token, 5);
}

export const compareToken = async (token, hashedToken) => {
  return await bcrypt.compare(token, hashedToken);
}