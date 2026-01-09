import React, { useEffect, useRef, useState } from 'react';
import { Video, VideoOff, Mic, MicOff, PhoneOff, Maximize, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button';

const JitsiVideoContainer = ({ roomName, userName, onClose }) => {
  const jitsiContainerRef = useRef(null);
  const [api, setApi] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Load the Jitsi External API Script
    const loadJitsiScript = () => {
      return new Promise((resolve) => {
        if (window.JitsiMeetExternalAPI) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = 'https://meet.jit.si/external_api.js';
        script.async = true;
        script.onload = resolve;
        document.body.appendChild(script);
      });
    };

    const initJitsi = async () => {
      await loadJitsiScript();

      const domain = 'meet.jit.si';
      const options = {
        roomName: roomName || `CareSync-Consult-${Math.random().toString(36).substring(7)}`,
        parentNode: jitsiContainerRef.current,
        userInfo: {
          displayName: userName || 'CareSync User'
        },
        configOverwrite: {
          startWithAudioMuted: true,
          disableDeepLinking: true,
          prejoinPageEnabled: false,
          enableWelcomePage: false,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
            'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
            'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
            'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
            'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
            'security'
          ],
        },
      };

      const jitsiApi = new window.JitsiMeetExternalAPI(domain, options);
      
      jitsiApi.addEventListeners({
        videoConferenceJoined: () => setIsLoading(false),
        videoConferenceLeft: () => onClose(),
        readyToClose: () => onClose(),
      });

      setApi(jitsiApi);
    };

    initJitsi();

    // Cleanup on unmount
    return () => {
      if (api) api.dispose();
    };
  }, [roomName, userName, onClose]);

  return (
    <div className="relative w-full h-full min-h-[500px] bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-800">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-slate-900 text-white">
          <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
          <h3 className="text-lg font-bold">Securing Connection...</h3>
          <p className="text-slate-400 text-sm">Initializing encrypted video bridge</p>
        </div>
      )}

      {/* The Jitsi Iframe Container */}
      <div ref={jitsiContainerRef} className="w-full h-full" />

      {/* Custom CareSync Controls (Optional Overlays) */}
      {!isLoading && (
        <div className="absolute top-6 left-6 z-10">
          <div className="bg-emerald-500/90 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2 border border-emerald-400/50">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Live Consultation</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default JitsiVideoContainer;