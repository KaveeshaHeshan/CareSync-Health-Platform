import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Monitor,
  User,
  Calendar,
  Clock,
  FileText,
  CheckCircle,
  AlertCircle,
  XCircle,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  ArrowLeft,
  HelpCircle,
  Speaker
} from 'lucide-react';
import appointmentApi from '../../api/appointmentApi';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Badge from '../../components/ui/Badge';

const WaitingRoom = () => {
  const { appointmentId } = useParams();
  const navigate = useNavigate();
  
  // State management
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Device states
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [speakerEnabled, setSpeakerEnabled] = useState(true);
  
  // Test states
  const [cameraTest, setCameraTest] = useState({ status: 'pending', message: '' }); // pending, testing, passed, failed
  const [microphoneTest, setMicrophoneTest] = useState({ status: 'pending', message: '' });
  const [speakerTest, setSpeakerTest] = useState({ status: 'pending', message: '' });
  const [connectionTest, setConnectionTest] = useState({ status: 'pending', quality: '', message: '' });
  
  // Device lists
  const [devices, setDevices] = useState({ 
    cameras: [], 
    microphones: [], 
    speakers: [] 
  });
  const [selectedDevices, setSelectedDevices] = useState({
    camera: '',
    microphone: '',
    speaker: ''
  });
  
  // Audio level
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Ready state
  const [allTestsPassed, setAllTestsPassed] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  
  // Refs
  const videoPreviewRef = useRef(null);
  const localStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const audioCheckIntervalRef = useRef(null);
  const testAudioRef = useRef(null);

  useEffect(() => {
    fetchAppointment();
    return cleanup;
  }, [appointmentId]);

  useEffect(() => {
    // Check if all tests passed
    const allPassed = 
      cameraTest.status === 'passed' && 
      microphoneTest.status === 'passed' && 
      speakerTest.status === 'passed' && 
      (connectionTest.status === 'passed' || connectionTest.quality === 'good' || connectionTest.quality === 'fair');
    
    setAllTestsPassed(allPassed);
  }, [cameraTest, microphoneTest, speakerTest, connectionTest]);

  const cleanup = () => {
    // Stop all streams and intervals
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (audioCheckIntervalRef.current) {
      clearInterval(audioCheckIntervalRef.current);
    }
  };

  const fetchAppointment = async () => {
    try {
      setLoading(true);
      const response = await appointmentApi.getAppointmentById(appointmentId);
      setAppointment(response.appointment);
      
      // Validate appointment
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
      
      // Auto-start tests after loading appointment
      setTimeout(() => {
        runAllTests();
      }, 500);
      
    } catch (error) {
      console.error('Error fetching appointment:', error);
      alert('Failed to load appointment details');
      navigate('/patient/appointments');
    } finally {
      setLoading(false);
    }
  };

  const runAllTests = async () => {
    await testCamera();
    await testMicrophone();
    await testSpeaker();
    await testConnection();
  };

  const testCamera = async () => {
    setCameraTest({ status: 'testing', message: 'Testing camera...' });
    
    try {
      // Request camera permission and enumerate devices
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: false 
      });
      
      // Get all video devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const cameras = allDevices.filter(device => device.kind === 'videoinput');
      
      setDevices(prev => ({ ...prev, cameras }));
      
      if (cameras.length > 0) {
        setSelectedDevices(prev => ({ ...prev, camera: cameras[0].deviceId }));
      }
      
      // Show preview
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      
      localStreamRef.current = stream;
      
      setCameraTest({ 
        status: 'passed', 
        message: `Camera working! ${cameras.length} device(s) found.` 
      });
      
    } catch (error) {
      console.error('Camera test failed:', error);
      setCameraTest({ 
        status: 'failed', 
        message: error.name === 'NotAllowedError' 
          ? 'Camera permission denied. Please allow access.' 
          : 'Camera not accessible. Check if it\'s being used by another app.' 
      });
      setVideoEnabled(false);
    }
  };

  const testMicrophone = async () => {
    setMicrophoneTest({ status: 'testing', message: 'Testing microphone...' });
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: false, 
        audio: true 
      });
      
      // Get all audio input devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const microphones = allDevices.filter(device => device.kind === 'audioinput');
      
      setDevices(prev => ({ ...prev, microphones }));
      
      if (microphones.length > 0) {
        setSelectedDevices(prev => ({ ...prev, microphone: microphones[0].deviceId }));
      }
      
      // Setup audio level detection
      setupAudioLevelDetection(stream);
      
      setMicrophoneTest({ 
        status: 'passed', 
        message: `Microphone working! ${microphones.length} device(s) found. Speak to see audio levels.` 
      });
      
    } catch (error) {
      console.error('Microphone test failed:', error);
      setMicrophoneTest({ 
        status: 'failed', 
        message: error.name === 'NotAllowedError'
          ? 'Microphone permission denied. Please allow access.'
          : 'Microphone not accessible.' 
      });
      setAudioEnabled(false);
    }
  };

  const setupAudioLevelDetection = (stream) => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      // Check audio level periodically
      audioCheckIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        setAudioLevel(Math.min(100, Math.round(average)));
      }, 100);
      
    } catch (error) {
      console.error('Audio level detection setup failed:', error);
    }
  };

  const testSpeaker = async () => {
    setSpeakerTest({ status: 'testing', message: 'Testing speaker...' });
    
    try {
      // Get all audio output devices
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const speakers = allDevices.filter(device => device.kind === 'audiooutput');
      
      setDevices(prev => ({ ...prev, speakers }));
      
      if (speakers.length > 0) {
        setSelectedDevices(prev => ({ ...prev, speaker: speakers[0].deviceId }));
      }
      
      setSpeakerTest({ 
        status: 'passed', 
        message: `Speaker detected! ${speakers.length} device(s) found. Click "Play Test Sound" to verify.` 
      });
      
    } catch (error) {
      console.error('Speaker test failed:', error);
      setSpeakerTest({ 
        status: 'failed', 
        message: 'Unable to detect speakers.' 
      });
    }
  };

  const playTestSound = () => {
    // Play a test beep sound
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.value = 440; // A4 note
    gainNode.gain.value = 0.3;
    
    oscillator.start();
    setTimeout(() => oscillator.stop(), 500);
  };

  const testConnection = async () => {
    setConnectionTest({ status: 'testing', quality: '', message: 'Testing connection...' });
    
    try {
      // Check using Navigator.connection API
      if (navigator.connection) {
        const connection = navigator.connection;
        const effectiveType = connection.effectiveType;
        const downlink = connection.downlink; // Mbps
        
        let quality = 'good';
        let message = 'Excellent connection for video calls';
        
        if (effectiveType === '4g' || (downlink && downlink >= 5)) {
          quality = 'good';
          message = 'Excellent connection for video calls';
        } else if (effectiveType === '3g' || (downlink && downlink >= 1.5)) {
          quality = 'fair';
          message = 'Good connection, but may have occasional lag';
        } else {
          quality = 'poor';
          message = 'Slow connection. Video quality may be affected';
        }
        
        setConnectionTest({ 
          status: quality === 'poor' ? 'failed' : 'passed', 
          quality, 
          message 
        });
      } else {
        // Fallback: assume good connection if API not available
        setConnectionTest({ 
          status: 'passed', 
          quality: 'good', 
          message: 'Connection appears stable' 
        });
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionTest({ 
        status: 'passed', 
        quality: 'good', 
        message: 'Unable to determine connection quality' 
      });
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

  const handleJoinConsultation = () => {
    if (!allTestsPassed) {
      const confirm = window.confirm('Some tests have not passed. Are you sure you want to continue?');
      if (!confirm) return;
    }
    
    // Navigate to video consultation page
    navigate(`/patient/video-consultation/${appointmentId}`);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="text-slate-400" size={20} />;
      case 'testing':
        return <RefreshCw className="text-blue-600 animate-spin" size={20} />;
      case 'passed':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'failed':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return null;
    }
  };

  const getConnectionIcon = () => {
    if (connectionTest.status === 'testing') {
      return <RefreshCw className="text-blue-600 animate-spin" size={20} />;
    }
    
    switch (connectionTest.quality) {
      case 'good':
        return <Wifi className="text-green-600" size={20} />;
      case 'fair':
        return <Wifi className="text-yellow-600" size={20} />;
      case 'poor':
        return <WifiOff className="text-red-600" size={20} />;
      default:
        return <Wifi className="text-slate-400" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading waiting room...</p>
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
                <h1 className="text-2xl font-bold text-slate-900">Waiting Room</h1>
                <p className="text-sm text-slate-600">
                  Test your setup before joining the consultation
                </p>
              </div>
            </div>
            <Badge variant={allTestsPassed ? 'success' : 'warning'}>
              {allTestsPassed ? 'Ready to Join' : 'Setup Required'}
            </Badge>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Video Preview & Controls */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Preview */}
            <Card className="overflow-hidden">
              <div className="bg-slate-900 relative" style={{ height: '400px' }}>
                {cameraTest.status === 'testing' ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-white">
                      <RefreshCw className="animate-spin mx-auto mb-4" size={48} />
                      <p className="text-lg">Testing camera...</p>
                    </div>
                  </div>
                ) : videoEnabled && cameraTest.status === 'passed' ? (
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
                      <p className="text-lg">
                        {cameraTest.status === 'failed' ? 'Camera not available' : 'Camera is off'}
                      </p>
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
                    disabled={microphoneTest.status !== 'passed'}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                      audioEnabled 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
                  </button>

                  <button
                    onClick={toggleVideo}
                    disabled={cameraTest.status !== 'passed'}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${
                      videoEnabled 
                        ? 'bg-slate-700 hover:bg-slate-600 text-white' 
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
                  </button>
                </div>
              </div>

              {/* Audio Level Indicator */}
              {microphoneTest.status === 'passed' && (
                <div className="p-4 bg-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-slate-700">Microphone Level</span>
                    <span className="text-sm text-slate-600">{audioLevel}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-150 ${
                        audioLevel > 70 ? 'bg-green-600' : 
                        audioLevel > 30 ? 'bg-yellow-600' : 
                        'bg-slate-400'
                      }`}
                      style={{ width: `${audioLevel}%` }}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Speak to see your microphone level
                  </p>
                </div>
              )}
            </Card>

            {/* System Check Results */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                  <Settings size={20} />
                  System Check
                </h3>
                <Button
                  onClick={runAllTests}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw size={16} className="mr-1" />
                  Retest All
                </Button>
              </div>

              <div className="space-y-4">
                {/* Camera Test */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">{getStatusIcon(cameraTest.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Video size={16} className="text-slate-600" />
                      <span className="font-medium text-slate-900">Camera</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{cameraTest.message}</p>
                    {devices.cameras.length > 1 && (
                      <select
                        value={selectedDevices.camera}
                        onChange={(e) => setSelectedDevices(prev => ({ ...prev, camera: e.target.value }))}
                        className="mt-2 text-sm w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {devices.cameras.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Camera ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Microphone Test */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">{getStatusIcon(microphoneTest.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Mic size={16} className="text-slate-600" />
                      <span className="font-medium text-slate-900">Microphone</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{microphoneTest.message}</p>
                    {devices.microphones.length > 1 && (
                      <select
                        value={selectedDevices.microphone}
                        onChange={(e) => setSelectedDevices(prev => ({ ...prev, microphone: e.target.value }))}
                        className="mt-2 text-sm w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        {devices.microphones.map((device, idx) => (
                          <option key={device.deviceId} value={device.deviceId}>
                            {device.label || `Microphone ${idx + 1}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Speaker Test */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">{getStatusIcon(speakerTest.status)}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Speaker size={16} className="text-slate-600" />
                      <span className="font-medium text-slate-900">Speaker</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{speakerTest.message}</p>
                    {speakerTest.status === 'passed' && (
                      <button
                        onClick={playTestSound}
                        className="mt-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Play Test Sound
                      </button>
                    )}
                  </div>
                </div>

                {/* Connection Test */}
                <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                  <div className="flex-shrink-0">{getConnectionIcon()}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Monitor size={16} className="text-slate-600" />
                      <span className="font-medium text-slate-900">Internet Connection</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{connectionTest.message}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Troubleshooting */}
            <Card className="bg-blue-50 border-blue-200">
              <button
                onClick={() => setShowTroubleshooting(!showTroubleshooting)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-2 text-blue-900">
                  <HelpCircle size={20} />
                  <span className="font-semibold">Having trouble?</span>
                </div>
                <span className="text-blue-600">{showTroubleshooting ? '−' : '+'}</span>
              </button>
              
              {showTroubleshooting && (
                <div className="mt-4 space-y-3 text-sm text-blue-800">
                  <div>
                    <p className="font-medium mb-1">Camera not working:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Check if another app is using your camera</li>
                      <li>Restart your browser and try again</li>
                      <li>Check browser permissions for camera access</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Microphone not working:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Check if your microphone is muted</li>
                      <li>Select the correct microphone from the dropdown</li>
                      <li>Check browser permissions for microphone access</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium mb-1">Poor connection:</p>
                    <ul className="list-disc list-inside space-y-1 ml-2">
                      <li>Move closer to your Wi-Fi router</li>
                      <li>Close other apps using internet</li>
                      <li>Consider using a wired connection</li>
                    </ul>
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Right Column - Appointment Details & Tips */}
          <div className="space-y-6">
            {/* Appointment Info */}
            <Card>
              <h3 className="font-semibold text-slate-900 mb-4">Consultation Details</h3>
              
              {/* Doctor Info */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-200">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                  {appointment.doctor?.name?.charAt(0) || 'D'}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">Dr. {appointment.doctor?.name}</p>
                  <p className="text-sm text-slate-600">{appointment.doctor?.specialization}</p>
                </div>
              </div>

              {/* Appointment Details */}
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
              onClick={handleJoinConsultation}
              disabled={!allTestsPassed && (cameraTest.status === 'testing' || microphoneTest.status === 'testing')}
              className="w-full py-4 text-lg"
            >
              <Video className="mr-2" size={24} />
              {allTestsPassed ? 'Join Consultation' : 'Join Anyway'}
            </Button>

            {/* Tips */}
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
              <h3 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                <CheckCircle size={20} />
                Tips for a Great Call
              </h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Find a quiet, well-lit location</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Position camera at eye level</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Use headphones to reduce echo</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Have your medical records ready</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <span>Close unnecessary apps/tabs</span>
                </li>
              </ul>
            </Card>

            {/* Emergency Notice */}
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
      </div>
    </div>
  );
};

export default WaitingRoom;
