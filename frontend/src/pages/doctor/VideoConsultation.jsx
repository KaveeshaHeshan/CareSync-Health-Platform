import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../features/auth/AuthContext';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  Settings,
  Maximize,
  Minimize,
  Clock,
  FileText,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import consultationApi from '../../api/consultationApi';
import appointmentApi from '../../api/appointmentApi';

/**
 * DoctorVideoConsultation Component
 * 
 * Video consultation room for doctors with Jitsi integration
 * Includes call controls, chat, screen sharing, and consultation notes
 * 
 * @component
 */
const DoctorVideoConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [consultation, setConsultation] = useState(null);
  const [appointment, setAppointment] = useState(null);
  const [jitsiApi, setJitsiApi] = useState(null);
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [error, setError] = useState('');
  const [callStartTime, setCallStartTime] = useState(null);

  // Load consultation and setup Jitsi
  useEffect(() => {
    loadConsultation();
    return () => {
      if (jitsiApi) {
        jitsiApi.dispose();
      }
    };
  }, [appointmentId]);

  // Call duration timer
  useEffect(() => {
    if (!callStartTime) return;
    
    const interval = setInterval(() => {
      const duration = Math.floor((Date.now() - callStartTime) / 1000);
      setCallDuration(duration);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [callStartTime]);

  const loadConsultation = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Get appointment details
      const appointmentResponse = await appointmentApi.getById(appointmentId);
      setAppointment(appointmentResponse.data);
      
      // Create or get consultation room
      const consultationResponse = await consultationApi.createRoom(appointmentId);
      setConsultation(consultationResponse.consultation);
      
      // Initialize Jitsi
      initializeJitsi(consultationResponse.jitsiConfig);
      
      // Start consultation
      await consultationApi.startConsultation(consultationResponse.consultation.id);
      setCallStartTime(Date.now());
      
    } catch (err) {
      console.error('Error loading consultation:', err);
      setError('Failed to load video consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const initializeJitsi = (config) => {
    const domain = config.domain || 'meet.jit.si';
    const options = {
      roomName: config.roomName,
      width: '100%',
      height: '100%',
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        disableModeratorIndicator: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        defaultLanguage: 'en',
        enableNoisyMicDetection: true,
      },
      interfaceConfigOverwrite: {
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
          'videobackgroundblur',
          'raisehand',
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      },
      userInfo: {
        displayName: `Dr. ${user?.name || 'Doctor'}`,
        email: user?.email,
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    // Event listeners
    api.addEventListener('videoConferenceJoined', handleConferenceJoined);
    api.addEventListener('videoConferenceLeft', handleConferenceLeft);
    api.addEventListener('audioMuteStatusChanged', handleAudioMuteChange);
    api.addEventListener('videoMuteStatusChanged', handleVideoMuteChange);
    api.addEventListener('screenSharingStatusChanged', handleScreenSharingChange);
    api.addEventListener('participantJoined', handleParticipantJoined);
    api.addEventListener('participantLeft', handleParticipantLeft);

    setJitsiApi(api);
  };

  // Jitsi event handlers
  const handleConferenceJoined = (event) => {
    console.log('Conference joined:', event);
  };

  const handleConferenceLeft = () => {
    console.log('Conference left');
    handleEndCall();
  };

  const handleAudioMuteChange = (event) => {
    setIsAudioMuted(event.muted);
  };

  const handleVideoMuteChange = (event) => {
    setIsVideoMuted(event.muted);
  };

  const handleScreenSharingChange = (event) => {
    setIsScreenSharing(event.on);
  };

  const handleParticipantJoined = (event) => {
    console.log('Participant joined:', event);
  };

  const handleParticipantLeft = (event) => {
    console.log('Participant left:', event);
  };

  // Control functions
  const toggleVideo = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleVideo');
    }
  };

  const toggleAudio = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleAudio');
    }
  };

  const toggleScreenShare = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleShareScreen');
    }
  };

  const toggleChat = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleChat');
    }
  };

  const toggleParticipants = () => {
    if (jitsiApi) {
      jitsiApi.executeCommand('toggleTileView');
    }
  };

  // End call
  const handleEndCall = async () => {
    setShowEndCallModal(true);
  };

  const confirmEndCall = async () => {
    try {
      if (jitsiApi) {
        jitsiApi.executeCommand('hangup');
        jitsiApi.dispose();
      }
      
      // End consultation with notes
      if (consultation) {
        await consultationApi.endConsultation(consultation.id, consultationNotes);
      }
      
      // Navigate back
      navigate('/doctor/appointments');
    } catch (err) {
      console.error('Error ending call:', err);
      setError('Failed to end consultation properly');
    }
  };

  // Format duration
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
          <Spinner size="lg" className="mb-4" />
          <p className="text-white text-lg">Connecting to video call...</p>
        </div>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900 p-4">
        <Card className="max-w-md">
          <Alert variant="error" className="mb-4">
            {error}
          </Alert>
          <Button onClick={() => navigate('/doctor/appointments')} className="w-full">
            Back to Appointments
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="bg-gray-800 text-white px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center space-x-4">
          <div className="bg-red-500 rounded-full p-2 animate-pulse">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              Consultation with {appointment?.patient?.name || 'Patient'}
            </h2>
            <p className="text-sm text-gray-400">
              {appointment?.type || 'Video Consultation'}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Call Duration */}
          <div className="flex items-center space-x-2 bg-gray-700 px-4 py-2 rounded-lg">
            <Clock className="w-5 h-5 text-green-400" />
            <span className="text-lg font-mono">{formatDuration(callDuration)}</span>
          </div>
          
          {/* Patient Info */}
          <div className="text-right">
            <Badge variant="success">Connected</Badge>
          </div>
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative">
        <div id="jitsi-container" className="w-full h-full"></div>
        
        {/* Error Overlay */}
        {error && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-50">
            <Alert variant="error">{error}</Alert>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="bg-gray-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          {/* Left Controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant={isAudioMuted ? 'danger' : 'default'}
              size="lg"
              onClick={toggleAudio}
              className="rounded-full w-14 h-14"
            >
              {isAudioMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isVideoMuted ? 'danger' : 'default'}
              size="lg"
              onClick={toggleVideo}
              className="rounded-full w-14 h-14"
            >
              {isVideoMuted ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </Button>
            
            <Button
              variant={isScreenSharing ? 'primary' : 'default'}
              size="lg"
              onClick={toggleScreenShare}
              className="rounded-full w-14 h-14"
            >
              {isScreenSharing ? <MonitorOff className="w-6 h-6" /> : <Monitor className="w-6 h-6" />}
            </Button>
          </div>

          {/* Center - End Call */}
          <Button
            variant="danger"
            size="lg"
            onClick={handleEndCall}
            className="rounded-full px-8 py-4 font-semibold"
          >
            <PhoneOff className="w-6 h-6 mr-2" />
            End Consultation
          </Button>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            <Button
              variant="default"
              size="lg"
              onClick={toggleChat}
              className="rounded-full w-14 h-14"
            >
              <MessageSquare className="w-6 h-6" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={toggleParticipants}
              className="rounded-full w-14 h-14"
            >
              <Users className="w-6 h-6" />
            </Button>
            
            <Button
              variant="default"
              size="lg"
              onClick={() => setShowNotesModal(true)}
              className="rounded-full w-14 h-14"
            >
              <FileText className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* End Call Modal */}
      <Modal
        isOpen={showEndCallModal}
        onClose={() => setShowEndCallModal(false)}
        title="End Consultation"
        size="md"
      >
        <div className="space-y-4">
          <Alert variant="warning">
            <AlertCircle className="w-5 h-5 mr-2" />
            Are you sure you want to end this consultation?
          </Alert>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Consultation Notes (Optional)
            </label>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Add any notes about this consultation..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              These notes will be saved to the patient's consultation history
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Patient:</span>
              <span className="font-medium text-gray-900">
                {appointment?.patient?.name}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Duration:</span>
              <span className="font-medium text-gray-900">
                {formatDuration(callDuration)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Type:</span>
              <span className="font-medium text-gray-900">
                {appointment?.type || 'Video Consultation'}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowEndCallModal(false)}
            >
              Continue Call
            </Button>
            <Button
              variant="danger"
              onClick={confirmEndCall}
            >
              <PhoneOff className="w-4 h-4 mr-2" />
              End Consultation
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notes Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => setShowNotesModal(false)}
        title="Consultation Notes"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Add notes during the consultation. These will be saved when you end the call.
          </p>
          
          <div>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              placeholder="Enter consultation notes..."
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowNotesModal(false)}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setShowNotesModal(false);
                // Notes are already saved in state
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Save Notes
            </Button>
          </div>
        </div>
      </Modal>

      {/* Load Jitsi Script */}
      {!window.JitsiMeetExternalAPI && (
        <script
          src="https://meet.jit.si/external_api.js"
          async
          onLoad={() => console.log('Jitsi API loaded')}
        />
      )}
    </div>
  );
};

export default DoctorVideoConsultation;
