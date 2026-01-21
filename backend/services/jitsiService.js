/**
 * Jitsi Meet Integration Service
 * Provides video conferencing capabilities using Jitsi Meet API
 */

const crypto = require('crypto');

// Helper function to generate UUID
const generateUUID = () => {
  return crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex');
};
const crypto = require('crypto');

/**
 * Generate a unique room name for a consultation
 * @param {string} appointmentId - Appointment ID
 * @param {string} patientId - Patient ID
 * @param {string} doctorId - Doctor ID
 * @returns {string} - Unique room name
 */
const generateRoomName = (appointmentId, patientId, doctorId) => {
  const timestamp = Date.now();
  const hash = crypto
    .createHash('sha256')
    .update(`${appointmentId}-${patientId}-${doctorId}-${timestamp}`)
    .digest('hex')
    .substring(0, 16);
  
  return `caresync-${hash}`;
};

/**
 * Generate a secure room password
 * @returns {string} - Random password
 */
const generateRoomPassword = () => {
  return crypto.randomBytes(8).toString('hex');
};

/**
 * Generate JWT token for Jitsi authentication (if using JWT auth)
 * @param {object} user - User object
 * @param {string} roomName - Room name
 * @returns {string} - JWT token
 */
const generateJitsiToken = (user, roomName) => {
  try {
    const jwt = require('jsonwebtoken');
    
    const payload = {
      context: {
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      aud: 'jitsi',
      iss: process.env.JITSI_APP_ID || 'caresync',
      sub: process.env.JITSI_DOMAIN || 'meet.jit.si',
      room: roomName,
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
    };

    const secret = process.env.JITSI_API_KEY || 'your-secret-key';
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
  } catch (error) {
    console.error('Error generating Jitsi token:', error);
    return null;
  }
};

/**
 * Create Jitsi meeting configuration
 * @param {string} roomName - Room name
 * @param {object} user - User object
 * @param {object} options - Additional options
 * @returns {object} - Jitsi configuration
 */
const createMeetingConfig = (roomName, user, options = {}) => {
  const config = {
    domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
    roomName,
    
    // User info
    userInfo: {
      displayName: user.name,
      email: user.email,
    },

    // Configuration overrides
    configOverwrite: {
      startWithAudioMuted: options.audioMuted || false,
      startWithVideoMuted: options.videoMuted || false,
      disableModeratorIndicator: false,
      enableWelcomePage: false,
      prejoinPageEnabled: options.prejoinPage || false,
      enableClosePage: true,
      
      // Recording
      fileRecordingsEnabled: options.recording || false,
      liveStreamingEnabled: false,
      
      // Features
      enableNoisyMicDetection: true,
      enableTalkWhileMuted: false,
      disableInviteFunctions: true,
      
      // Resolution
      resolution: 720,
      constraints: {
        video: {
          height: { ideal: 720, max: 1080, min: 360 },
          width: { ideal: 1280, max: 1920, min: 640 },
        },
      },
      
      // Other settings
      disableDeepLinking: true,
      disableThirdPartyRequests: true,
    },

    // Interface configuration
    interfaceConfigOverwrite: {
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      BRAND_WATERMARK_LINK: '',
      
      // Toolbar buttons
      TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'closedcaptions',
        'desktop',
        'fullscreen',
        'fodeviceselection',
        'hangup',
        'profile',
        'chat',
        'recording',
        'settings',
        'videoquality',
        'filmstrip',
        'tileview',
        'help',
      ],
      
      SETTINGS_SECTIONS: [
        'devices',
        'language',
        'moderator',
        'profile',
      ],
      
      // Display settings
      DISPLAY_WELCOME_PAGE_CONTENT: false,
      HIDE_INVITE_MORE_HEADER: true,
      MOBILE_APP_PROMO: false,
      
      // Film strip settings
      FILM_STRIP_MAX_HEIGHT: 120,
      TILE_VIEW_MAX_COLUMNS: 5,
    },
  };

  // Add JWT token if using authentication
  if (process.env.JITSI_APP_ID && process.env.JITSI_API_KEY) {
    config.jwt = generateJitsiToken(user, roomName);
  }

  return config;
};

/**
 * Validate Jitsi configuration
 * @returns {object} - Validation result
 */
const validateConfig = () => {
  const hasAppId = !!process.env.JITSI_APP_ID;
  const hasApiKey = !!process.env.JITSI_API_KEY;
  const hasDomain = !!process.env.JITSI_DOMAIN;

  return {
    isValid: hasDomain,
    hasAuth: hasAppId && hasApiKey,
    domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
    message: hasDomain 
      ? 'Jitsi configuration valid' 
      : 'Jitsi domain not configured, using default meet.jit.si',
  };
};

/**
 * Generate meeting URL
 * @param {string} roomName - Room name
 * @returns {string} - Meeting URL
 */
const generateMeetingUrl = (roomName) => {
  const domain = process.env.JITSI_DOMAIN || 'meet.jit.si';
  return `https://${domain}/${roomName}`;
};

/**
 * Parse meeting statistics (if provided by frontend)
 * @param {object} stats - Meeting statistics
 * @returns {object} - Parsed statistics
 */
const parseStats = (stats) => {
  return {
    duration: stats.duration || 0,
    participantCount: stats.participantCount || 0,
    audioQuality: stats.audioQuality || 'unknown',
    videoQuality: stats.videoQuality || 'unknown',
    connectionQuality: stats.connectionQuality || 'unknown',
    packetLoss: stats.packetLoss || 0,
    bitrate: stats.bitrate || 0,
  };
};

/**
 * Generate room configuration for mobile apps
 * @param {string} roomName - Room name
 * @param {object} user - User object
 * @returns {object} - Mobile configuration
 */
const generateMobileConfig = (roomName, user) => {
  return {
    url: generateMeetingUrl(roomName),
    roomName,
    subject: 'CareSync Consultation',
    userInfo: {
      displayName: user.name,
      email: user.email,
    },
    featureFlags: {
      'add-people.enabled': false,
      'calendar.enabled': false,
      'call-integration.enabled': false,
      'chat.enabled': true,
      'close-captions.enabled': true,
      'invite.enabled': false,
      'live-streaming.enabled': false,
      'meeting-name.enabled': false,
      'meeting-password.enabled': true,
      'pip.enabled': true,
      'raise-hand.enabled': true,
      'recording.enabled': false,
      'tile-view.enabled': true,
    },
  };
};

/**
 * Check if Jitsi service is available
 * @returns {Promise<boolean>} - Service availability
 */
const isServiceAvailable = async () => {
  try {
    const domain = process.env.JITSI_DOMAIN || 'meet.jit.si';
    // In production, you might want to ping the Jitsi server
    // For now, just check if domain is configured
    return !!domain;
  } catch (error) {
    console.error('Error checking Jitsi availability:', error);
    return false;
  }
};

module.exports = {
  generateRoomName,
  generateRoomPassword,
  generateJitsiToken,
  createMeetingConfig,
  validateConfig,
  generateMeetingUrl,
  parseStats,
  generateMobileConfig,
  isServiceAvailable,
};