import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Monitor,
  MonitorOff,
  MonitorPlay,
  Square,
  Chrome,
  Maximize2,
  Volume2,
  VolumeX,
  Settings,
  Video,
  Zap,
  AlertCircle,
  Check,
  X,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

/**
 * ScreenShare Component
 * 
 * Handles screen sharing functionality in video consultations.
 * Supports selecting different screen sources, quality settings, and audio sharing.
 * 
 * @component
 */
const ScreenShare = ({
  jitsiApi,
  isSharing = false,
  onStartSharing,
  onStopSharing,
  currentSharer = null,
  allowScreenShare = true,
  showControls = true,
  className = '',
}) => {
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [shareAudio, setShareAudio] = useState(false);
  const [quality, setQuality] = useState('standard'); // 'low', 'standard', 'high'
  const [selectedSource, setSelectedSource] = useState(null);
  const [availableSources, setAvailableSources] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const streamRef = useRef(null);

  // Source type icons mapping
  const sourceIcons = {
    screen: Monitor,
    window: Square,
    tab: Chrome,
  };

  // Check if screen sharing is supported
  useEffect(() => {
    const checkSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        setError('Screen sharing is not supported in your browser');
      }
    };
    
    checkSupport();
  }, []);

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Get available screen sources
  const getAvailableSources = async () => {
    // Note: Browser's native picker will show all sources
    // We're providing a pre-selection UI
    const sources = [
      {
        id: 'entire-screen',
        type: 'screen',
        name: 'Entire Screen',
        description: 'Share your entire screen',
        recommended: false,
      },
      {
        id: 'window',
        type: 'window',
        name: 'Application Window',
        description: 'Share a specific window',
        recommended: true,
      },
      {
        id: 'tab',
        type: 'tab',
        name: 'Browser Tab',
        description: 'Share a browser tab',
        recommended: false,
      },
    ];
    
    setAvailableSources(sources);
  };

  const handleStartScreenShare = async () => {
    setShowSourcePicker(true);
    await getAvailableSources();
  };

  const handleSourceSelect = async (source) => {
    setSelectedSource(source);
    setIsLoading(true);
    setError(null);

    try {
      // Get display media with constraints
      const constraints = {
        video: {
          ...getQualityConstraints(quality),
          displaySurface: source.type === 'screen' ? 'monitor' : 
                         source.type === 'window' ? 'window' : 'browser',
        },
        audio: shareAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        } : false,
      };

      const stream = await navigator.mediaDevices.getDisplayMedia(constraints);
      streamRef.current = stream;

      // Handle stream ending (when user clicks browser's stop button)
      stream.getVideoTracks()[0].addEventListener('ended', () => {
        handleStopScreenShare();
      });

      // Use Jitsi API to share screen if available
      if (jitsiApi) {
        await jitsiApi.executeCommand('toggleShareScreen');
      }

      onStartSharing?.({
        source: source.type,
        quality,
        hasAudio: shareAudio,
        stream,
      });

      setShowSourcePicker(false);
      setIsLoading(false);
    } catch (err) {
      console.error('Screen sharing error:', err);
      
      let errorMessage = 'Failed to start screen sharing';
      if (err.name === 'NotAllowedError') {
        errorMessage = 'Screen sharing permission denied';
      } else if (err.name === 'NotFoundError') {
        errorMessage = 'No screen source selected';
      } else if (err.name === 'NotSupportedError') {
        errorMessage = 'Screen sharing not supported';
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const handleStopScreenShare = async () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (jitsiApi && isSharing) {
      await jitsiApi.executeCommand('toggleShareScreen');
    }

    onStopSharing?.();
    setSelectedSource(null);
  };

  const getQualityConstraints = (qualityLevel) => {
    switch (qualityLevel) {
      case 'high':
        return {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 },
        };
      case 'standard':
        return {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 15 },
        };
      case 'low':
        return {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 10 },
        };
      default:
        return {};
    }
  };

  const handleQualityChange = (newQuality) => {
    setQuality(newQuality);
    
    // If already sharing, need to restart with new quality
    if (isSharing) {
      const confirmRestart = window.confirm(
        'Changing quality requires restarting screen share. Continue?'
      );
      if (confirmRestart) {
        handleStopScreenShare();
        // User needs to start again with new quality
      }
    }
  };

  if (!allowScreenShare) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <div className="text-slate-500 text-sm flex items-center gap-2">
          <AlertCircle size={18} />
          <span>Screen sharing is not available</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`${className}`}>
        {/* Screen Share Controls */}
        {showControls && (
          <div className="flex items-center gap-3">
            {!isSharing ? (
              <>
                {/* Start Screen Share Button */}
                <Button
                  onClick={handleStartScreenShare}
                  variant="primary"
                  className="flex items-center gap-2"
                  disabled={!!currentSharer}
                >
                  <MonitorPlay size={20} />
                  <span>Share Screen</span>
                </Button>

                {/* Settings Button */}
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="ghost"
                  className="p-2"
                  title="Screen share settings"
                >
                  <Settings size={20} />
                </Button>
              </>
            ) : (
              <>
                {/* Stop Screen Share Button */}
                <Button
                  onClick={handleStopScreenShare}
                  variant="error"
                  className="flex items-center gap-2"
                >
                  <MonitorOff size={20} />
                  <span>Stop Sharing</span>
                </Button>

                {/* Sharing Indicator */}
                <Badge variant="success" className="flex items-center gap-2 px-3 py-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span>Sharing Screen</span>
                </Badge>
              </>
            )}
          </div>
        )}

        {/* Current Sharer Indicator */}
        {currentSharer && currentSharer !== 'self' && (
          <div className="mt-3">
            <Badge variant="info" className="flex items-center gap-2">
              <Monitor size={16} />
              <span>{currentSharer} is sharing their screen</span>
            </Badge>
          </div>
        )}

        {/* Settings Panel */}
        {showSettings && !isSharing && (
          <Card className="mt-3 p-4 space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Settings size={18} />
              Screen Share Settings
            </h4>

            {/* Quality Settings */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Quality
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'low', label: 'Low', icon: Zap, desc: '480p • Less data' },
                  { value: 'standard', label: 'Standard', icon: Video, desc: '720p • Balanced' },
                  { value: 'high', label: 'High', icon: Maximize2, desc: '1080p • Best quality' },
                ].map((option) => {
                  const Icon = option.icon;
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleQualityChange(option.value)}
                      className={`p-3 border-2 rounded-lg text-left transition-all ${
                        quality === option.value
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <Icon size={16} className={quality === option.value ? 'text-indigo-600' : 'text-slate-600'} />
                        <span className="font-medium text-sm">{option.label}</span>
                      </div>
                      <p className="text-xs text-slate-500">{option.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Audio Sharing */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="shareAudio"
                checked={shareAudio}
                onChange={(e) => setShareAudio(e.target.checked)}
                className="mt-1 w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <div className="flex-1">
                <label htmlFor="shareAudio" className="font-medium text-sm text-slate-900 cursor-pointer flex items-center gap-2">
                  {shareAudio ? <Volume2 size={16} /> : <VolumeX size={16} />}
                  Share System Audio
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Include audio from your computer (videos, music, etc.)
                </p>
              </div>
            </div>

            {/* Quality Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium mb-1">Quality Tips:</p>
                  <ul className="space-y-1 list-disc list-inside">
                    <li><strong>High:</strong> Best for sharing documents and presentations</li>
                    <li><strong>Standard:</strong> Good balance for most use cases</li>
                    <li><strong>Low:</strong> Use with slow internet connections</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm text-red-800 font-medium">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-red-600 hover:text-red-700 mt-1 underline"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Source Picker Modal */}
      <Modal
        isOpen={showSourcePicker}
        onClose={() => setShowSourcePicker(false)}
        title="Choose What to Share"
        maxWidth="2xl"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Select what you'd like to share with other participants
          </p>

          {/* Source Options */}
          <div className="grid grid-cols-1 gap-3">
            {availableSources.map((source) => {
              const Icon = sourceIcons[source.type] || Monitor;
              
              return (
                <button
                  key={source.id}
                  onClick={() => handleSourceSelect(source)}
                  disabled={isLoading}
                  className={`p-4 border-2 rounded-xl text-left transition-all hover:border-indigo-300 hover:shadow-md ${
                    selectedSource?.id === source.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-slate-200'
                  } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-lg ${
                      selectedSource?.id === source.id
                        ? 'bg-indigo-100'
                        : 'bg-slate-100'
                    }`}>
                      <Icon size={24} className={
                        selectedSource?.id === source.id
                          ? 'text-indigo-600'
                          : 'text-slate-600'
                      } />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-slate-900">{source.name}</h4>
                        {source.recommended && (
                          <Badge variant="success" className="text-xs">
                            Recommended
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-600">{source.description}</p>
                    </div>

                    {selectedSource?.id === source.id && (
                      <Check size={20} className="text-indigo-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Current Settings Display */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-2">
            <p className="text-xs font-medium text-slate-700 uppercase">Current Settings</p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="info" className="text-xs">
                Quality: {quality}
              </Badge>
              <Badge variant={shareAudio ? 'success' : 'default'} className="text-xs">
                {shareAudio ? 'Audio: On' : 'Audio: Off'}
              </Badge>
            </div>
          </div>

          {/* Browser Permission Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-blue-800">
                After selecting an option, your browser will show a popup to choose the specific screen, window, or tab to share.
              </p>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
                <span className="text-sm text-slate-600">Starting screen share...</span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={() => setShowSourcePicker(false)}
              variant="ghost"
              disabled={isLoading}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

ScreenShare.propTypes = {
  /** Jitsi API instance for controlling screen share */
  jitsiApi: PropTypes.object,

  /** Whether currently sharing screen */
  isSharing: PropTypes.bool,

  /** Callback when screen sharing starts */
  onStartSharing: PropTypes.func,

  /** Callback when screen sharing stops */
  onStopSharing: PropTypes.func,

  /** Name of current sharer (null if no one sharing, 'self' if current user) */
  currentSharer: PropTypes.string,

  /** Whether screen sharing is allowed */
  allowScreenShare: PropTypes.bool,

  /** Whether to show control buttons */
  showControls: PropTypes.bool,

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ScreenShare;

/**
 * Example usage:
 * 
 * import ScreenShare from './ScreenShare';
 * 
 * const MyVideoCall = () => {
 *   const [isSharing, setIsSharing] = useState(false);
 *   const [currentSharer, setCurrentSharer] = useState(null);
 *   const jitsiApiRef = useRef(null);
 * 
 *   const handleStartSharing = (shareInfo) => {
 *     console.log('Started sharing:', shareInfo);
 *     setIsSharing(true);
 *     setCurrentSharer('self');
 *   };
 * 
 *   const handleStopSharing = () => {
 *     console.log('Stopped sharing');
 *     setIsSharing(false);
 *     setCurrentSharer(null);
 *   };
 * 
 *   return (
 *     <div>
 *       <ScreenShare
 *         jitsiApi={jitsiApiRef.current}
 *         isSharing={isSharing}
 *         onStartSharing={handleStartSharing}
 *         onStopSharing={handleStopSharing}
 *         currentSharer={currentSharer}
 *         allowScreenShare={true}
 *         showControls={true}
 *       />
 *     </div>
 *   );
 * };
 */
