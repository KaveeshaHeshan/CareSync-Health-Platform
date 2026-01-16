import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  PhoneOff, 
  Settings,
  Monitor,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  Loader,
  ArrowLeft,
  MessageSquare
} from 'lucide-react';
import appointmentApi from '../../api/appointmentApi';
import { formatDate, formatTime } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const VideoConsultation = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [callStarted, setCallStarted] = useState(false);
  const [showEndCallModal, setShowEndCallModal] = useState(false);
  const [consultationNotes, setConsultationNotes] = useState('');
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' });
  const [endingCall, setEndingCall] = useState(false);
  
  // Device testing states
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [devicesTested, setDevicesTested] = useState(false);
  const [testingDevices, setTestingDevices] = useState(false);
  const [devices, setDevices] = useState({ cameras: [], microphones: [], speakers: [] });
  const [selectedDevices, setSelectedDevices] = useState({
    camera: '',
    microphone: '',
    speaker: ''
  });
  
  // Connection status
  const [connectionQuality, setConnectionQuality] = useState('checking'); // checking, good, fair, poor
  
  // Video preview ref
  const videoPreviewRef = useRef(null);
  const localStreamRef = useRef(null);
  const jitsiApiRef = useRef(null);

  useEffect(() => {
    fetchAppointment();
    return () => {
      // Cleanup: stop local stream
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [appointmentId]);

  useEffect(() => {
    if (!callStarted) {
      initializeDevicePreview();
    }
  }, [callStarted]);

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointmentById(appointmentId);
      setAppointment(response.appointment);
      
      // Check if appointment is valid for video call
      if (response.appointment.type !== 'online') {
        alert('This is not a video consultation appointment');
        navigate('/patient/appointments');
        return;
      }
      
      if (response.appointment.status === 'cancelled') {
        alert('This appointment has been cancelled');
        navigate('/patient/appointments');
        return;
      }
    } catch (error) {
      console.error('Error fetching appointment:', error);
      alert('Failed to load appointment details');
      navigate('/patient/appointments');
    } finally {
      setLoading(false);
    }
  };

  const initializeDevicePreview = async () => {
    try {
      setTestingDevices(true);
      
      // Request permissions and get devices
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      const deviceList = await navigator.mediaDevices.enumerateDevices();
      
      const cameras = deviceList.filter(device => device.kind === 'videoinput');
      const microphones = deviceList.filter(device => device.kind === 'audioinput');
      const speakers = deviceList.filter(device => device.kind === 'audiooutput');
      
      setDevices({ cameras, microphones, speakers });
      
      // Set default devices
      if (cameras.length > 0) setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }));
      if (microphones.length > 0) setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].deviceId }));
      if (speakers.length > 0) setSelectedDevices(prev => ({ ...prev, speaker: speakers[0].deviceId }));
      
      // Start video preview
      startVideoPreview();
      
      // Check connection quality
      checkConnectionQuality();
      
    } catch (error) {
      console.error('Error initializing devices:', error);
      alert('Failed to access camera/microphone. Please check permissions.');
    } finally {
      setTestingDevices(false);
    }
  };

  const startVideoPreview = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDevices.camera ? { exact: selectedDevices.camera } : undefined },
        audio: { deviceId: selectedDevices.microphone ? { exact: selectedDevices.microphone } : undefined }
      });
      
      localStreamRef.current = stream;
      
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      
      setDevicesTested(true);
    } catch (error) {
      console.error('Error starting video preview:', error);
      setVideoEnabled(false);
    }
  };

  const checkConnectionQuality = async () => {
    try {
      setConnectionQuality('checking');
      
      // Simple connection check using navigator.connection API
      if (navigator.connection) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        
        if (effectiveType === '4g' || effectiveType === 'wifi') {
          setConnectionQuality('good');
        } else if (effectiveType === '3g') {
          setConnectionQuality('fair');
        } else {
          setConnectionQuality('poor');
        }
      } else {
        // Fallback: assume good connection
        setConnectionQuality('good');
      }
    } catch (error) {
      setConnectionQuality('good');
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setAudioEnabled(audioTrack.enabled);
      }
    }
  };

  const handleJoinCall = () => {
    if (!devicesTested) {
      alert('Please test your camera and microphone first');
      return;
    }
    
    if (connectionQuality === 'poor') {
      const confirm = window.confirm('Your internet connection is poor. The call quality may be affected. Continue anyway?');
      if (!confirm) return;
    }
    
    // Stop preview stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setCallStarted(true);
    loadJitsiMeet();
  };

  const loadJitsiMeet = () => {
    // Load Jitsi Meet External API
    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => initializeJitsi();
    document.body.appendChild(script);
  };

  const initializeJitsi = () => {
    const domain = 'meet.jit.si';
    const options = {
      roomName: `CareSync_${appointmentId}`,
      width: '100%',
      height: 600,
      parentNode: document.querySelector('#jitsi-container'),
      configOverwrite: {
        startWithAudioMuted: !audioEnabled,
        startWithVideoMuted: !videoEnabled,
        disableModeratorIndicator: true,
        enableWelcomePage: false,
        prejoinPageEnabled: false,
        disableInviteFunctions: true,
      },
      interfaceConfigOverwrite: {
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup',
          'chat', 'settings', 'videoquality', 'filmstrip',
          'tileview', 'download', 'help'
        ],
        SHOW_JITSI_WATERMARK: false,
        SHOW_BRAND_WATERMARK: false,
        SHOW_POWERED_BY: false,
        DEFAULT_BACKGROUND: '#1e293b',
      },
      userInfo: {
        displayName: appointment.patientDetails?.name || 'Patient',
        email: ''
      }
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);
    jitsiApiRef.current = api;

    // Event listeners
    api.addEventListener('videoConferenceJoined', () => {
      console.log('Joined conference');
    });

    api.addEventListener('videoConferenceLeft', () => {
      handleCallEnd();
    });

    api.addEventListener('readyToClose', () => {
      handleCallEnd();
    });
  };

  const handleEndCallClick = () => {
    setShowEndCallModal(true);
  };

  const handleCallEnd = () => {
    if (jitsiApiRef.current) {
      jitsiApiRef.current.dispose();
    }
    setShowEndCallModal(true);
  };

  const submitCallFeedback = async () => {
    try {
      setEndingCall(true);
      
      // Here you would call an API to save consultation notes and feedback
      // await consultationApi.endConsultation(appointmentId, {
      //   notes: consultationNotes,
      //   rating: feedback.rating,
      //   feedback: feedback.comment
      // });
      
      // For now, just navigate back
      navigate('/patient/appointments', {
        state: { message: 'Consultation completed successfully' }
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setEndingCall(false);
    }
  };

  const getConnectionBadge = () => {
    const badges = {
      checking: { color: 'bg-slate-100 text-slate-600', text: 'Checking...' },
      good: { color: 'bg-green-100 text-green-700', text: 'Good Connection' },
      fair: { color: 'bg-yellow-100 text-yellow-700', text: 'Fair Connection' },
      poor: { color: 'bg-red-100 text-red-700', text: 'Poor Connection' }
    };
    
    const badge = badges[connectionQuality];
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.color}`}>
        <div className={`w-2 h-2 rounded-full ${connectionQuality === 'good' ? 'bg-green-600' : connectionQuality === 'fair' ? 'bg-yellow-600' : 'bg-red-600'}`} />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading consultation...</p>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Card className="max-w-md">
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-red-600 mb-4" size={48} />
            <h2 className="text-xl font-semibold text-slate-900 mb-2">Appointment Not Found</h2>
            <p className="text-slate-600 mb-6">Unable to load appointment details.</p>
            <Button onClick={() => navigate('/patient/appointments')}>
              Back to Appointments
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/patient/appointments')}
                className="text-slate-600 hover:text-slate-900"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">
                  {callStarted ? 'Consultation in Progress' : 'Video Consultation'}
                </h1>
                <p className="text-sm text-slate-600">
                  Appointment ID: {appointmentId.substring(appointmentId.length - 8).toUpperCase()}
                </p>
              </div>
            </div>
            {!callStarted && getConnectionBadge()}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!callStarted ? (
          // Pre-call Waiting Room
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Video Preview */}
            <div className="lg:col-span-2">
              <Card className="overflow-hidden">
                <div className="bg-slate-900 relative" style={{ height: '500px' }}>
                  {testingDevices ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center text-white">
                        <Loader className="animate-spin mx-auto mb-4" size={48} />
                        <p className="text-lg">Testing devices...</p>
                      </div>
                    </div>
                  ) : videoEnabled ? (
                    <video
                      ref={videoPreviewRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                      <div className="text-center text-white">
                        <div className="w-24 h-24 rounded-full bg-indigo-600 flex items-center justify-center mx-auto mb-4">
                          <User size={48} />
                        </div>
                        <p className="text-lg">Camera is off</p>
                      </div>
                    </div>
                  )}

                  {/* Preview Label */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      Preview
                    </span>
                  </div>

                  {/* Controls */}
                  <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                    <button
                      onClick={toggleAudio}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        audioEnabled 
                          ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                    </button>

                    <button
                      onClick={toggleVideo}
                      className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                        videoEnabled 
                          ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                          : 'bg-red-600 hover:bg-red-700 text-white'
                      }`}
                    >
                      {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                    </button>

                    <button
                      className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-600 text-white flex items-center justify-center"
                      title="Settings"
                    >
                      <Settings size={24} />
                    </button>
                  </div>
                </div>

                {/* Device Info */}
                <div className="p-6 bg-white">
                  <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Monitor size={20} />
                    Device Setup
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Camera:</span>
                      <span className="text-slate-900 font-medium">
                        {devices.cameras.length} device(s) found
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Microphone:</span>
                      <span className="text-slate-900 font-medium">
                        {devices.microphones.length} device(s) found
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Connection Quality:</span>
                      <span>{getConnectionBadge()}</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Tips Card */}
              <Card className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
                <h3 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                  <CheckCircle size={20} />
                  Tips for a Great Consultation
                </h3>
                <ul className="space-y-2 text-sm text-indigo-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Find a quiet, well-lit location</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Keep your medical records and current medications list ready</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Test your camera and microphone before joining</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <span>Have a pen and paper ready to take notes</span>
                  </li>
                </ul>
              </Card>
            </div>

            {/* Right Column - Appointment Details */}
            <div className="space-y-6">
              {/* Doctor Info */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Consultation With</h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                    {appointment.doctor?.name?.charAt(0) || 'D'}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Dr. {appointment.doctor?.name}</p>
                    <p className="text-sm text-slate-600">{appointment.doctor?.specialization}</p>
                  </div>
                </div>
              </Card>

              {/* Appointment Info */}
              <Card>
                <h3 className="font-semibold text-slate-900 mb-4">Appointment Details</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Calendar className="text-indigo-600" size={20} />
                    </div>
                    <div>
                      <p className="text-slate-600">Date</p>
                      <p className="font-medium text-slate-900">{formatDate(appointment.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Clock className="text-green-600" size={20} />
                    </div>
                    <div>
                      <p className="text-slate-600">Time</p>
                      <p className="font-medium text-slate-900">{appointment.time}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                      <FileText className="text-purple-600" size={20} />
                    </div>
                    <div>
                      <p className="text-slate-600">Reason</p>
                      <p className="font-medium text-slate-900">{appointment.reason}</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Join Button */}
              <Button
                onClick={handleJoinCall}
                disabled={!devicesTested || testingDevices}
                className="w-full py-4 text-lg"
              >
                <Video className="mr-2" size={24} />
                {testingDevices ? 'Testing Devices...' : 'Join Consultation'}
              </Button>

              {/* Emergency Note */}
              <Card className="bg-red-50 border-red-200">
                <div className="flex gap-3">
                  <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Emergency?</p>
                    <p>If this is a medical emergency, please call 911 or visit your nearest emergency room immediately.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        ) : (
          // In-Call View
          <div>
            <Card className="mb-4 overflow-hidden">
              <div id="jitsi-container" className="relative"></div>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <User size={18} />
                  Doctor
                </h3>
                <p className="text-slate-900">Dr. {appointment.doctor?.name}</p>
                <p className="text-sm text-slate-600">{appointment.doctor?.specialization}</p>
              </Card>

              <Card>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <Clock size={18} />
                  Duration
                </h3>
                <p className="text-2xl font-bold text-indigo-600">00:00:00</p>
                <p className="text-sm text-slate-600">Active consultation</p>
              </Card>

              <Card>
                <h3 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">
                  <MessageSquare size={18} />
                  Chat
                </h3>
                <p className="text-slate-600">Use the chat button in the video call to send messages</p>
              </Card>
            </div>

            <div className="mt-4 flex justify-center">
              <Button
                onClick={handleEndCallClick}
                variant="danger"
                size="lg"
                className="px-8"
              >
                <PhoneOff className="mr-2" size={20} />
                End Consultation
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* End Call Modal */}
      <Modal
        isOpen={showEndCallModal}
        onClose={() => !endingCall && setShowEndCallModal(false)}
        title="End Consultation"
      >
        <div className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Are you sure you want to end this consultation? This action cannot be undone.
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Consultation Notes (Optional)
            </label>
            <textarea
              value={consultationNotes}
              onChange={(e) => setConsultationNotes(e.target.value)}
              rows={3}
              placeholder="Add any notes from the consultation..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Rate Your Experience
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setFeedback({ ...feedback, rating: star })}
                  className={`text-3xl ${
                    star <= feedback.rating ? 'text-yellow-400' : 'text-slate-300'
                  } hover:text-yellow-400 transition-colors`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback.comment}
              onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
              rows={3}
              placeholder="How was your experience?"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              onClick={() => setShowEndCallModal(false)}
              variant="outline"
              disabled={endingCall}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={submitCallFeedback}
              disabled={endingCall}
              className="flex-1"
            >
              {endingCall ? 'Ending...' : 'End & Submit'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VideoConsultation;
