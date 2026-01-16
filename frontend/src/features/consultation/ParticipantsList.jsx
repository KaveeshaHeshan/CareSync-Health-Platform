import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Users,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Monitor,
  Hand,
  Crown,
  UserX,
  Volume2,
  VolumeX,
  MoreVertical,
  Pin,
  MessageSquare,
  UserPlus,
  X,
  Search,
  Shield,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

/**
 * ParticipantsList Component
 * 
 * Displays a list of participants in a video consultation with their status,
 * including audio/video state, screen sharing, and participant actions.
 * 
 * @component
 */
const ParticipantsList = ({
  participants = [],
  currentUserId,
  isModerator = false,
  onMuteParticipant,
  onRemoveParticipant,
  onPinParticipant,
  onSendMessage,
  onMakeModerator,
  onClose,
  showActions = true,
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredParticipants, setFilteredParticipants] = useState(participants);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [showActionsMenu, setShowActionsMenu] = useState(null);

  // Update filtered participants when search term or participants change
  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = participants.filter(participant =>
        participant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        participant.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredParticipants(filtered);
    } else {
      setFilteredParticipants(participants);
    }
  }, [searchTerm, participants]);

  // Close actions menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionsMenu && !event.target.closest('.actions-menu-container')) {
        setShowActionsMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showActionsMenu]);

  const handleMuteParticipant = (participantId) => {
    onMuteParticipant?.(participantId);
    setShowActionsMenu(null);
  };

  const handleRemoveParticipant = (participantId) => {
    if (window.confirm('Are you sure you want to remove this participant?')) {
      onRemoveParticipant?.(participantId);
      setShowActionsMenu(null);
    }
  };

  const handlePinParticipant = (participantId) => {
    onPinParticipant?.(participantId);
    setShowActionsMenu(null);
  };

  const handleSendMessage = (participantId) => {
    onSendMessage?.(participantId);
    setShowActionsMenu(null);
  };

  const handleMakeModerator = (participantId) => {
    if (window.confirm('Make this participant a moderator?')) {
      onMakeModerator?.(participantId);
      setShowActionsMenu(null);
    }
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getParticipantStats = () => {
    return {
      total: participants.length,
      audioMuted: participants.filter(p => p.isAudioMuted).length,
      videoMuted: participants.filter(p => p.isVideoMuted).length,
      screenSharing: participants.filter(p => p.isScreenSharing).length,
      handRaised: participants.filter(p => p.isHandRaised).length,
    };
  };

  const stats = getParticipantStats();

  return (
    <Card className={`flex flex-col h-full max-h-[600px] ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Users className="text-indigo-600" size={20} />
            <h3 className="text-lg font-semibold text-slate-900">
              Participants ({participants.length})
            </h3>
          </div>
          {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-slate-100 rounded-full"
            >
              <X size={20} />
            </Button>
          )}
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search participants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-2 mt-3">
          {stats.audioMuted > 0 && (
            <Badge variant="warning" className="text-xs flex items-center gap-1">
              <MicOff size={12} />
              {stats.audioMuted} Muted
            </Badge>
          )}
          {stats.videoMuted > 0 && (
            <Badge variant="info" className="text-xs flex items-center gap-1">
              <VideoOff size={12} />
              {stats.videoMuted} Video Off
            </Badge>
          )}
          {stats.screenSharing > 0 && (
            <Badge variant="success" className="text-xs flex items-center gap-1">
              <Monitor size={12} />
              {stats.screenSharing} Sharing
            </Badge>
          )}
          {stats.handRaised > 0 && (
            <Badge variant="error" className="text-xs flex items-center gap-1">
              <Hand size={12} />
              {stats.handRaised} Hand Raised
            </Badge>
          )}
        </div>
      </div>

      {/* Participants List */}
      <div className="flex-1 overflow-y-auto p-2">
        {filteredParticipants.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-8">
            <Users size={48} className="mb-3 opacity-50" />
            <p className="text-sm">
              {searchTerm ? 'No participants found' : 'No participants yet'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredParticipants.map((participant) => (
              <div
                key={participant.id}
                className={`p-3 rounded-xl border transition-all hover:border-indigo-300 hover:shadow-sm ${
                  participant.id === currentUserId
                    ? 'bg-indigo-50 border-indigo-200'
                    : 'bg-white border-slate-200'
                } ${
                  participant.isPinned ? 'ring-2 ring-indigo-500' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${
                        participant.id === currentUserId
                          ? 'bg-indigo-600'
                          : 'bg-slate-500'
                      }`}
                    >
                      {participant.avatarUrl ? (
                        <img
                          src={participant.avatarUrl}
                          alt={participant.name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        getInitials(participant.name)
                      )}
                    </div>
                    {/* Connection Status Indicator */}
                    <div
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                        participant.connectionQuality === 'good'
                          ? 'bg-green-500'
                          : participant.connectionQuality === 'medium'
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      title={`Connection: ${participant.connectionQuality || 'unknown'}`}
                    />
                  </div>

                  {/* Participant Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900 truncate">
                        {participant.name}
                        {participant.id === currentUserId && (
                          <span className="text-indigo-600 text-xs ml-1">(You)</span>
                        )}
                      </span>
                      {participant.isModerator && (
                        <Crown size={14} className="text-yellow-500 flex-shrink-0" title="Moderator" />
                      )}
                      {participant.isHandRaised && (
                        <Hand size={14} className="text-orange-500 flex-shrink-0 animate-pulse" title="Hand Raised" />
                      )}
                      {participant.isPinned && (
                        <Pin size={14} className="text-indigo-600 flex-shrink-0" title="Pinned" />
                      )}
                    </div>

                    {participant.role && (
                      <p className="text-xs text-slate-500 mb-2">{participant.role}</p>
                    )}

                    {/* Status Icons */}
                    <div className="flex items-center gap-2">
                      {/* Audio Status */}
                      <div
                        className={`p-1 rounded ${
                          participant.isAudioMuted
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                        title={participant.isAudioMuted ? 'Mic Off' : 'Mic On'}
                      >
                        {participant.isAudioMuted ? <MicOff size={14} /> : <Mic size={14} />}
                      </div>

                      {/* Video Status */}
                      <div
                        className={`p-1 rounded ${
                          participant.isVideoMuted
                            ? 'bg-red-100 text-red-600'
                            : 'bg-green-100 text-green-600'
                        }`}
                        title={participant.isVideoMuted ? 'Video Off' : 'Video On'}
                      >
                        {participant.isVideoMuted ? <VideoOff size={14} /> : <Video size={14} />}
                      </div>

                      {/* Screen Sharing Status */}
                      {participant.isScreenSharing && (
                        <div
                          className="p-1 rounded bg-blue-100 text-blue-600"
                          title="Sharing Screen"
                        >
                          <Monitor size={14} />
                        </div>
                      )}

                      {/* Speaker Status */}
                      {participant.isSpeaking && (
                        <div className="flex items-center gap-1 text-green-600">
                          <Volume2 size={14} className="animate-pulse" />
                          <div className="flex gap-0.5">
                            <div className="w-1 h-2 bg-green-600 rounded animate-pulse" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 h-3 bg-green-600 rounded animate-pulse" style={{ animationDelay: '100ms' }} />
                            <div className="w-1 h-2 bg-green-600 rounded animate-pulse" style={{ animationDelay: '200ms' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Menu */}
                  {showActions && participant.id !== currentUserId && (
                    <div className="relative actions-menu-container flex-shrink-0">
                      <Button
                        onClick={() => setShowActionsMenu(showActionsMenu === participant.id ? null : participant.id)}
                        variant="ghost"
                        size="sm"
                        className="p-1 hover:bg-slate-100 rounded"
                      >
                        <MoreVertical size={16} />
                      </Button>

                      {/* Dropdown Menu */}
                      {showActionsMenu === participant.id && (
                        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-200 rounded-xl shadow-lg min-w-48 py-1 z-50">
                          {onPinParticipant && (
                            <button
                              onClick={() => handlePinParticipant(participant.id)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <Pin size={16} />
                              {participant.isPinned ? 'Unpin' : 'Pin Participant'}
                            </button>
                          )}

                          {onSendMessage && (
                            <button
                              onClick={() => handleSendMessage(participant.id)}
                              className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                            >
                              <MessageSquare size={16} />
                              Send Private Message
                            </button>
                          )}

                          {isModerator && (
                            <>
                              <div className="border-t border-slate-200 my-1" />

                              {onMuteParticipant && !participant.isAudioMuted && (
                                <button
                                  onClick={() => handleMuteParticipant(participant.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <MicOff size={16} />
                                  Mute Participant
                                </button>
                              )}

                              {onMakeModerator && !participant.isModerator && (
                                <button
                                  onClick={() => handleMakeModerator(participant.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 flex items-center gap-2"
                                >
                                  <Shield size={16} />
                                  Make Moderator
                                </button>
                              )}

                              {onRemoveParticipant && (
                                <button
                                  onClick={() => handleRemoveParticipant(participant.id)}
                                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                >
                                  <UserX size={16} />
                                  Remove from Call
                                </button>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {isModerator && (
        <div className="p-4 border-t border-slate-200">
          <Button
            variant="outline"
            size="sm"
            className="w-full flex items-center justify-center gap-2"
            onClick={() => console.log('Invite participants')}
          >
            <UserPlus size={18} />
            Invite Participants
          </Button>
        </div>
      )}
    </Card>
  );
};

ParticipantsList.propTypes = {
  /** Array of participant objects */
  participants: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string,
      role: PropTypes.string,
      avatarUrl: PropTypes.string,
      isAudioMuted: PropTypes.bool,
      isVideoMuted: PropTypes.bool,
      isScreenSharing: PropTypes.bool,
      isSpeaking: PropTypes.bool,
      isHandRaised: PropTypes.bool,
      isModerator: PropTypes.bool,
      isPinned: PropTypes.bool,
      connectionQuality: PropTypes.oneOf(['good', 'medium', 'poor']),
    })
  ),

  /** Current user's ID */
  currentUserId: PropTypes.string,

  /** Whether current user is a moderator */
  isModerator: PropTypes.bool,

  /** Callback to mute a participant */
  onMuteParticipant: PropTypes.func,

  /** Callback to remove a participant */
  onRemoveParticipant: PropTypes.func,

  /** Callback to pin/unpin a participant */
  onPinParticipant: PropTypes.func,

  /** Callback to send private message to participant */
  onSendMessage: PropTypes.func,

  /** Callback to make participant a moderator */
  onMakeModerator: PropTypes.func,

  /** Callback to close the participants panel */
  onClose: PropTypes.func,

  /** Whether to show action buttons */
  showActions: PropTypes.bool,

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default ParticipantsList;

/**
 * Example usage:
 * 
 * import ParticipantsList from './ParticipantsList';
 * 
 * const MyVideoCall = () => {
 *   const [participants, setParticipants] = useState([
 *     {
 *       id: '1',
 *       name: 'Dr. Sarah Smith',
 *       role: 'Cardiologist',
 *       email: 'sarah@example.com',
 *       isAudioMuted: false,
 *       isVideoMuted: false,
 *       isScreenSharing: false,
 *       isSpeaking: true,
 *       isModerator: true,
 *       connectionQuality: 'good',
 *     },
 *     {
 *       id: '2',
 *       name: 'John Doe',
 *       role: 'Patient',
 *       isAudioMuted: true,
 *       isVideoMuted: false,
 *       connectionQuality: 'medium',
 *     },
 *   ]);
 * 
 *   return (
 *     <ParticipantsList
 *       participants={participants}
 *       currentUserId="1"
 *       isModerator={true}
 *       onMuteParticipant={(id) => console.log('Mute', id)}
 *       onRemoveParticipant={(id) => console.log('Remove', id)}
 *       onPinParticipant={(id) => console.log('Pin', id)}
 *       onSendMessage={(id) => console.log('Message', id)}
 *     />
 *   );
 * };
 */
