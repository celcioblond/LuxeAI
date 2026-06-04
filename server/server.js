import { connectDB } from './config/db.js';
import app from './app.js';

const PORT = process.env.PORT;

await connectDB();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
