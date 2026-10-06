import bcrypt from 'bcrypt';

const ROUNDS = 12;

//Function to hash password
const hashPassword = async (password) => {
  if (!password) {
    throw new Error('Password is missing');
  }
  const salt = await bcrypt.genSalt(ROUNDS);
  const hashed = await bcrypt.hash(password, salt);
  return hashed;
};

export default hashPassword;
