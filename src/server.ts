import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import bookingRoutes from './routes/bookingRoutes';
import { AuthService } from './services/authService'; // Import AuthService

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/bookings', bookingRoutes);

// Basic health check route
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Start Server Function
const startServer = async () => {
  try {
    // --- THIS IS THE CRITICAL PART FOR ADMIN LOGIN ---
    // Initialize admin user on startup
    const authService = new AuthService();
    await authService.createAdminUser(); 
    console.log('🔒 Admin user check/creation completed');
    // -------------------------------------------------

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();