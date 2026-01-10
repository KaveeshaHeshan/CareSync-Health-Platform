# API Testing Guide

## 📡 Test All Endpoints

Open a new PowerShell terminal and run these commands to test the API:

---

## 1. Authentication Endpoints

### Register New User
```powershell
$body = @{
    name = "Test Patient"
    email = "newpatient@example.com"
    password = "password123"
    role = "PATIENT"
    phone = "555-0100"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body
```

### Login
```powershell
$body = @{
    email = "admin@caresync.com"
    password = "password123"
} | ConvertTo-Json

$response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $body

$response.Content
# Save the token from response for authenticated requests
```

---

## 2. Public Endpoints (No Auth Required)

### Get All Doctors
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/admin/doctors" | Select-Object -ExpandProperty Content
```

### Get Available Time Slots
```powershell
# Replace DOCTOR_ID with actual doctor ID from database
$doctorId = "YOUR_DOCTOR_ID_HERE"
$date = "2024-01-20"

Invoke-WebRequest -Uri "http://localhost:5000/api/appointments/slots/$doctorId?date=$date" | Select-Object -ExpandProperty Content
```

### Search Medical Services
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/lab/search?query=blood" | Select-Object -ExpandProperty Content
```

---

## 3. Protected Endpoints (Require Auth Token)

### Get Current User Profile
```powershell
$token = "YOUR_JWT_TOKEN_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" `
    -Headers $headers | Select-Object -ExpandProperty Content
```

### Book Appointment (Patient)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$body = @{
    doctorId = "DOCTOR_ID_HERE"
    date = "2024-01-20"
    time = "10:00"
    type = "in-person"
    reasonForVisit = "Regular checkup"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/appointments" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

### Get My Appointments (Patient)
```powershell
$token = "YOUR_JWT_TOKEN_HERE"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/appointments" `
    -Headers $headers | Select-Object -ExpandProperty Content
```

### Get Patient Lab Results
```powershell
$token = "PATIENT_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/lab/my-results" `
    -Headers $headers | Select-Object -ExpandProperty Content
```

### Get Patient Prescriptions
```powershell
$token = "PATIENT_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/pharmacy/prescriptions" `
    -Headers $headers | Select-Object -ExpandProperty Content
```

---

## 4. Doctor Endpoints

### Update Appointment Status (Doctor)
```powershell
$token = "DOCTOR_JWT_TOKEN"
$appointmentId = "APPOINTMENT_ID_HERE"
$body = @{
    status = "confirmed"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/appointments/$appointmentId/status" `
    -Method Patch `
    -Headers $headers `
    -Body $body
```

### Create Prescription (Doctor)
```powershell
$token = "DOCTOR_JWT_TOKEN"
$body = @{
    patientId = "PATIENT_ID_HERE"
    medications = @(
        @{
            name = "Amoxicillin"
            dosage = "500mg"
            frequency = "3 times daily"
            duration = "7 days"
            instructions = "Take with food"
        }
    )
    diagnosis = "Bacterial infection"
    instructions = "Complete full course"
} | ConvertTo-Json -Depth 3

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/pharmacy/prescriptions" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

### Set Doctor Availability
```powershell
$token = "DOCTOR_JWT_TOKEN"
$body = @{
    date = "2024-01-20"
    slots = @("09:00", "10:00", "11:00", "14:00", "15:00", "16:00")
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/appointments/doctor/slots" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

---

## 5. Admin Endpoints

### Get Platform Statistics
```powershell
$token = "ADMIN_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/admin/stats" `
    -Headers $headers | Select-Object -ExpandProperty Content
```

### Get All Users (with pagination)
```powershell
$token = "ADMIN_JWT_TOKEN"
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/admin/users?page=1&limit=10" `
    -Headers $headers | Select-Object -ExpandProperty Content
```

### Update User (Admin)
```powershell
$token = "ADMIN_JWT_TOKEN"
$userId = "USER_ID_HERE"
$body = @{
    name = "Updated Name"
    phone = "555-9999"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/admin/users/$userId" `
    -Method Patch `
    -Headers $headers `
    -Body $body
```

### Delete User (Admin)
```powershell
$token = "ADMIN_JWT_TOKEN"
$userId = "USER_ID_HERE"

$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/admin/users/$userId" `
    -Method Delete `
    -Headers $headers
```

---

## 6. Lab Technician Endpoints

### Upload Lab Result
```powershell
$token = "LAB_JWT_TOKEN"
$body = @{
    patientId = "PATIENT_ID_HERE"
    testName = "Complete Blood Count"
    testType = "Blood Test"
    result = "Normal"
    status = "completed"
    fileUrl = "https://example.com/report.pdf"
    notes = "All values within normal range"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/lab/upload" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

---

## 7. Payment Endpoints

### Create Stripe Checkout Session
```powershell
$token = "PATIENT_JWT_TOKEN"
$body = @{
    appointmentId = "APPOINTMENT_ID_HERE"
    amount = 5000  # $50.00 in cents
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/payments/create-checkout" `
    -Method Post `
    -Headers $headers `
    -Body $body
```

---

## 📝 Quick Test Workflow

### 1. Get Doctor List (No Auth)
```powershell
Invoke-WebRequest -Uri "http://localhost:5000/api/admin/doctors" | ConvertFrom-Json | Select-Object -ExpandProperty data
```

### 2. Login as Patient
```powershell
$loginBody = @{
    email = "john.doe@example.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
    -Method Post `
    -ContentType "application/json" `
    -Body $loginBody

$loginData = $loginResponse.Content | ConvertFrom-Json
$token = $loginData.data.token
Write-Host "Token: $token"
```

### 3. Book Appointment with Token
```powershell
# Use doctor ID from step 1
$bookingBody = @{
    doctorId = "COPY_DOCTOR_ID_HERE"
    date = "2024-01-25"
    time = "10:00"
    type = "in-person"
    reasonForVisit = "Testing API"
} | ConvertTo-Json

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/appointments" `
    -Method Post `
    -Headers $headers `
    -Body $bookingBody | ConvertFrom-Json
```

### 4. Verify Appointment Created
```powershell
$headers = @{
    "Authorization" = "Bearer $token"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/appointments" `
    -Headers $headers | ConvertFrom-Json | Select-Object -ExpandProperty data
```

---

## 🎯 Expected Response Formats

### Success Response
```json
{
  "success": true,
  "msg": "Operation successful",
  "data": { /* result data */ }
}
```

### Error Response
```json
{
  "success": false,
  "msg": "Error message",
  "error": "Detailed error information"
}
```

### List Response with Pagination
```json
{
  "success": true,
  "msg": "Users retrieved successfully",
  "count": 10,
  "data": [ /* array of items */ ]
}
```

---

## 🔍 Response Status Codes

- **200 OK**: Successful GET, PUT, PATCH
- **201 Created**: Successful POST (resource created)
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## 💡 Tips

1. **Save Tokens**: Store JWT tokens in variables for reuse
2. **Pretty Print JSON**: Use `| ConvertFrom-Json` to format responses
3. **Test Flow**: Always test complete user flows (register → login → action)
4. **Check Logs**: Monitor backend terminal for detailed error messages
5. **Use Postman**: Consider using Postman for easier API testing

---

## 🧪 Automated Test Script

Save this as `test-api.ps1`:

```powershell
# Test CareSync API
Write-Host "🧪 Testing CareSync API..." -ForegroundColor Cyan

# 1. Test server health
Write-Host "`n1️⃣ Testing server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/admin/doctors" -TimeoutSec 5
    Write-Host "✅ Server is running!" -ForegroundColor Green
} catch {
    Write-Host "❌ Server is not responding" -ForegroundColor Red
    exit
}

# 2. Test login
Write-Host "`n2️⃣ Testing login..." -ForegroundColor Yellow
$loginBody = @{
    email = "admin@caresync.com"
    password = "password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $loginBody
    $token = ($response.Content | ConvertFrom-Json).data.token
    Write-Host "✅ Login successful! Token: $($token.Substring(0,20))..." -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    exit
}

# 3. Test authenticated endpoint
Write-Host "`n3️⃣ Testing authenticated endpoint..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" -Headers $headers
    $user = ($response.Content | ConvertFrom-Json).data
    Write-Host "✅ Authenticated as: $($user.name) ($($user.role))" -ForegroundColor Green
} catch {
    Write-Host "❌ Authentication test failed" -ForegroundColor Red
}

Write-Host "`n✨ All tests completed!" -ForegroundColor Cyan
```

Run with: `powershell ./test-api.ps1`

---

**🎉 Happy Testing!**
