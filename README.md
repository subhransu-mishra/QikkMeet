# Video+Chat 🎥💬

A modern, real-time video calling and messaging application built with React and Node.js, powered by Stream.io SDKs for seamless communication experiences.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Key Features Explained](#key-features-explained)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## 🎯 Overview

Video+Chat is a full-stack real-time communication platform that enables users to:
- Send and receive instant messages
- Make video calls with friends
- Connect with other users through a friend system
- Stay protected with built-in fraud detection

The application uses **Stream.io** for real-time chat and video capabilities, ensuring low-latency, scalable communication infrastructure.

## ✨ Features

### Core Features
- 🔐 **User Authentication** - Secure signup/login with JWT tokens
- 👥 **Friend System** - Send friend requests, accept/decline, and manage connections
- 💬 **Real-Time Messaging** - Instant messaging with Stream Chat SDK
- 🎥 **Video Calls** - High-quality video calls powered by Stream Video SDK
- 📞 **Call History** - View and manage your call history
- 🔔 **Notifications** - Real-time notifications for friend requests and messages
- 🛡️ **Fraud Detection** - Automatic detection of suspicious messages before sending
- 📱 **Responsive Design** - Beautiful dark-themed UI that works on all devices
- 🎨 **Modern UI** - Built with Tailwind CSS and Framer Motion animations

### Security Features
- **Message Validation** - Pre-send fraud detection to prevent scams
- **Rate Limiting** - API rate limiting to prevent abuse
- **JWT Authentication** - Secure token-based authentication
- **Input Sanitization** - Protection against malicious content

## 🛠️ Technology Stack

### Frontend
- **React 19** - UI library
- **Vite** - Build tool and dev server
- **React Router DOM** - Client-side routing
- **Stream Chat React SDK** - Real-time chat functionality
- **Stream Video React SDK** - Video calling functionality
- **TanStack Query (React Query)** - Data fetching and caching
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Hot Toast** - Toast notifications
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database (via Mongoose)
- **Stream.io Node SDK** - Backend Stream integration
- **JWT** - Authentication tokens
- **Bcrypt** - Password hashing
- **Bull** - Job queue (for background tasks)
- **Redis** - Queue backend (optional, uses in-memory queue by default)
- **Express Rate Limit** - Rate limiting middleware
- **Cookie Parser** - Cookie handling
- **CORS** - Cross-origin resource sharing

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **MongoDB** (local installation or MongoDB Atlas account)
- **Stream.io Account** - Sign up at [getstream.io](https://getstream.io) to get API keys
- **Git** (for cloning the repository)

### Optional
- **Redis** (for production job queue - optional, uses in-memory queue by default)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone "https://github.com/subhransu-mishra/QikkMeet"
cd Video+Chat
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Server Configuration
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/video-chat
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/video-chat

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Stream.io Credentials (get from https://dashboard.getstream.io/)
STREAM_API_KEY=your-stream-api-key
STREAM_API_SECRET=your-stream-api-secret

# Redis (Optional - for production job queue)
# REDIS_URL=redis://localhost:6379
```

### Frontend Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# Stream.io API Key (same as backend)
VITE_STREAM_API_KEY=your-stream-api-key

# Backend API URL (optional, defaults to http://localhost:5001/api in dev)
VITE_API_BASE=http://localhost:5001/api
```

### Getting Stream.io Credentials

1. Sign up at [getstream.io](https://getstream.io)
2. Create a new application
3. Navigate to the dashboard and copy:
   - **API Key** (for both frontend and backend)
   - **API Secret** (backend only)

## 🏃 Running the Application

### Development Mode

#### 1. Start MongoDB

If using local MongoDB:
```bash
mongod
```

Or ensure your MongoDB Atlas connection string is correct in `.env`.

#### 2. Start Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5001`

#### 3. Start Frontend Development Server

Open a new terminal:
```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:5173`

### Production Build

#### Build Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with production-ready files.

#### Start Production Server

The backend automatically serves the frontend build:

```bash
cd backend
npm start
```

The application will be available at `http://localhost:5001`

## 📁 Project Structure

```
Video+Chat/
├── backend/
│   ├── src/
│   │   ├── controllers/      # Request handlers
│   │   │   ├── authController.js
│   │   │   ├── chatController.js
│   │   │   ├── callController.js
│   │   │   ├── userController.js
│   │   │   └── fraudDetection.controller.js
│   │   ├── models/          # MongoDB schemas
│   │   │   ├── User.js
│   │   │   └── FriendRequest.js
│   │   ├── routes/          # API routes
│   │   │   ├── authRoute.js
│   │   │   ├── chatRoute.js
│   │   │   ├── callRoute.js
│   │   │   ├── userRoute.js
│   │   │   └── fraudDetection.routes.js
│   │   ├── services/        # Business logic
│   │   │   ├── fraudDetection.service.js
│   │   │   └── moderation.service.js
│   │   ├── middlewares/     # Express middlewares
│   │   │   └── authMiddleware.js
│   │   ├── lib/             # Utilities
│   │   │   ├── db.js
│   │   │   ├── stream.js
│   │   │   └── queue.js
│   │   ├── workers/         # Background workers
│   │   │   └── moderation.worker.js
│   │   └── server.js        # Entry point
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── chat/        # Chat-related components
│   │   │   ├── layouts/     # Layout components
│   │   │   └── ui/          # Reusable UI components
│   │   ├── pages/           # Page components
│   │   │   ├── HomePage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── CallPage.jsx
│   │   │   ├── Chats.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   └── SignUpPage.jsx
│   │   ├── hooks/           # Custom React hooks
│   │   │   └── useAuth.js
│   │   ├── lib/             # Utilities
│   │   │   ├── axios.js
│   │   │   ├── streamChat.js
│   │   │   └── streamVideo.js
│   │   ├── App.jsx          # Main app component
│   │   ├── main.jsx         # Entry point
│   │   └── index.css        # Global styles
│   └── package.json
│
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users` - Get recommended users
- `GET /api/users/friends` - Get user's friends
- `GET /api/users/me` - Get current user profile
- `POST /api/users/friend-request/:userId` - Send friend request
- `POST /api/users/friend-request/:requestId/accept` - Accept friend request
- `POST /api/users/friend-request/:requestId/reject` - Reject friend request
- `GET /api/users/outgoing-friend-requests` - Get outgoing requests
- `GET /api/users/incoming-friend-requests` - Get incoming requests

### Chat
- `GET /api/chats/token` - Get Stream Chat token

### Calls
- `GET /api/calls/:callId/token` - Get Stream Video call token

### Fraud Detection
- `POST /api/fraud-detection/validate-message` - Validate message for suspicious content

## 🎓 Key Features Explained

### Real-Time Messaging
The application uses **Stream Chat SDK** to provide real-time messaging capabilities. Messages are delivered instantly and synced across all devices.

### Video Calls
**Stream Video SDK** powers the video calling feature. Users can:
- Start calls from chat pages
- Share call links with friends
- View call history
- See call duration and participant information

### Fraud Detection
The application includes a built-in fraud detection system that:
- Scans messages before sending for suspicious keywords
- Detects common scam patterns (lottery, payment requests, etc.)
- Warns users about potentially misleading content
- Uses a fast, optimized API endpoint with caching

### Friend System
Users can:
- Discover recommended users
- Send friend requests
- Accept or reject incoming requests
- View their friend list
- Start chats with friends

### Authentication Flow
1. User signs up or logs in
2. JWT token is generated and stored
3. User completes onboarding (if new)
4. User gains access to protected routes

## 🐛 Troubleshooting

### Common Issues

#### Backend won't start
- **Check MongoDB connection**: Ensure MongoDB is running or your Atlas connection string is correct
- **Verify environment variables**: Ensure all required `.env` variables are set
- **Check port availability**: Ensure port 5001 is not in use

#### Frontend won't connect to backend
- **Check CORS settings**: Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- **Verify API base URL**: Check `VITE_API_BASE` in frontend `.env`
- **Check backend is running**: Ensure backend server is started before frontend

#### Stream.io errors
- **Verify API keys**: Ensure `STREAM_API_KEY` and `STREAM_API_SECRET` are correct
- **Check Stream dashboard**: Verify your Stream.io application is active
- **Review Stream documentation**: Check [Stream.io docs](https://getstream.io/docs/) for SDK-specific issues

#### Messages not appearing
- **Check Stream Chat connection**: Verify user is connected to Stream Chat
- **Check channel state**: Ensure channel is properly watched
- **Review browser console**: Check for any JavaScript errors

#### Video calls not working
- **Check permissions**: Ensure camera/microphone permissions are granted
- **Verify call token**: Check that call token endpoint is working
- **Check browser compatibility**: Ensure browser supports WebRTC

### Debug Mode

Enable verbose logging by setting:
```env
NODE_ENV=development
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint for code linting
- Follow React best practices
- Write meaningful commit messages
- Add comments for complex logic




## 📞 Support

For issues, questions, or contributions, please open an issue on the repository.

---

**Built with ❤️ using React, Node.js, and Stream.io**

