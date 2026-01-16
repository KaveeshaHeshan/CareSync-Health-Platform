import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import Spinner from '../../components/ui/Spinner';

/**
 * JitsiMeeting Component
 * 
 * A reusable wrapper component for embedding Jitsi Meet video conferences.
 * Handles Jitsi External API initialization, configuration, and lifecycle management.
 * 
 * @component
 * @example
 * <JitsiMeeting
 *   roomName="my-unique-room"
 *   userInfo={{ displayName: "John Doe", email: "john@example.com" }}
 *   onReady={() => console.log("Meeting ready")}
 *   onParticipantJoined={(participant) => console.log("Participant joined", participant)}
 * />
 */
const JitsiMeeting = ({
  roomName,
  domain = 'meet.jit.si',
  userInfo = {},
  config = {},
  interfaceConfig = {},
  containerStyle = {},
  onReady,
  onJoined,
  onLeft,
  onParticipantJoined,
  onParticipantLeft,
  onAudioMuteStatusChanged,
  onVideoMuteStatusChanged,
  onScreenSharingStatusChanged,
  onError,
  onReadyToClose,
  password,
  jwt,
  invitees,
}) => {
  const containerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load Jitsi External API script
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://meet.jit.si/external_api.js';
    script.async = true;
    script.onload = () => {
      setScriptLoaded(true);
    };
    script.onerror = () => {
      const errorMsg = 'Failed to load Jitsi Meet library';
      setError(errorMsg);
      onError?.(new Error(errorMsg));
    };

    document.body.appendChild(script);

    return () => {
      // Cleanup: remove script if component unmounts before load
      if (!scriptLoaded) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Initialize Jitsi Meeting
  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !roomName) return;

    const defaultConfig = {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      disableDeepLinking: true,
      enableNoisyMicDetection: true,
      enableClosePage: false,
      disableInviteFunctions: !invitees,
      enableEmailInStats: false,
      ...config,
    };

    const defaultInterfaceConfig = {
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
        'livestreaming',
        'etherpad',
        'sharedvideo',
        'settings',
        'raisehand',
        'videoquality',
        'filmstrip',
        'invite',
        'feedback',
        'stats',
        'shortcuts',
        'tileview',
        'download',
        'help',
        'mute-everyone',
        'security',
      ],
      SETTINGS_SECTIONS: ['devices', 'language', 'moderator', 'profile', 'calendar'],
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      FILM_STRIP_MAX_HEIGHT: 120,
      MOBILE_APP_PROMO: false,
      ...interfaceConfig,
    };

    const options = {
      roomName,
      width: '100%',
      height: '100%',
      parentNode: containerRef.current,
      configOverwrite: defaultConfig,
      interfaceConfigOverwrite: defaultInterfaceConfig,
      userInfo: {
        displayName: userInfo.displayName || 'Guest',
        email: userInfo.email || '',
        ...userInfo,
      },
    };

    // Add JWT token if provided
    if (jwt) {
      options.jwt = jwt;
    }

    // Add password if provided
    if (password) {
      options.roomPassword = password;
    }

    // Add invitees if provided
    if (invitees && invitees.length > 0) {
      options.invitees = invitees;
    }

    try {
      const api = new window.JitsiMeetExternalAPI(domain, options);
      jitsiApiRef.current = api;

      // Setup event listeners
      api.addEventListener('videoConferenceJoined', handleConferenceJoined);
      api.addEventListener('videoConferenceLeft', handleConferenceLeft);
      api.addEventListener('participantJoined', handleParticipantJoined);
      api.addEventListener('participantLeft', handleParticipantLeft);
      api.addEventListener('audioMuteStatusChanged', handleAudioMuteStatusChanged);
      api.addEventListener('videoMuteStatusChanged', handleVideoMuteStatusChanged);
      api.addEventListener('screenSharingStatusChanged', handleScreenSharingStatusChanged);
      api.addEventListener('readyToClose', handleReadyToClose);
      api.addEventListener('errorOccurred', handleError);

      // API ready callback
      if (onReady) {
        api.addEventListener('videoConferenceJoined', () => {
          setLoading(false);
          onReady(api);
        });
      } else {
        api.addEventListener('videoConferenceJoined', () => {
          setLoading(false);
        });
      }
    } catch (err) {
      console.error('Error initializing Jitsi Meet:', err);
      setError('Failed to initialize video meeting');
      onError?.(err);
      setLoading(false);
    }

    // Cleanup function
    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [scriptLoaded, roomName, domain, password, jwt]);

  // Event handlers
  const handleConferenceJoined = (event) => {
    console.log('Conference joined:', event);
    onJoined?.(event);
  };

  const handleConferenceLeft = (event) => {
    console.log('Conference left:', event);
    onLeft?.(event);
  };

  const handleParticipantJoined = (event) => {
    console.log('Participant joined:', event);
    onParticipantJoined?.(event);
  };

  const handleParticipantLeft = (event) => {
    console.log('Participant left:', event);
    onParticipantLeft?.(event);
  };

  const handleAudioMuteStatusChanged = (event) => {
    console.log('Audio mute status changed:', event);
    onAudioMuteStatusChanged?.(event);
  };

  const handleVideoMuteStatusChanged = (event) => {
    console.log('Video mute status changed:', event);
    onVideoMuteStatusChanged?.(event);
  };

  const handleScreenSharingStatusChanged = (event) => {
    console.log('Screen sharing status changed:', event);
    onScreenSharingStatusChanged?.(event);
  };

  const handleReadyToClose = () => {
    console.log('Ready to close');
    onReadyToClose?.();
  };

  const handleError = (event) => {
    console.error('Jitsi error:', event);
    onError?.(event);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-slate-900 text-white">
        <div className="text-center p-8">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h3 className="text-lg font-semibold mb-2">Video Meeting Error</h3>
          <p className="text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full" style={containerStyle}>
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900 z-10">
          <div className="text-center">
            <Spinner size="lg" className="mx-auto mb-4 text-white" />
            <p className="text-white text-lg">Connecting to meeting...</p>
          </div>
        </div>
      )}

      {/* Jitsi container */}
      <div
        ref={containerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

JitsiMeeting.propTypes = {
  /** Unique room name for the meeting */
  roomName: PropTypes.string.isRequired,

  /** Jitsi server domain (default: meet.jit.si) */
  domain: PropTypes.string,

  /** User information to display in the meeting */
  userInfo: PropTypes.shape({
    displayName: PropTypes.string,
    email: PropTypes.string,
    avatarURL: PropTypes.string,
  }),

  /** Jitsi config overrides */
  config: PropTypes.object,

  /** Jitsi interface config overrides */
  interfaceConfig: PropTypes.object,

  /** Custom styles for the container */
  containerStyle: PropTypes.object,

  /** Callback when API is ready and conference is joined */
  onReady: PropTypes.func,

  /** Callback when user joins the conference */
  onJoined: PropTypes.func,

  /** Callback when user leaves the conference */
  onLeft: PropTypes.func,

  /** Callback when a participant joins */
  onParticipantJoined: PropTypes.func,

  /** Callback when a participant leaves */
  onParticipantLeft: PropTypes.func,

  /** Callback when audio mute status changes */
  onAudioMuteStatusChanged: PropTypes.func,

  /** Callback when video mute status changes */
  onVideoMuteStatusChanged: PropTypes.func,

  /** Callback when screen sharing status changes */
  onScreenSharingStatusChanged: PropTypes.func,

  /** Callback when an error occurs */
  onError: PropTypes.func,

  /** Callback when ready to close (hangup clicked) */
  onReadyToClose: PropTypes.func,

  /** Room password (optional) */
  password: PropTypes.string,

  /** JWT token for authentication (optional) */
  jwt: PropTypes.string,

  /** Array of invitees (optional) */
  invitees: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
      email: PropTypes.string,
    })
  ),
};

export default JitsiMeeting;

// Export helper functions for external control
export const getJitsiAPI = (ref) => ref.current;

/**
 * Helper function to execute Jitsi commands
 * @param {Object} api - Jitsi API instance
 * @param {string} command - Command name
 * @param  {...any} args - Command arguments
 */
export const executeCommand = (api, command, ...args) => {
  if (api && typeof api.executeCommand === 'function') {
    api.executeCommand(command, ...args);
  }
};

/**
 * Common Jitsi commands
 */
export const JitsiCommands = {
  TOGGLE_AUDIO: 'toggleAudio',
  TOGGLE_VIDEO: 'toggleVideo',
  TOGGLE_FILM_STRIP: 'toggleFilmStrip',
  TOGGLE_CHAT: 'toggleChat',
  TOGGLE_SHARE_SCREEN: 'toggleShareScreen',
  TOGGLE_TILE_VIEW: 'toggleTileView',
  HANG_UP: 'hangup',
  SET_VIDEO_QUALITY: 'setVideoQuality',
  MUTE_EVERYONE: 'muteEveryone',
  START_RECORDING: 'startRecording',
  STOP_RECORDING: 'stopRecording',
  SET_LARGE_VIDEO_PARTICIPANT: 'setLargeVideoParticipant',
  SET_DISPLAY_NAME: 'displayName',
  SET_SUBJECT: 'subject',
  SET_EMAIL: 'email',
  SET_AVATAR_URL: 'avatarUrl',
};

/**
 * Example usage in a parent component:
 * 
 * import JitsiMeeting, { JitsiCommands, executeCommand } from './JitsiMeeting';
 * 
 * const MyVideoCall = () => {
 *   const jitsiRef = useRef(null);
 * 
 *   const handleMuteAudio = () => {
 *     if (jitsiRef.current) {
 *       executeCommand(jitsiRef.current, JitsiCommands.TOGGLE_AUDIO);
 *     }
 *   };
 * 
 *   return (
 *     <JitsiMeeting
 *       roomName="my-room-123"
 *       userInfo={{ displayName: "John Doe" }}
 *       onReady={(api) => { jitsiRef.current = api; }}
 *       onParticipantJoined={(participant) => console.log(participant)}
 *     />
 *   );
 * };
 */
