# ChatZone Pro - Real-time Chat Application

A feature-rich, modern chat application built with the MERN stack (MongoDB, Express, React, Node.js) with Socket.io for real-time communication.
 Actual Website Ckeck :- https://chatzone-frontend-1dwm.onrender.com
## 🚀 Features

### Authentication & Security
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ Password hashing with bcrypt
- ✅ Profile picture upload to Cloudinary
- ✅ User settings and preferences

### Chat Features
- ✅ One-to-one private messaging
- ✅ Real-time message delivery
- ✅ Typing indicators
- ✅ Message read receipts (double tick)
- ✅ Online/offline status
- ✅ Last seen timestamp
- ✅ Edit messages (within 24 hours)
- ✅ Delete messages for me
- ✅ Delete messages for everyone
- ✅ Reply to messages
- ✅ Message reactions with emojis
- ✅ Search messages
- ✅ Message history

### Media Sharing
- ✅ Send and receive images
- ✅ Send and receive files
- ✅ Voice messages support
- ✅ File preview

### Group Chat
- ✅ Create groups
- ✅ Add/remove members
- ✅ Group admin controls
- ✅ Group icon and description
- ✅ Group member management

### Call Features
- ✅ Audio call with WebRTC
- ✅ Video call with WebRTC
- ✅ Call history

### User Experience
- ✅ Dark/light mode toggle
- ✅ Search users
- ✅ Block/unblock users
- ✅ User profile management
- ✅ Notification system
- ✅ Push notifications with Firebase
- ✅ Responsive mobile UI
- ✅ Chat list sorting
- ✅ Archive chats
- ✅ Mute notifications

### Admin Panel
- ✅ View all users
- ✅ Ban/unban users
- ✅ Monitor and resolve reports
- ✅ Dashboard with statistics
- ✅ User management

## 📋 Prerequisites

Before you begin, ensure you have the following:

- Node.js (v16.0.0 or higher)
- npm (v8.0.0 or higher)
- MongoDB Atlas account
- Cloudinary account (for file uploads)
- Firebase account (for push notifications)

## 🛠️ Installation & Setup

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy the .env.example to .env
   cp .env .env
   
   # Edit .env with your credentials
   ```

   Required environment variables:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - Secret key for JWT tokens
   - `CLOUDINARY_CLOUD_NAME` - Cloudinary cloud name
   - `CLOUDINARY_API_KEY` - Cloudinary API key
   - `CLOUDINARY_API_SECRET` - Cloudinary API secret
   - `FIREBASE_PROJECT_ID` - Firebase project ID
   - `FIREBASE_PRIVATE_KEY` - Firebase private key
   - `FIREBASE_CLIENT_EMAIL` - Firebase client email
   - `PORT` - Server port (default: 5000)
   - `CLIENT_URL` - Frontend URL (default: http://localhost:3000)

4. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   The server should be running at `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   ```bash
   # Copy to .env file
   cp .env .env
   ```

   Required environment variables:
   - `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)
   - `REACT_APP_SOCKET_URL` - WebSocket URL (default: http://localhost:5000)
   - `REACT_APP_FIREBASE_API_KEY` - Firebase API key
   - `REACT_APP_FIREBASE_PROJECT_ID` - Firebase project ID

4. **Start the React development server:**
   ```bash
   npm start
   ```

   The application should open at `http://localhost:3000`

## 📚 Project Structure

```
chatzone-pro/
├── backend/
│   ├── config/          # Configuration files
│   │   ├── db.js        # Database connection
│   │   └── cloudinary.js # Cloudinary setup
│   ├── controllers/      # Route controllers
│   │   ├── authController.js
│   │   ├── chatController.js
│   │   ├── messageController.js
│   │   ├── userController.js
│   │   └── adminController.js
│   ├── models/          # MongoDB schemas
│   │   ├── User.js
│   │   ├── Chat.js
│   │   ├── Message.js
│   │   ├── Call.js
│   │   ├── Notification.js
│   │   └── Report.js
│   ├── routes/          # API routes
│   │   ├── authRoutes.js
│   │   ├── chatRoutes.js
│   │   ├── messageRoutes.js
│   │   ├── userRoutes.js
│   │   └── adminRoutes.js
│   ├── middleware/      # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   ├── socket/          # Socket.io handlers
│   │   └── socket.js
│   ├── utils/           # Utility functions
│   │   ├── helpers.js
│   │   ├── cloudinaryUpload.js
│   │   └── fcmNotification.js
│   ├── server.js        # Express server entry point
│   ├── .env             # Environment variables
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html   # HTML template
│   ├── src/
│   │   ├── components/  # React components
│   │   │   ├── ChatList.js
│   │   │   ├── ChatWindow.js
│   │   │   ├── MessageList.js
│   │   │   ├── MessageInput.js
│   │   │   ├── Navbar.js
│   │   │   ├── UserSearchModal.js
│   │   │   ├── SettingsModal.js
│   │   │   └── *.css    # Component styles
│   │   ├── pages/       # Page components
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── ChatPage.js
│   │   │   └── *.css    # Page styles
│   │   ├── context/     # React context
│   │   │   ├── AuthContext.js
│   │   │   ├── ChatContext.js
│   │   │   └── ThemeContext.js
│   │   ├── hooks/       # Custom hooks
│   │   │   └── useCustomHooks.js
│   │   ├── services/    # API and Socket services
│   │   │   ├── apiService.js
│   │   │   └── socketService.js
│   │   ├── utils/       # Utility functions
│   │   │   └── helpers.js
│   │   ├── styles/      # Global styles
│   │   │   └── index.css
│   │   ├── App.js       # Main App component
│   │   └── index.js     # React entry point
│   ├── .env             # Environment variables
│   ├── package.json
│   └── public/
│       └── index.html
│
└── README.md            # This file
```

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/settings` - Update settings
- `POST /api/auth/fcm-token` - Update FCM token

### Chats
- `POST /api/chats/private` - Create private chat
- `POST /api/chats/group` - Create group chat
- `GET /api/chats` - Get user chats
- `GET /api/chats/:chatId` - Get specific chat
- `PUT /api/chats/:chatId` - Update group chat
- `POST /api/chats/:chatId/add-member` - Add group member
- `DELETE /api/chats/:chatId/remove-member/:memberId` - Remove member
- `POST /api/chats/:chatId/archive` - Archive chat
- `DELETE /api/chats/:chatId` - Delete chat

### Messages
- `POST /api/messages` - Send message
- `GET /api/messages/:chatId` - Get messages
- `PUT /api/messages/:messageId` - Edit message
- `DELETE /api/messages/:messageId` - Delete for me
- `DELETE /api/messages/:messageId/everyone` - Delete for everyone
- `PUT /api/messages/:messageId/reaction` - Add reaction
- `PUT /api/messages/:messageId/seen` - Mark as seen
- `GET /api/messages/search` - Search messages

### Users
- `GET /api/users/search` - Search users
- `GET /api/users` - Get all users
- `GET /api/users/:userId` - Get user profile
- `GET /api/users/:userId/status` - Get user status
- `POST /api/users/:userId/block` - Block user
- `POST /api/users/:userId/unblock` - Unblock user

### Admin
- `GET /api/admin/users` - Get all users (admin)
- `PUT /api/admin/users/:userId/ban` - Ban user
- `PUT /api/admin/users/:userId/unban` - Unban user
- `GET /api/admin/reports` - Get reports
- `PUT /api/admin/reports/:reportId` - Update report
- `GET /api/admin/dashboard/stats` - Dashboard stats

## 🎨 Styling & Theme

The application includes:
- **Light Mode** - Default clean white theme
- **Dark Mode** - Eye-friendly dark theme with toggle
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Tailwind CSS** - Utility-first CSS framework
- **Custom CSS** - Component-specific styling

To switch themes, use the moon/sun icon in the navbar or set it in preferences.

## 🔐 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- CORS protection
- Input validation
- SQL injection prevention (MongoDB)
- XSS protection
- HTTPS ready
- Rate limiting (can be added)

## 📝 Database Models

### User
- Profile information (username, email, bio)
- Authentication data (password hash)
- Profile picture URL
- Online status and last seen
- Blocked users list
- Settings (dark mode, notifications, sound)
- Role (user/admin)
- Ban status

### Chat
- Participants list
- Chat type (private/group)
- Group specific fields (name, icon, admin)
- Last message
- Pinned messages
- Muted and archived status

### Message
- Text content
- Media information (images, files, voice)
- Sender and chat reference
- Delivery status (sent, delivered, seen)
- Reactions with emojis
- Reply to another message
- Edit history
- Soft deletion

### Notification
- Recipient
- Type (message, call, friend request, etc.)
- Related entities
- Read status

### Report
- Reporter and reported user/message
- Report reason and description
- Status and resolution

### Call
- Caller and receiver
- Call type (audio/video)
- Call status
- Duration and timestamps

## 🚀 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Create an account on your chosen platform
2. Push code to GitHub
3. Connect repository
4. Set environment variables
5. Deploy

### Frontend Deployment (Vercel/Netlify)

1. Create account on Vercel or Netlify
2. Push code to GitHub
3. Connect repository
4. Set environment variables
5. Deploy

## 📦 Technologies Used

**Backend:**
- Node.js & Express
- MongoDB & Mongoose
- Socket.io (real-time)
- JWT & bcrypt (security)
- Cloudinary (file uploads)
- Firebase (push notifications)

**Frontend:**
- React.js
- React Router
- Socket.io Client
- CSS3 & Responsive Design
- Context API (state management)

## 🐛 Known Issues & TODO

- [ ] Message encryption
- [ ] User typing status optimization
- [ ] Rate limiting API
- [ ] Email verification
- [ ] Password reset functionality
- [ ] Two-factor authentication
- [ ] Message search optimization
- [ ] Call recording
- [ ] Android/iOS app versions

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support, email support@chatzonepro.com or create an issue in the repository.

## 👨‍💻 Authors

Created with ❤️ by the ChatZone Pro team

---

**Happy Chatting! 💬**
