import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  Monitor,
  MonitorOff,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MessageSquare,
  Users,
  Settings,
  MoreVertical,
  Grid,
  LayoutGrid,
  Camera,
  CameraOff,
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

/**
 * VideoControls Component
 * 
 * Provides interactive controls for video consultation features including:
 * - Audio/Video toggle
 * - Screen sharing
 * - Speaker control
 * - View layouts
 * - Participant list
 * - Chat
 * - End call
 * 
 * @component
 */
const VideoControls = ({
  isAudioMuted = false,
  isVideoMuted = false,
  isScreenSharing = false,
  isSpeakerMuted = false,
  isFullscreen = false,
  showParticipants = false,
  showChat = false,
  participantCount = 1,
  onToggleAudio,
  onToggleVideo,
  onToggleScreenShare,
  onToggleSpeaker,
  onToggleFullscreen,
  onToggleParticipants,
  onToggleChat,
  onToggleSettings,
  onEndCall,
  onToggleLayout,
  disabled = false,
  className = '',
  position = 'bottom', // 'bottom', 'floating', 'top'
  size = 'normal', // 'small', 'normal', 'large'
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [currentLayout, setCurrentLayout] = useState('grid'); // 'grid', 'speaker', 'filmstrip'

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMoreMenu && !event.target.closest('.more-menu-container')) {
        setShowMoreMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  const handleLayoutChange = () => {
    const layouts = ['grid', 'speaker', 'filmstrip'];
    const currentIndex = layouts.indexOf(currentLayout);
    const nextLayout = layouts[(currentIndex + 1) % layouts.length];
    setCurrentLayout(nextLayout);
    onToggleLayout?.(nextLayout);
  };

  const getButtonSize = () => {
    switch (size) {
      case 'small':
        return 'sm';
      case 'large':
        return 'lg';
      default:
        return 'md';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 28;
      default:
        return 22;
    }
  };

  const positionClasses = {
    bottom: 'bottom-6 left-1/2 transform -translate-x-1/2',
    floating: 'bottom-8 left-1/2 transform -translate-x-1/2 shadow-2xl',
    top: 'top-6 left-1/2 transform -translate-x-1/2',
  };

  const iconSize = getIconSize();
  const buttonSize = getButtonSize();

  return (
    <div className={`fixed ${positionClasses[position]} z-50 ${className}`}>
      <Card className="px-4 py-3 bg-slate-800 border-slate-700 shadow-xl">
        <div className="flex items-center gap-2">
          {/* Microphone Control */}
          <Button
            onClick={onToggleAudio}
            variant={isAudioMuted ? 'danger' : 'outline'}
            size={buttonSize}
            disabled={disabled}
            className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105`}
            title={isAudioMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isAudioMuted ? <MicOff size={iconSize} /> : <Mic size={iconSize} />}
          </Button>

          {/* Camera Control */}
          <Button
            onClick={onToggleVideo}
            variant={isVideoMuted ? 'danger' : 'outline'}
            size={buttonSize}
            disabled={disabled}
            className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105`}
            title={isVideoMuted ? 'Turn On Camera' : 'Turn Off Camera'}
          >
            {isVideoMuted ? <VideoOff size={iconSize} /> : <Video size={iconSize} />}
          </Button>

          {/* Screen Share Control */}
          {onToggleScreenShare && (
            <Button
              onClick={onToggleScreenShare}
              variant={isScreenSharing ? 'success' : 'outline'}
              size={buttonSize}
              disabled={disabled}
              className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105`}
              title={isScreenSharing ? 'Stop Sharing Screen' : 'Share Screen'}
            >
              {isScreenSharing ? <MonitorOff size={iconSize} /> : <Monitor size={iconSize} />}
            </Button>
          )}

          {/* Divider */}
          <div className="h-8 w-px bg-slate-600 mx-1" />

          {/* Chat Toggle */}
          {onToggleChat && (
            <Button
              onClick={onToggleChat}
              variant={showChat ? 'primary' : 'outline'}
              size={buttonSize}
              disabled={disabled}
              className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105 relative`}
              title="Toggle Chat"
            >
              <MessageSquare size={iconSize} />
            </Button>
          )}

          {/* Participants Toggle */}
          {onToggleParticipants && (
            <Button
              onClick={onToggleParticipants}
              variant={showParticipants ? 'primary' : 'outline'}
              size={buttonSize}
              disabled={disabled}
              className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105 relative`}
              title="Show Participants"
            >
              <Users size={iconSize} />
              {participantCount > 1 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {participantCount}
                </span>
              )}
            </Button>
          )}

          {/* Layout Toggle */}
          {onToggleLayout && (
            <Button
              onClick={handleLayoutChange}
              variant="outline"
              size={buttonSize}
              disabled={disabled}
              className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105`}
              title={`Current Layout: ${currentLayout}`}
            >
              {currentLayout === 'grid' ? (
                <Grid size={iconSize} />
              ) : (
                <LayoutGrid size={iconSize} />
              )}
            </Button>
          )}

          {/* More Options Menu */}
          <div className="relative more-menu-container">
            <Button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              variant="outline"
              size={buttonSize}
              disabled={disabled}
              className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105`}
              title="More Options"
            >
              <MoreVertical size={iconSize} />
            </Button>

            {/* Dropdown Menu */}
            {showMoreMenu && (
              <div className="absolute bottom-full mb-2 right-0 bg-slate-800 border border-slate-700 rounded-xl shadow-xl min-w-48 py-2 z-50">
                {/* Speaker Control */}
                {onToggleSpeaker && (
                  <button
                    onClick={() => {
                      onToggleSpeaker();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-3 transition-colors"
                  >
                    {isSpeakerMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    <span>{isSpeakerMuted ? 'Unmute Speaker' : 'Mute Speaker'}</span>
                  </button>
                )}

                {/* Fullscreen Control */}
                {onToggleFullscreen && (
                  <button
                    onClick={() => {
                      onToggleFullscreen();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-3 transition-colors"
                  >
                    {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
                    <span>{isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}</span>
                  </button>
                )}

                {/* Settings */}
                {onToggleSettings && (
                  <button
                    onClick={() => {
                      onToggleSettings();
                      setShowMoreMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-white hover:bg-slate-700 flex items-center gap-3 transition-colors"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Divider */}
          <div className="h-8 w-px bg-slate-600 mx-1" />

          {/* End Call */}
          <Button
            onClick={onEndCall}
            variant="danger"
            size={buttonSize}
            disabled={disabled}
            className={`rounded-full ${size === 'large' ? 'w-14 h-14' : size === 'small' ? 'w-10 h-10' : 'w-12 h-12'} flex items-center justify-center transition-all hover:scale-105 bg-red-600 hover:bg-red-700`}
            title="End Call"
          >
            <PhoneOff size={iconSize} />
          </Button>
        </div>
      </Card>

      {/* Control Labels (optional, for accessibility) */}
      {size === 'large' && (
        <div className="flex justify-center gap-2 mt-2">
          <span className="text-xs text-slate-400">
            {isAudioMuted ? 'Mic Off' : 'Mic On'} • {isVideoMuted ? 'Video Off' : 'Video On'}
          </span>
        </div>
      )}
    </div>
  );
};

VideoControls.propTypes = {
  /** Whether audio is muted */
  isAudioMuted: PropTypes.bool,
  
  /** Whether video is muted */
  isVideoMuted: PropTypes.bool,
  
  /** Whether screen is being shared */
  isScreenSharing: PropTypes.bool,
  
  /** Whether speaker is muted */
  isSpeakerMuted: PropTypes.bool,
  
  /** Whether in fullscreen mode */
  isFullscreen: PropTypes.bool,
  
  /** Whether participants panel is shown */
  showParticipants: PropTypes.bool,
  
  /** Whether chat panel is shown */
  showChat: PropTypes.bool,
  
  /** Number of participants in the call */
  participantCount: PropTypes.number,
  
  /** Callback for toggling audio */
  onToggleAudio: PropTypes.func.isRequired,
  
  /** Callback for toggling video */
  onToggleVideo: PropTypes.func.isRequired,
  
  /** Callback for toggling screen share */
  onToggleScreenShare: PropTypes.func,
  
  /** Callback for toggling speaker */
  onToggleSpeaker: PropTypes.func,
  
  /** Callback for toggling fullscreen */
  onToggleFullscreen: PropTypes.func,
  
  /** Callback for toggling participants panel */
  onToggleParticipants: PropTypes.func,
  
  /** Callback for toggling chat panel */
  onToggleChat: PropTypes.func,
  
  /** Callback for opening settings */
  onToggleSettings: PropTypes.func,
  
  /** Callback for ending the call */
  onEndCall: PropTypes.func.isRequired,
  
  /** Callback for changing layout */
  onToggleLayout: PropTypes.func,
  
  /** Whether controls are disabled */
  disabled: PropTypes.bool,
  
  /** Additional CSS classes */
  className: PropTypes.string,
  
  /** Position of controls */
  position: PropTypes.oneOf(['bottom', 'floating', 'top']),
  
  /** Size of controls */
  size: PropTypes.oneOf(['small', 'normal', 'large']),
};

export default VideoControls;

/**
 * Example usage:
 * 
 * import VideoControls from './VideoControls';
 * 
 * const MyVideoCall = () => {
 *   const [isAudioMuted, setIsAudioMuted] = useState(false);
 *   const [isVideoMuted, setIsVideoMuted] = useState(false);
 *   const [isScreenSharing, setIsScreenSharing] = useState(false);
 * 
 *   return (
 *     <div className="relative h-screen">
 *       <VideoControls
 *         isAudioMuted={isAudioMuted}
 *         isVideoMuted={isVideoMuted}
 *         isScreenSharing={isScreenSharing}
 *         participantCount={3}
 *         onToggleAudio={() => setIsAudioMuted(!isAudioMuted)}
 *         onToggleVideo={() => setIsVideoMuted(!isVideoMuted)}
 *         onToggleScreenShare={() => setIsScreenSharing(!isScreenSharing)}
 *         onEndCall={() => console.log('End call')}
 *         position="floating"
 *         size="normal"
 *       />
 *     </div>
 *   );
 * };
 */
