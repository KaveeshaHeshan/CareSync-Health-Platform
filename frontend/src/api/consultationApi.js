import axiosInstance from './axiosInstance';

const consultationApi = {
  // ========== Video Room Management ==========
  
  // Create video room for appointment
  createRoom: async (appointmentId) => {
    const response = await axiosInstance.post(`/consultations/room/${appointmentId}`);
    return response.data;
  },

  // Join video room
  joinRoom: async (roomId) => {
    const response = await axiosInstance.get(`/consultations/rooms/${roomId}/join`);
    return response.data;
  },

  // Get room details
  getRoomDetails: async (roomId) => {
    const response = await axiosInstance.get(`/consultations/rooms/${roomId}`);
    return response.data;
  },

  // Check room availability
  checkRoomAvailability: async (appointmentId) => {
    const response = await axiosInstance.get(`/consultations/room/${appointmentId}/check`);
    return response.data;
  },

  // ========== Consultation Session ==========
  
  // Start consultation
  startConsultation: async (consultationId) => {
    const response = await axiosInstance.put(`/consultations/${consultationId}/start`);
    return response.data;
  },

  // End consultation
  endConsultation: async (consultationId, notes) => {
    const response = await axiosInstance.put(`/consultations/${consultationId}/end`, { notes });
    return response.data;
  },

  // Get consultation by ID
  getById: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}`);
    return response.data;
  },

  // Update consultation status
  updateStatus: async (consultationId, status) => {
    const response = await axiosInstance.patch(`/consultations/${consultationId}/status`, { status });
    return response.data;
  },

  // Add consultation notes
  addNotes: async (consultationId, notes) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/notes`, { notes });
    return response.data;
  },

  // ========== Consultation History ==========
  
  // Get consultation history
  getHistory: async () => {
    const response = await axiosInstance.get('/consultations/history');
    return response.data;
  },

  // Get my consultations
  getMyConsultations: async () => {
    const response = await axiosInstance.get('/consultations/my-consultations');
    return response.data;
  },

  // Get upcoming consultations
  getUpcoming: async () => {
    const response = await axiosInstance.get('/consultations/upcoming');
    return response.data;
  },

  // Get past consultations
  getPast: async () => {
    const response = await axiosInstance.get('/consultations/past');
    return response.data;
  },

  // Get consultations by patient
  getByPatient: async (patientId) => {
    const response = await axiosInstance.get(`/consultations/patient/${patientId}`);
    return response.data;
  },

  // Get consultations by doctor
  getByDoctor: async (doctorId) => {
    const response = await axiosInstance.get(`/consultations/doctor/${doctorId}`);
    return response.data;
  },

  // ========== Jitsi Integration ==========
  
  // Get Jitsi configuration
  getJitsiConfig: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/jitsi-config`);
    return response.data;
  },

  // Generate Jitsi JWT token
  generateJitsiToken: async (consultationId, userInfo) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/jitsi-token`, userInfo);
    return response.data;
  },

  // Validate Jitsi room access
  validateRoomAccess: async (roomId, userId) => {
    const response = await axiosInstance.post('/consultations/validate-access', { roomId, userId });
    return response.data;
  },

  // ========== Recording ==========
  
  // Start recording
  startRecording: async (consultationId) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/recording/start`);
    return response.data;
  },

  // Stop recording
  stopRecording: async (consultationId) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/recording/stop`);
    return response.data;
  },

  // Get recording status
  getRecordingStatus: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/recording/status`);
    return response.data;
  },

  // Get recording URL
  getRecordingUrl: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/recording/url`);
    return response.data;
  },

  // Download recording
  downloadRecording: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/recording/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  // Delete recording
  deleteRecording: async (consultationId) => {
    const response = await axiosInstance.delete(`/consultations/${consultationId}/recording`);
    return response.data;
  },

  // ========== Chat & Messaging ==========
  
  // Send chat message during consultation
  sendChatMessage: async (consultationId, message) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/chat`, { message });
    return response.data;
  },

  // Get chat history
  getChatHistory: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/chat`);
    return response.data;
  },

  // ========== Participants ==========
  
  // Get participants in consultation
  getParticipants: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/participants`);
    return response.data;
  },

  // Add participant
  addParticipant: async (consultationId, participantData) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/participants`, participantData);
    return response.data;
  },

  // Remove participant
  removeParticipant: async (consultationId, participantId) => {
    const response = await axiosInstance.delete(`/consultations/${consultationId}/participants/${participantId}`);
    return response.data;
  },

  // ========== Waiting Room ==========
  
  // Join waiting room
  joinWaitingRoom: async (consultationId) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/waiting-room/join`);
    return response.data;
  },

  // Leave waiting room
  leaveWaitingRoom: async (consultationId) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/waiting-room/leave`);
    return response.data;
  },

  // Get waiting room status
  getWaitingRoomStatus: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/waiting-room/status`);
    return response.data;
  },

  // Admit patient from waiting room
  admitPatient: async (consultationId, patientId) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/waiting-room/admit`, { patientId });
    return response.data;
  },

  // ========== Screen Sharing ==========
  
  // Request screen share
  requestScreenShare: async (consultationId) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/screen-share/request`);
    return response.data;
  },

  // Stop screen share
  stopScreenShare: async (consultationId) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/screen-share/stop`);
    return response.data;
  },

  // ========== Prescriptions & Follow-up ==========
  
  // Add prescription after consultation
  addPrescription: async (consultationId, prescriptionData) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/prescription`, prescriptionData);
    return response.data;
  },

  // Schedule follow-up
  scheduleFollowUp: async (consultationId, followUpData) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/follow-up`, followUpData);
    return response.data;
  },

  // ========== Consultation Ratings ==========
  
  // Rate consultation
  rateConsultation: async (consultationId, rating, review) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/rate`, { rating, review });
    return response.data;
  },

  // Get consultation rating
  getRating: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/rating`);
    return response.data;
  },

  // ========== Statistics ==========
  
  // Get consultation statistics
  getStats: async () => {
    const response = await axiosInstance.get('/consultations/stats');
    return response.data;
  },

  // Get consultation duration analytics
  getDurationAnalytics: async (startDate, endDate) => {
    const response = await axiosInstance.get('/consultations/analytics/duration', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // ========== Troubleshooting ==========
  
  // Test connection
  testConnection: async () => {
    const response = await axiosInstance.get('/consultations/test-connection');
    return response.data;
  },

  // Report issue
  reportIssue: async (consultationId, issueData) => {
    const response = await axiosInstance.post(`/consultations/${consultationId}/report-issue`, issueData);
    return response.data;
  },

  // Get connection quality
  getConnectionQuality: async (consultationId) => {
    const response = await axiosInstance.get(`/consultations/${consultationId}/connection-quality`);
    return response.data;
  },
};

export default consultationApi;
