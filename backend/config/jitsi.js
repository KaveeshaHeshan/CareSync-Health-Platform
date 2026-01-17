// Jitsi Meet Configuration
const jitsiConfig = {
  domain: process.env.JITSI_DOMAIN || 'meet.jit.si',
  appId: process.env.JITSI_APP_ID,
  apiKey: process.env.JITSI_API_KEY,
  
  // Default meeting options
  defaultOptions: {
    roomName: '',
    width: '100%',
    height: '100vh',
    parentNode: undefined,
    configOverwrite: {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      prejoinPageEnabled: false,
      disableModeratorIndicator: true,
      enableClosePage: false,
      enableNoisyMicDetection: true,
      resolution: 720,
      constraints: {
        video: {
          height: { ideal: 720, max: 1080, min: 360 }
        }
      }
    },
    interfaceConfigOverwrite: {
      DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
      SHOW_JITSI_WATERMARK: false,
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
        'tileview'
      ]
    }
  }
};

module.exports = jitsiConfig;
