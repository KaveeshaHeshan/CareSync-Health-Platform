# 🔧 Troubleshooting Guide

## Common Issues & Solutions

### 1. Backend Won't Start

**Symptom:** Backend crashes or won't connect to MongoDB

**Solutions:**
```bash
# Check if MongoDB connection string is correct in .env
# Make sure MONGO_URI is set properly

# Verify all dependencies are installed
cd backend
npm install

# Check for port conflicts
# If port 5000 is in use, change PORT in .env

# View detailed error logs
npm run dev
```

### 2. Frontend Can't Connect to Backend

**Symptom:** API calls fail with network errors

**Solutions:**
```bash
# Verify backend is running on port 5000
# Check frontend .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env

# Clear browser cache and restart frontend
cd frontend
rm -rf node_modules/.vite
npm run dev

# Check CORS settings in backend/server.js
```

### 3. Authentication Issues

**Symptom:** "Unauthorized" or "Invalid token" errors

**Solutions:**
```javascript
// Clear localStorage
localStorage.clear()

// Re-login to get new token
// Check JWT_SECRET matches in .env

// Verify authMiddleware is working
// Check browser Network tab for Authorization header
```

### 4. Appointment Booking Fails

**Symptom:** Can't select time slots or booking errors

**Solutions:**
```bash
# Make sure doctors exist in database
cd backend
npm run seed

# Check if doctor IDs match in database
# Verify specialty field is set for doctors

# Test API endpoint directly
curl http://localhost:5000/api/admin/doctors
```

### 5. Database Seeding Errors

**Symptom:** `npm run seed` fails

**Solutions:**
```bash
# Make sure MongoDB is connected
# Check MONGO_URI in backend/.env

# Drop existing collections if needed
# Then re-run seed script
npm run seed

# If duplicate key errors, clear database first
```

### 6. Stripe Payment Issues

**Symptom:** Checkout fails or payment errors

**Solutions:**
```bash
# Verify Stripe keys in backend/.env
STRIPE_SECRET_KEY=sk_test_your_key

# Use Stripe test card: 4242 4242 4242 4242
# Any future expiry date
# Any 3-digit CVC

# Check Stripe webhook configuration
```

### 7. Frontend Build Errors

**Symptom:** `npm run build` fails

**Solutions:**
```bash
# Clear node_modules and reinstall
cd frontend
rm -rf node_modules
npm install

# Check for syntax errors in components
# Run lint to find issues
npm run lint

# Update Node.js version if needed (v18+)
```

### 8. Slow API Responses

**Symptom:** Long loading times

**Solutions:**
```javascript
// Add indexes to MongoDB collections
// In models, add indexes on frequently queried fields

// Example in User model:
schema.index({ email: 1 });
schema.index({ role: 1 });

// Check MongoDB Atlas performance metrics
// Consider upgrading cluster tier
```

---

## Quick Diagnostics

### Check All Services Status

```bash
# Backend status
curl http://localhost:5000/api/auth/me

# Database connection
# Look for "✅ MongoDB Connected" in backend terminal

# Frontend status
# Open http://localhost:5174 in browser

# Check browser console for errors (F12)
```

### Test Authentication Flow

```bash
# Register new user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "PATIENT"
  }'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Test Appointment Booking

```bash
# Get available doctors
curl http://localhost:5000/api/admin/doctors

# Get available slots (replace DOCTOR_ID)
curl http://localhost:5000/api/appointments/slots/DOCTOR_ID?date=2024-01-15

# Book appointment (requires auth token)
curl -X POST http://localhost:5000/api/appointments \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "doctorId": "DOCTOR_ID",
    "date": "2024-01-15",
    "time": "10:00",
    "reasonForVisit": "Test booking"
  }'
```

---

## Environment Variables Checklist

### Backend (.env)
```env
✅ PORT=5000
✅ MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/caresync
✅ JWT_SECRET=your_secret_key_here
✅ STRIPE_SECRET_KEY=sk_test_your_stripe_key
✅ CLIENT_URL=http://localhost:3000
```

### Frontend (.env)
```env
✅ VITE_API_URL=http://localhost:5000/api
```

---

## Performance Optimization Tips

1. **Database Indexing**
   - Add indexes on frequently queried fields
   - Use compound indexes for multi-field queries

2. **API Response Caching**
   - Cache static data (doctors list, specialties)
   - Use Redis for session management

3. **Frontend Optimization**
   - Lazy load components with React.lazy()
   - Use React.memo for expensive components
   - Implement virtual scrolling for long lists

4. **Image Optimization**
   - Compress images before upload
   - Use CDN for static assets
   - Implement lazy loading for images

---

## Security Checklist

- [x] JWT tokens expire after 24 hours
- [x] Passwords hashed with bcrypt
- [x] CORS configured properly
- [x] Helmet security headers enabled
- [x] Input validation on all forms
- [x] SQL injection prevention (Mongoose)
- [x] XSS protection
- [ ] Rate limiting (TODO)
- [ ] HTTPS in production (TODO)
- [ ] Environment variables secured (TODO)

---

## Getting Help

1. **Check Logs**
   - Backend terminal for API errors
   - Browser console for frontend errors
   - MongoDB Atlas logs for database issues

2. **Debug Mode**
   ```javascript
   // Add console logs in API calls
   console.log('Request:', config);
   console.log('Response:', response.data);
   ```

3. **Common Error Codes**
   - 400: Bad Request (check request body)
   - 401: Unauthorized (check auth token)
   - 403: Forbidden (check user role)
   - 404: Not Found (check URL/ID)
   - 500: Server Error (check backend logs)

4. **Resources**
   - [Express.js Docs](https://expressjs.com/)
   - [React Docs](https://react.dev/)
   - [MongoDB Docs](https://docs.mongodb.com/)
   - [Stripe API](https://stripe.com/docs/api)

---

**Remember:** Most issues are resolved by:
1. Restarting both servers
2. Clearing browser cache/localStorage
3. Re-running database seed
4. Checking .env files
5. Verifying MongoDB connection
