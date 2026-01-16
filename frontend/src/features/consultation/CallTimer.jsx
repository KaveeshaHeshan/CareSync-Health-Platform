import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Clock,
  Play,
  Pause,
  Square,
  RotateCcw,
  DollarSign,
  AlertTriangle,
  Circle,
  Download,
  Calendar,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

/**
 * CallTimer Component
 * 
 * Tracks and displays call duration in video consultations.
 * Provides timer controls, cost calculation, and time limit warnings.
 * 
 * @component
 */
const CallTimer = ({
  startTime = null,
  isActive = false,
  onStart,
  onPause,
  onResume,
  onStop,
  autoStart = false,
  showControls = true,
  showCost = false,
  costPerMinute = 0,
  timeLimit = null, // in minutes
  warningThreshold = 5, // minutes before limit to show warning
  isRecording = false,
  format = 'digital', // 'digital', 'analog', 'compact'
  position = 'top-right', // 'top-left', 'top-right', 'bottom-left', 'bottom-right', 'inline'
  className = '',
}) => {
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [exceededLimit, setExceededLimit] = useState(false);
  const intervalRef = useRef(null);
  const startTimeRef = useRef(startTime);
  const pausedTimeRef = useRef(0);

  // Initialize timer if startTime is provided
  useEffect(() => {
    if (startTime && autoStart) {
      startTimeRef.current = new Date(startTime);
      if (isActive && !isPaused) {
        startTimer();
      }
    }
  }, [startTime, autoStart, isActive]);

  // Update elapsed time
  useEffect(() => {
    if (isActive && !isPaused) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const start = startTimeRef.current ? new Date(startTimeRef.current).getTime() : now;
        const elapsed = Math.floor((now - start - pausedTimeRef.current) / 1000);
        setElapsedTime(elapsed);

        // Check time limit warnings
        if (timeLimit) {
          const elapsedMinutes = elapsed / 60;
          const remainingMinutes = timeLimit - elapsedMinutes;

          if (remainingMinutes <= 0) {
            setExceededLimit(true);
            setShowWarning(true);
          } else if (remainingMinutes <= warningThreshold) {
            setShowWarning(true);
          }
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeLimit, warningThreshold]);

  const startTimer = () => {
    if (!startTimeRef.current) {
      startTimeRef.current = new Date();
    }
    setIsPaused(false);
    onStart?.({ startTime: startTimeRef.current });
  };

  const pauseTimer = () => {
    setIsPaused(true);
    pausedTimeRef.current += 1000; // Add 1 second to account for pause
    onPause?.({ elapsedTime, isPaused: true });
  };

  const resumeTimer = () => {
    setIsPaused(false);
    onResume?.({ elapsedTime, isPaused: false });
  };

  const stopTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    const finalTime = elapsedTime;
    onStop?.({ 
      elapsedTime: finalTime, 
      duration: formatDuration(finalTime),
      cost: calculateCost(finalTime),
    });
  };

  const resetTimer = () => {
    setElapsedTime(0);
    setIsPaused(false);
    setShowWarning(false);
    setExceededLimit(false);
    startTimeRef.current = null;
    pausedTimeRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    return {
      hours: hrs,
      minutes: mins,
      seconds: secs,
      formatted: `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`,
      shortFormatted: hrs > 0 
        ? `${hrs}h ${mins}m ${secs}s`
        : `${mins}m ${secs}s`,
    };
  };

  const calculateCost = (seconds) => {
    const minutes = seconds / 60;
    return (minutes * costPerMinute).toFixed(2);
  };

  const getProgress = () => {
    if (!timeLimit) return 0;
    return Math.min((elapsedTime / (timeLimit * 60)) * 100, 100);
  };

  const getRemainingTime = () => {
    if (!timeLimit) return null;
    const remaining = (timeLimit * 60) - elapsedTime;
    return Math.max(0, remaining);
  };

  const duration = formatDuration(elapsedTime);
  const cost = calculateCost(elapsedTime);
  const progress = getProgress();
  const remaining = getRemainingTime();

  // Position classes
  const positionClasses = {
    'top-left': 'absolute top-4 left-4',
    'top-right': 'absolute top-4 right-4',
    'bottom-left': 'absolute bottom-4 left-4',
    'bottom-right': 'absolute bottom-4 right-4',
    'inline': '',
  };

  // Render different formats
  const renderTimer = () => {
    switch (format) {
      case 'analog':
        return (
          <div className="relative w-32 h-32">
            {/* Circular Progress */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-slate-200"
              />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 58}`}
                strokeDashoffset={`${2 * Math.PI * 58 * (1 - progress / 100)}`}
                className={`transition-all duration-300 ${
                  exceededLimit ? 'text-red-500' : 
                  showWarning ? 'text-yellow-500' : 
                  'text-indigo-600'
                }`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">
                {duration.minutes}:{duration.seconds.toString().padStart(2, '0')}
              </span>
              {duration.hours > 0 && (
                <span className="text-xs text-slate-500">{duration.hours}h</span>
              )}
            </div>
          </div>
        );

      case 'compact':
        return (
          <div className="flex items-center gap-2 bg-slate-900 text-white px-3 py-1.5 rounded-full">
            <Clock size={14} />
            <span className="font-mono text-sm font-semibold">
              {duration.shortFormatted}
            </span>
            {isRecording && (
              <Circle size={8} className="text-red-500 fill-current animate-pulse" />
            )}
          </div>
        );

      default: // digital
        return (
          <Card className="inline-block">
            <div className="px-6 py-4">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-indigo-600" size={24} />
                <div>
                  <p className="text-xs text-slate-500 uppercase font-medium">Call Duration</p>
                  {startTimeRef.current && (
                    <p className="text-xs text-slate-400">
                      Started: {new Date(startTimeRef.current).toLocaleTimeString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Timer Display */}
              <div className="flex items-center gap-2 mb-3">
                <span className={`font-mono text-4xl font-bold ${
                  exceededLimit ? 'text-red-600' : 
                  showWarning ? 'text-yellow-600' : 
                  'text-slate-900'
                }`}>
                  {duration.formatted}
                </span>
                {isRecording && (
                  <div className="flex flex-col items-center gap-1">
                    <Circle size={12} className="text-red-500 fill-current animate-pulse" />
                    <span className="text-xs text-red-600 font-medium">REC</span>
                  </div>
                )}
              </div>

              {/* Progress Bar */}
              {timeLimit && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        exceededLimit ? 'bg-red-600' : 
                        showWarning ? 'bg-yellow-500' : 
                        'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                  </div>
                  {remaining !== null && (
                    <p className="text-xs text-slate-500 mt-1">
                      {exceededLimit 
                        ? 'Time limit exceeded'
                        : `${Math.floor(remaining / 60)}m ${remaining % 60}s remaining`
                      }
                    </p>
                  )}
                </div>
              )}

              {/* Cost Display */}
              {showCost && costPerMinute > 0 && (
                <div className="flex items-center gap-2 p-2 bg-green-50 rounded-lg mb-3">
                  <DollarSign size={16} className="text-green-600" />
                  <div className="flex-1">
                    <p className="text-xs text-slate-600">Consultation Cost</p>
                    <p className="text-lg font-bold text-green-600">${cost}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500">${costPerMinute}/min</p>
                  </div>
                </div>
              )}

              {/* Warning Messages */}
              {showWarning && (
                <div className={`flex items-start gap-2 p-3 rounded-lg mb-3 ${
                  exceededLimit 
                    ? 'bg-red-50 border border-red-200' 
                    : 'bg-yellow-50 border border-yellow-200'
                }`}>
                  <AlertTriangle size={18} className={exceededLimit ? 'text-red-600' : 'text-yellow-600'} />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      exceededLimit ? 'text-red-800' : 'text-yellow-800'
                    }`}>
                      {exceededLimit 
                        ? 'Time Limit Exceeded!' 
                        : 'Time Limit Warning'
                      }
                    </p>
                    <p className={`text-xs ${
                      exceededLimit ? 'text-red-600' : 'text-yellow-600'
                    }`}>
                      {exceededLimit 
                        ? 'The call has exceeded the scheduled time limit.'
                        : `${warningThreshold} minutes remaining in consultation.`
                      }
                    </p>
                  </div>
                </div>
              )}

              {/* Status Badges */}
              <div className="flex flex-wrap gap-2 mb-3">
                <Badge variant={isPaused ? 'warning' : isActive ? 'success' : 'default'}>
                  {isPaused ? 'Paused' : isActive ? 'Active' : 'Stopped'}
                </Badge>
                {isRecording && (
                  <Badge variant="error" className="animate-pulse">
                    Recording
                  </Badge>
                )}
              </div>

              {/* Controls */}
              {showControls && (
                <div className="flex gap-2">
                  {!isActive ? (
                    <Button
                      onClick={startTimer}
                      variant="primary"
                      size="sm"
                      className="flex-1 flex items-center justify-center gap-2"
                    >
                      <Play size={16} />
                      Start
                    </Button>
                  ) : (
                    <>
                      {isPaused ? (
                        <Button
                          onClick={resumeTimer}
                          variant="primary"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Play size={16} />
                          Resume
                        </Button>
                      ) : (
                        <Button
                          onClick={pauseTimer}
                          variant="warning"
                          size="sm"
                          className="flex-1 flex items-center justify-center gap-2"
                        >
                          <Pause size={16} />
                          Pause
                        </Button>
                      )}
                      <Button
                        onClick={stopTimer}
                        variant="error"
                        size="sm"
                        className="flex-1 flex items-center justify-center gap-2"
                      >
                        <Square size={16} />
                        Stop
                      </Button>
                    </>
                  )}
                  {elapsedTime > 0 && (
                    <Button
                      onClick={resetTimer}
                      variant="ghost"
                      size="sm"
                      className="px-3"
                      title="Reset timer"
                    >
                      <RotateCcw size={16} />
                    </Button>
                  )}
                </div>
              )}

              {/* Export Button */}
              {elapsedTime > 0 && (
                <Button
                  onClick={() => {
                    const data = {
                      duration: duration.formatted,
                      elapsed: elapsedTime,
                      cost: showCost ? cost : null,
                      startTime: startTimeRef.current,
                      endTime: new Date(),
                    };
                    console.log('Timer data:', data);
                    // Could trigger download or API call
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Export Time Data
                </Button>
              )}
            </div>
          </Card>
        );
    }
  };

  return (
    <div className={`${positionClasses[position]} ${className}`}>
      {renderTimer()}
    </div>
  );
};

CallTimer.propTypes = {
  /** Start time of the call (Date object or ISO string) */
  startTime: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.string,
  ]),

  /** Whether the timer is active */
  isActive: PropTypes.bool,

  /** Callback when timer starts */
  onStart: PropTypes.func,

  /** Callback when timer is paused */
  onPause: PropTypes.func,

  /** Callback when timer resumes */
  onResume: PropTypes.func,

  /** Callback when timer stops */
  onStop: PropTypes.func,

  /** Whether to automatically start timer */
  autoStart: PropTypes.bool,

  /** Whether to show control buttons */
  showControls: PropTypes.bool,

  /** Whether to show cost calculation */
  showCost: PropTypes.bool,

  /** Cost per minute for calculation */
  costPerMinute: PropTypes.number,

  /** Time limit in minutes (null for no limit) */
  timeLimit: PropTypes.number,

  /** Minutes before limit to show warning */
  warningThreshold: PropTypes.number,

  /** Whether call is being recorded */
  isRecording: PropTypes.bool,

  /** Timer display format */
  format: PropTypes.oneOf(['digital', 'analog', 'compact']),

  /** Timer position on screen */
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right', 'inline']),

  /** Additional CSS classes */
  className: PropTypes.string,
};

export default CallTimer;

/**
 * Example usage:
 * 
 * import CallTimer from './CallTimer';
 * 
 * const MyVideoCall = () => {
 *   const [isCallActive, setIsCallActive] = useState(false);
 *   const [startTime, setStartTime] = useState(null);
 * 
 *   const handleCallStart = () => {
 *     setIsCallActive(true);
 *     setStartTime(new Date());
 *   };
 * 
 *   const handleTimerStop = (data) => {
 *     console.log('Call ended:', data);
 *     setIsCallActive(false);
 *     // Save duration to backend
 *   };
 * 
 *   return (
 *     <div className="relative">
 *       <CallTimer
 *         startTime={startTime}
 *         isActive={isCallActive}
 *         onStart={({ startTime }) => console.log('Timer started:', startTime)}
 *         onStop={handleTimerStop}
 *         autoStart={true}
 *         showControls={true}
 *         showCost={true}
 *         costPerMinute={2.5}
 *         timeLimit={30}
 *         warningThreshold={5}
 *         isRecording={false}
 *         format="digital"
 *         position="top-right"
 *       />
 *     </div>
 *   );
 * };
 */
