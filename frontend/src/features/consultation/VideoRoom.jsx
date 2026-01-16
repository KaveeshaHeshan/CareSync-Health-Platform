import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Monitor,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Minimize,
  Volume2,
  VolumeX,
  RefreshCw,
  AlertCircle,
  Clock,
  User
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import consultationApi from '../../api/consultationApi';

const VideoRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  
  // States
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isJitsiLoaded, setIsJitsiLoaded] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('connecting');
  
  // Video controls state
  const [isVideoMuted, setIsVideoMuted] = useState(false);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isSpeakerMuted, setIsSpeakerMuted] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // UI states
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  
  // Call data
  const [participants, setParticipants] = useState([]);
  const [callStartTime, setCallStartTime] = useState(null);
  const [callDuration, setCallDuration] = useState('00:00');
  const [callNotes, setCallNotes] = useState('');
  
  // User info from localStorage
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Get current user
    const user = localStorage.getItem('user');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
    
    loadConsultation();
    
    return () => {
      // Cleanup on unmount
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
    };
  }, [appointmentId]);

  useEffect(() => {
    if (consultation && !isJitsiLoaded) {
      loadJitsiMeet();
    }
  }, [consultation]);

  // Call duration timer
  useEffect(() => {
    if (callStartTime) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = now - callStartTime;
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setCallDuration(`${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [callStartTime]);

  const loadConsultation = async () => {
    try {
      setLoading(true);
      const response = await consultationApi.createRoom(appointmentId);
      setConsultation(response.consultation);
      setError(null);
    } catch (error) {
      console.error('Error loading consultation:', error);
      setError('Failed to load video consultation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadJitsiMeet = () => {
    if (!consultation || !jitsiContainerRef.current) return;

    // Check if Jitsi script is loaded
    if (!window.JitsiMeetExternalAPI) {
      // Load Jitsi script dynamically
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = () => initializeJitsi();
      script.onerror = () => {
        setError('Failed to load video conferencing library. Please refresh the page.');
      };
      document.body.appendChild(script);
    } else {
      initializeJitsi();
    }
  };

  const initializeJitsi = () => {
    if (!window.JitsiMeetExternalAPI || !consultation) return;

    const domain = import.meta.env.VITE_JITSI_DOMAIN || 'meet.jit.si';
    const options = {
      roomName: consultation.roomId,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: {
        startWithAudioMuted: false,
        startWithVideoMuted: false,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableDeepLinking: true,
        disableInviteFunctions: true,
        enableNoisyMicDetection: true,
        enableClosePage: false,
      },
      interfaceConfigOverwrite: {
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
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
          'settings',
          'videoquality',
          'filmstrip',
          'shortcuts',
          'tileview',
          'download',
          'help',
          'mute-everyone'
        ],
        SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile'],
        FILM_STRIP_MAX_HEIGHT: 120,
        MOBILE_APP_PROMO: false,
      },
      userInfo: {
        displayName: currentUser?.name || 'Guest',
        email: currentUser?.email || '',
      },
    };

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Event listeners
      api.addEventListener('videoConferenceJoined', handleConferenceJoined);
      api.addEventListener('videoConferenceLeft', handleConferenceLeft);
      api.addEventListener('participantJoined', handleParticipantJoined);
      api.addEventListener('participantLeft', handleParticipantLeft);
      api.addEventListener('audioMuteStatusChanged', handleAudioMuteChanged);
      api.addEventListener('videoMuteStatusChanged', handleVideoMuteChanged);
      api.addEventListener('screenSharingStatusChanged', handleScreenSharingChanged);
      api.addEventListener('readyToClose', handleReadyToClose);
      api.addEventListener('errorOccurred', handleError);

      setIsJitsiLoaded(true);
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Error initializing Jitsi:', error);
      setError('Failed to initialize video call. Please refresh the page.');
    }
  };

  // Jitsi event handlers
  const handleConferenceJoined = async (event) => {
    console.log('Conference joined:', event);
    setCallStartTime(new Date());
    setConnectionStatus('connected');
    
    // Start consultation on backend
    try {
      await consultationApi.startConsultation(consultation._id);
    } catch (error) {
      console.error('Error starting consultation:', error);
    }
  };

  const handleConferenceLeft = () => {
    console.log('Conference left');
    setConnectionStatus('disconnected');
  };

  const handleParticipantJoined = (event) => {
    console.log('Participant joined:', event);
    setParticipants(prev => [...prev, event.id]);
  };

  const handleParticipantLeft = (event) => {
    console.log('Participant left:', event);
    setParticipants(prev => prev.filter(id => id !== event.id));
  };

  const handleAudioMuteChanged = (event) => {
    setIsAudioMuted(event.muted);
  };

  const handleVideoMuteChanged = (event) => {
    setIsVideoMuted(event.muted);
  };

  const handleScreenSharingChanged = (event) => {
    setIsScreenSharing(event.on);
  };

  const handleReadyToClose = () => {
    console.log('Ready to close');
    handleEndCall();
  };

  const handleError = (error) => {
    console.error('Jitsi error:', error);
    setError('An error occurred during the video call. Please try reconnecting.');
  };

  // Control functions
  const toggleVideo = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleVideo');
    }
  };

  const toggleAudio = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleAudio');
    }
  };

  const toggleScreenShare = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.executeCommand('toggleShareScreen');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      jitsiContainerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleSpeaker = () => {
    if (jitsiApiRef.current) {
      const newMuteState = !isSpeakerMuted;
      jitsiApiRef.current.executeCommand('setVideoQuality', newMuteState ? 0 : 720);
      setIsSpeakerMuted(newMuteState);
    }
  };

  const handleEndCall = () => {
    setShowEndCallModal(true);
  };

  const confirmEndCall = async () => {
    try {
      // End consultation on backend
      await consultationApi.endConsultation(consultation._id, callNotes);
      
      // Dispose Jitsi
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
      }
      
      // Navigate back based on user role
      if (currentUser?.role === 'DOCTOR') {
        navigate('/doctor/dashboard');
      } else {
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error('Error ending consultation:', error);
      // Navigate anyway
      navigate(-1);
    }
  };

  const retryConnection = () => {
    setError(null);
    setIsJitsiLoaded(false);
    loadConsultation();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <Card className="p-8 text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-slate-900 mb-2">
            Loading Video Consultation
          </h2>
          <p className="text-slate-600">
            Please wait while we prepare your video room...
          </p>
        </Card>
      </div>
    );
  }

  if (error && !consultation) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900 p-4">
        <Card className="p-8 max-w-md">
          <div className="flex items-start gap-3 mb-6">
            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={24} />
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Connection Error
              </h2>
              <p className="text-slate-600">{error}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate(-1)} variant="outline" className="flex-1">
              Go Back
            </Button>
            <Button onClick={retryConnection} className="flex-1 flex items-center justify-center gap-2">
              <RefreshCw size={18} />
              Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500' : 
                connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' : 
                'bg-red-500'
              }`} />
              <span className="text-white text-sm font-medium capitalize">
                {connectionStatus}
              </span>
            </div>
            
            {callStartTime && (
              <div className="flex items-center gap-2 text-white">
                <Clock size={16} />
                <span className="text-sm font-mono">{callDuration}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 text-white text-sm">
              <Users size={16} />
              <span>{participants.length + 1} participant{participants.length !== 0 ? 's' : ''}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {error && consultation && (
        <div className="px-4 pt-4">
          <Alert variant="error" onClose={() => setError(null)}>
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <Button onClick={retryConnection} size="sm" variant="outline">
                Retry
              </Button>
            </div>
          </Alert>
        </div>
      )}

      {/* Jitsi Container */}
      <div className="flex-1 relative">
        <div 
          ref={jitsiContainerRef} 
          className="w-full h-full"
          style={{ minHeight: '400px' }}
        />
        
        {!isJitsiLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <Spinner size="lg" className="mx-auto mb-4 text-white" />
              <p className="text-white text-lg">Connecting to video call...</p>
            </div>
          </div>
        )}
      </div>

      {/* Custom Controls Overlay - Optional custom controls if needed */}
      {isJitsiLoaded && (
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-50">
          <Card className="px-6 py-4 shadow-2xl bg-slate-800 border-slate-700">
            <div className="flex items-center gap-3">
              {/* Microphone */}
              <Button
                onClick={toggleAudio}
                variant={isAudioMuted ? 'danger' : 'outline'}
                size="lg"
                className="rounded-full w-14 h-14 flex items-center justify-center"
                title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
              >
                {isAudioMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </Button>

              {/* Camera */}
              <Button
                onClick={toggleVideo}
                variant={isVideoMuted ? 'danger' : 'outline'}
                size="lg"
                className="rounded-full w-14 h-14 flex items-center justify-center"
                title={isVideoMuted ? 'Turn On Camera' : 'Turn Off Camera'}
              >
                {isVideoMuted ? <VideoOff size={24} /> : <Video size={24} />}
              </Button>

              {/* Screen Share */}
              <Button
                onClick={toggleScreenShare}
                variant={isScreenSharing ? 'success' : 'outline'}
                size="lg"
                className="rounded-full w-14 h-14 flex items-center justify-center"
                title={isScreenSharing ? 'Stop Sharing' : 'Share Screen'}
              >
                <Monitor size={24} />
              </Button>

              {/* End Call */}
              <Button
                onClick={handleEndCall}
                variant="danger"
                size="lg"
                className="rounded-full w-14 h-14 flex items-center justify-center"
                title="End Call"
              >
                <PhoneOff size={24} />
              </Button>

              {/* Fullscreen */}
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="lg"
                className="rounded-full w-14 h-14 flex items-center justify-center"
                title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              >
                {isFullscreen ? <Minimize size={24} /> : <Maximize size={24} />}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* End Call Confirmation Modal */}
      {showEndCallModal && (
        <Modal
          isOpen={showEndCallModal}
          onClose={() => setShowEndCallModal(false)}
          title="End Video Consultation"
        >
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <PhoneOff className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <div>
                  <div className="font-medium text-red-900">End Call</div>
                  <div className="text-sm text-red-700 mt-1">
                    Are you sure you want to end this video consultation?
                  </div>
                </div>
              </div>
            </div>

            {/* Call Summary */}
            <div className="p-4 bg-slate-50 rounded-xl space-y-3">
              <div>
                <div className="text-sm text-slate-600">Duration</div>
                <div className="font-medium text-slate-900 mt-1">{callDuration}</div>
              </div>
              <div>
                <div className="text-sm text-slate-600">Participants</div>
                <div className="font-medium text-slate-900 mt-1">
                  {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
                </div>
              </div>
            </div>

            {/* Optional Notes (for doctors) */}
            {currentUser?.role === 'DOCTOR' && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Consultation Notes (Optional)
                </label>
                <textarea
                  value={callNotes}
                  onChange={(e) => setCallNotes(e.target.value)}
                  placeholder="Add any notes about this consultation..."
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                onClick={() => setShowEndCallModal(false)}
                variant="outline"
                className="flex-1"
              >
                Continue Call
              </Button>
              <Button
                onClick={confirmEndCall}
                variant="danger"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <PhoneOff size={18} />
                End Call
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default VideoRoom;
