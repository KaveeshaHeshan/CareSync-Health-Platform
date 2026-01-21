/**
 * Socket.IO Service
 * Handles real-time communication for chat, notifications, and live updates
 */

const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

let io = null;
const connectedUsers = new Map(); // userId -> socketId mapping

/**
 * Initialize Socket.IO server
 * @param {object} server - HTTP server instance
 * @returns {object} - Socket.IO instance
 */
const initializeSocket = (server) => {
  io = socketIO(server, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id).select('-password');
      
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.userId} (${socket.user.name})`);
    
    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    
    // Notify user is online
    socket.broadcast.emit('user:online', {
      userId: socket.userId,
      name: socket.user.name,
      role: socket.user.role,
    });

    // Join user's personal room
    socket.join(`user:${socket.userId}`);
    
    // Join role-based room
    socket.join(`role:${socket.user.role}`);

    // Handle user joining a consultation room
    socket.on('consultation:join', (data) => {
      const { consultationId } = data;
      socket.join(`consultation:${consultationId}`);
      
      socket.to(`consultation:${consultationId}`).emit('consultation:user-joined', {
        userId: socket.userId,
        name: socket.user.name,
        role: socket.user.role,
      });
      
      console.log(`User ${socket.userId} joined consultation ${consultationId}`);
    });

    // Handle user leaving a consultation room
    socket.on('consultation:leave', (data) => {
      const { consultationId } = data;
      socket.leave(`consultation:${consultationId}`);
      
      socket.to(`consultation:${consultationId}`).emit('consultation:user-left', {
        userId: socket.userId,
        name: socket.user.name,
      });
      
      console.log(`User ${socket.userId} left consultation ${consultationId}`);
    });

    // Handle chat messages in consultation
    socket.on('consultation:message', (data) => {
      const { consultationId, message } = data;
      
      const chatMessage = {
        consultationId,
        senderId: socket.userId,
        senderName: socket.user.name,
        senderRole: socket.user.role,
        message,
        timestamp: new Date(),
      };
      
      // Broadcast to all users in the consultation room
      io.to(`consultation:${consultationId}`).emit('consultation:message', chatMessage);
    });

    // Handle typing indicator
    socket.on('consultation:typing', (data) => {
      const { consultationId, isTyping } = data;
      
      socket.to(`consultation:${consultationId}`).emit('consultation:typing', {
        userId: socket.userId,
        name: socket.user.name,
        isTyping,
      });
    });

    // Handle video call signals (for WebRTC)
    socket.on('call:offer', (data) => {
      const { consultationId, targetUserId, offer } = data;
      
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call:offer', {
          from: socket.userId,
          fromName: socket.user.name,
          consultationId,
          offer,
        });
      }
    });

    socket.on('call:answer', (data) => {
      const { consultationId, targetUserId, answer } = data;
      
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call:answer', {
          from: socket.userId,
          fromName: socket.user.name,
          consultationId,
          answer,
        });
      }
    });

    socket.on('call:ice-candidate', (data) => {
      const { targetUserId, candidate } = data;
      
      const targetSocketId = connectedUsers.get(targetUserId);
      if (targetSocketId) {
        io.to(targetSocketId).emit('call:ice-candidate', {
          from: socket.userId,
          candidate,
        });
      }
    });

    // Handle appointment updates
    socket.on('appointment:subscribe', (data) => {
      const { appointmentId } = data;
      socket.join(`appointment:${appointmentId}`);
      console.log(`User ${socket.userId} subscribed to appointment ${appointmentId}`);
    });

    socket.on('appointment:unsubscribe', (data) => {
      const { appointmentId } = data;
      socket.leave(`appointment:${appointmentId}`);
      console.log(`User ${socket.userId} unsubscribed from appointment ${appointmentId}`);
    });

    // Handle notification read status
    socket.on('notification:read', (data) => {
      const { notificationId } = data;
      
      // You can emit back confirmation or handle in database
      socket.emit('notification:read-confirmed', { notificationId });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.userId} (${socket.user.name})`);
      
      // Remove from connected users
      connectedUsers.delete(socket.userId);
      
      // Notify others user is offline
      socket.broadcast.emit('user:offline', {
        userId: socket.userId,
        name: socket.user.name,
      });
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  console.log('✅ Socket.IO server initialized');
  return io;
};

/**
 * Get Socket.IO instance
 * @returns {object} - Socket.IO instance
 */
const getIO = () => {
  if (!io) {
    throw new Error('Socket.IO not initialized');
  }
  return io;
};

/**
 * Send notification to specific user
 * @param {string} userId - User ID
 * @param {object} notification - Notification data
 */
const sendNotificationToUser = (userId, notification) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('notification:new', notification);
};

/**
 * Send notification to all users with specific role
 * @param {string} role - User role (PATIENT, DOCTOR, ADMIN)
 * @param {object} notification - Notification data
 */
const sendNotificationToRole = (role, notification) => {
  if (!io) return;
  
  io.to(`role:${role}`).emit('notification:new', notification);
};

/**
 * Broadcast notification to all connected users
 * @param {object} notification - Notification data
 */
const broadcastNotification = (notification) => {
  if (!io) return;
  
  io.emit('notification:new', notification);
};

/**
 * Send appointment update to involved users
 * @param {string} appointmentId - Appointment ID
 * @param {object} update - Update data
 */
const sendAppointmentUpdate = (appointmentId, update) => {
  if (!io) return;
  
  io.to(`appointment:${appointmentId}`).emit('appointment:updated', {
    appointmentId,
    ...update,
  });
};

/**
 * Send consultation update
 * @param {string} consultationId - Consultation ID
 * @param {object} update - Update data
 */
const sendConsultationUpdate = (consultationId, update) => {
  if (!io) return;
  
  io.to(`consultation:${consultationId}`).emit('consultation:updated', {
    consultationId,
    ...update,
  });
};

/**
 * Notify user about new message
 * @param {string} userId - User ID
 * @param {object} message - Message data
 */
const sendMessageNotification = (userId, message) => {
  if (!io) return;
  
  io.to(`user:${userId}`).emit('message:new', message);
};

/**
 * Get online users count
 * @returns {number} - Number of connected users
 */
const getOnlineUsersCount = () => {
  return connectedUsers.size;
};

/**
 * Check if user is online
 * @param {string} userId - User ID
 * @returns {boolean} - Online status
 */
const isUserOnline = (userId) => {
  return connectedUsers.has(userId);
};

/**
 * Get all online users
 * @returns {Array} - Array of online user IDs
 */
const getOnlineUsers = () => {
  return Array.from(connectedUsers.keys());
};

/**
 * Disconnect a specific user
 * @param {string} userId - User ID
 */
const disconnectUser = (userId) => {
  if (!io) return;
  
  const socketId = connectedUsers.get(userId);
  if (socketId) {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
    }
  }
};

/**
 * Send system announcement
 * @param {object} announcement - Announcement data
 */
const sendSystemAnnouncement = (announcement) => {
  if (!io) return;
  
  io.emit('system:announcement', {
    ...announcement,
    timestamp: new Date(),
  });
};

module.exports = {
  initializeSocket,
  getIO,
  sendNotificationToUser,
  sendNotificationToRole,
  broadcastNotification,
  sendAppointmentUpdate,
  sendConsultationUpdate,
  sendMessageNotification,
  getOnlineUsersCount,
  isUserOnline,
  getOnlineUsers,
  disconnectUser,
  sendSystemAnnouncement,
};