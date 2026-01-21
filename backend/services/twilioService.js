/**
 * Twilio Video Integration Service
 * Alternative video service using Twilio Programmable Video API
 * Provides more control and reliability compared to Jitsi
 */

const twilio = require('twilio');

// Initialize Twilio client (only if credentials are provided)
let twilioClient = null;

const initializeTwilio = () => {
  if (!twilioClient && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    try {
      twilioClient = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );
      console.log('✅ Twilio Video client initialized');
    } catch (error) {
      console.error('❌ Twilio initialization failed:', error.message);
    }
  }
  return twilioClient;
};

/**
 * Generate Twilio Access Token for video room
 * @param {string} identity - User identity (user ID or name)
 * @param {string} roomName - Room name/SID
 * @returns {string} - Access token
 */
const generateAccessToken = (identity, roomName) => {
  try {
    const AccessToken = twilio.jwt.AccessToken;
    const VideoGrant = AccessToken.VideoGrant;

    // Create access token
    const token = new AccessToken(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_API_KEY,
      process.env.TWILIO_API_SECRET,
      { identity }
    );

    // Create video grant
    const videoGrant = new VideoGrant({
      room: roomName,
    });

    // Add grant to token
    token.addGrant(videoGrant);

    // Return the JWT token
    return token.toJwt();
  } catch (error) {
    console.error('Error generating Twilio access token:', error);
    throw new Error('Failed to generate access token');
  }
};

/**
 * Create a Twilio video room
 * @param {string} roomName - Unique room name
 * @param {object} options - Room options
 * @returns {Promise<object>} - Room details
 */
const createRoom = async (roomName, options = {}) => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const room = await client.video.v1.rooms.create({
      uniqueName: roomName,
      type: options.type || 'group', // 'group', 'peer-to-peer', 'group-small'
      recordParticipantsOnConnect: options.recording || false,
      maxParticipants: options.maxParticipants || 10,
      statusCallback: options.statusCallback || undefined,
      statusCallbackMethod: 'POST',
      videoCodecs: options.videoCodecs || ['VP8', 'H264'],
      mediaRegion: options.region || 'us1', // Closest region for better performance
    });

    return {
      sid: room.sid,
      uniqueName: room.uniqueName,
      status: room.status,
      type: room.type,
      maxParticipants: room.maxParticipants,
      duration: room.duration,
      dateCreated: room.dateCreated,
    };
  } catch (error) {
    console.error('Error creating Twilio room:', error);
    throw new Error('Failed to create video room');
  }
};

/**
 * Get room details
 * @param {string} roomSid - Room SID or unique name
 * @returns {Promise<object>} - Room details
 */
const getRoom = async (roomSid) => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const room = await client.video.v1.rooms(roomSid).fetch();
    
    return {
      sid: room.sid,
      uniqueName: room.uniqueName,
      status: room.status,
      type: room.type,
      maxParticipants: room.maxParticipants,
      duration: room.duration,
      participantsCount: room.participants ? room.participants.length : 0,
      dateCreated: room.dateCreated,
      dateUpdated: room.dateUpdated,
    };
  } catch (error) {
    console.error('Error fetching Twilio room:', error);
    throw new Error('Failed to fetch room details');
  }
};

/**
 * Get list of participants in a room
 * @param {string} roomSid - Room SID
 * @returns {Promise<Array>} - List of participants
 */
const getParticipants = async (roomSid) => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const participants = await client.video.v1
      .rooms(roomSid)
      .participants.list();

    return participants.map(participant => ({
      sid: participant.sid,
      identity: participant.identity,
      status: participant.status,
      duration: participant.duration,
      dateCreated: participant.dateCreated,
      dateUpdated: participant.dateUpdated,
    }));
  } catch (error) {
    console.error('Error fetching participants:', error);
    throw new Error('Failed to fetch participants');
  }
};

/**
 * Disconnect a participant from a room
 * @param {string} roomSid - Room SID
 * @param {string} participantSid - Participant SID
 * @returns {Promise<boolean>} - Success status
 */
const disconnectParticipant = async (roomSid, participantSid) => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    await client.video.v1
      .rooms(roomSid)
      .participants(participantSid)
      .update({ status: 'disconnected' });
    
    return true;
  } catch (error) {
    console.error('Error disconnecting participant:', error);
    throw new Error('Failed to disconnect participant');
  }
};

/**
 * End a video room (disconnect all participants)
 * @param {string} roomSid - Room SID or unique name
 * @returns {Promise<object>} - Room details
 */
const endRoom = async (roomSid) => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const room = await client.video.v1.rooms(roomSid).update({
      status: 'completed',
    });

    return {
      sid: room.sid,
      uniqueName: room.uniqueName,
      status: room.status,
      duration: room.duration,
      endTime: room.endTime,
    };
  } catch (error) {
    console.error('Error ending Twilio room:', error);
    throw new Error('Failed to end room');
  }
};

/**
 * Get room recordings
 * @param {string} roomSid - Room SID
 * @returns {Promise<Array>} - List of recordings
 */
const getRecordings = async (roomSid) => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const recordings = await client.video.v1
      .rooms(roomSid)
      .recordings.list();

    return recordings.map(recording => ({
      sid: recording.sid,
      status: recording.status,
      duration: recording.duration,
      size: recording.size,
      type: recording.type,
      containerFormat: recording.containerFormat,
      codec: recording.codec,
      dateCreated: recording.dateCreated,
      url: recording.url,
    }));
  } catch (error) {
    console.error('Error fetching recordings:', error);
    return [];
  }
};

/**
 * List all active rooms
 * @returns {Promise<Array>} - List of active rooms
 */
const listActiveRooms = async () => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const rooms = await client.video.v1.rooms.list({
      status: 'in-progress',
      limit: 100,
    });

    return rooms.map(room => ({
      sid: room.sid,
      uniqueName: room.uniqueName,
      status: room.status,
      type: room.type,
      duration: room.duration,
      dateCreated: room.dateCreated,
    }));
  } catch (error) {
    console.error('Error listing rooms:', error);
    return [];
  }
};

/**
 * Get room composition (for recording/streaming)
 * @param {string} roomSid - Room SID
 * @returns {Promise<object>} - Composition details
 */
const getRoomComposition = async (roomSid) => {
  const client = initializeTwilio();
  
  if (!client) {
    throw new Error('Twilio not configured');
  }

  try {
    const compositions = await client.video.v1.compositions.list({
      roomSid,
      limit: 1,
    });

    if (compositions.length === 0) {
      return null;
    }

    const composition = compositions[0];
    return {
      sid: composition.sid,
      status: composition.status,
      duration: composition.duration,
      resolution: composition.resolution,
      format: composition.format,
      size: composition.size,
      url: composition.url,
    };
  } catch (error) {
    console.error('Error fetching composition:', error);
    return null;
  }
};

/**
 * Check if Twilio is configured
 * @returns {boolean} - Configuration status
 */
const isConfigured = () => {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_API_KEY &&
    process.env.TWILIO_API_SECRET
  );
};

/**
 * Validate Twilio credentials
 * @returns {Promise<object>} - Validation result
 */
const validateCredentials = async () => {
  if (!isConfigured()) {
    return {
      isValid: false,
      message: 'Twilio credentials not configured',
    };
  }

  const client = initializeTwilio();
  
  try {
    // Try to fetch account details to validate credentials
    await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    return {
      isValid: true,
      message: 'Twilio credentials valid',
    };
  } catch (error) {
    return {
      isValid: false,
      message: `Invalid credentials: ${error.message}`,
    };
  }
};

module.exports = {
  generateAccessToken,
  createRoom,
  getRoom,
  getParticipants,
  disconnectParticipant,
  endRoom,
  getRecordings,
  listActiveRooms,
  getRoomComposition,
  isConfigured,
  validateCredentials,
};