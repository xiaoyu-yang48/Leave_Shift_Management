# Employee Portal - Shift Management System

A comprehensive employee portal for managing work schedules, leave requests, overtime, and shift swaps.

## Features

### Employee Portal Features
- **Homepage**: View current schedule and upcoming shifts
- **Availability Management**: Set and update work availability
- **Leave Management**: 
  - View leave balance (Annual, Sick, Personal)
  - Submit leave requests with start/end dates and reasons
- **Overtime Management**:
  - Submit overtime requests with date, hours, and reason
  - View overtime request history
- **Shift Swap**: Request to swap shifts with other employees
- **Request Status**: Track all pending, approved, and rejected requests
- **Profile Management**: Update personal information

### Authentication
- User registration and login
- JWT-based authentication
- Protected routes for authenticated users

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Frontend
- **React.js** with functional components and hooks
- **React Router** for navigation
- **Axios** for API communication
- **Tailwind CSS** for styling

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Schedule Management
- `GET /api/schedule/me` - Get user's schedule
- `GET /api/schedule/availableswaps/me/:shiftId` - Get available shifts for swap
- `POST /api/schedule/swap` - Create shift swap request

### Availability
- `GET /api/availability/me` - Get user's availability
- `POST /api/availability` - Update availability

### Requests
- `GET /api/requests/me` - Get user's requests
- `POST /api/requests/leave` - Create leave request
- `POST /api/requests/overtime` - Create overtime request
- `PUT /api/requests/:type/:id/cancel` - Cancel request

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd employee-portal
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Environment Setup**
   Create a `.env` file in the backend directory:
   ```env
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   PORT=5001
   ```

5. **Start the application**
   
   **Backend:**
   ```bash
   cd backend
   npm start
   ```
   
   **Frontend:**
   ```bash
   cd frontend
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001

## Usage

### Employee Workflow
1. **Register/Login**: Create an account or log in to access the portal
2. **View Schedule**: Check your current work schedule on the homepage
3. **Set Availability**: Update your work availability preferences
4. **Request Leave**: Submit leave requests with dates and reasons
5. **Request Overtime**: Submit overtime requests for additional hours
6. **Swap Shifts**: Request to swap shifts with other employees
7. **Track Requests**: Monitor the status of all your requests

### Request Types
- **Leave Requests**: Annual, sick, and personal leave
- **Overtime Requests**: Additional work hours with reasons
- **Shift Swap Requests**: Exchange shifts with other employees

## Database Models

### User
- Basic user information (name, email, password)
- Authentication data

### Schedule
- Work schedule assignments
- Date and shift type (Morning/Afternoon)

### Availability
- User availability preferences
- Time slots and availability status

### Request
- All request types (Leave, Overtime, Shift Swap)
- Request status and details
- Timestamps for tracking

## Security Features
- Password hashing with bcrypt
- JWT token-based authentication
- Protected API endpoints
- Input validation and sanitization

## Contributing
This is an employee portal focused on shift management. The system is designed to be simple and user-friendly while providing comprehensive functionality for employee self-service.

## License
This project is for educational and demonstration purposes.
