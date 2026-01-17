import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  Save,
  Copy,
  RefreshCw,
  Settings,
  CheckCircle,
  XCircle,
  AlertCircle,
  CalendarDays,
  Sun,
  Moon,
  Coffee,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import doctorApi from '../../api/doctorApi';

/**
 * DoctorSchedule Component
 * 
 * Complete schedule management for doctors
 * Manage weekly working hours, time slots, and availability
 * 
 * @component
 */
const DoctorSchedule = () => {
  const navigate = useNavigate();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState('weekly'); // weekly, daily
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [showBlockTimeModal, setShowBlockTimeModal] = useState(false);
  const [newSlot, setNewSlot] = useState({ startTime: '09:00', endTime: '17:00', duration: 30 });
  const [blockTime, setBlockTime] = useState({ date: '', startTime: '', endTime: '', reason: '' });

  // Days of week
  const daysOfWeek = [
    { value: 'monday', label: 'Monday', icon: '📅' },
    { value: 'tuesday', label: 'Tuesday', icon: '📅' },
    { value: 'wednesday', label: 'Wednesday', icon: '📅' },
    { value: 'thursday', label: 'Thursday', icon: '📅' },
    { value: 'friday', label: 'Friday', icon: '📅' },
    { value: 'saturday', label: 'Saturday', icon: '📅' },
    { value: 'sunday', label: 'Sunday', icon: '📅' },
  ];

  // Default weekly schedule
  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    tuesday: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    wednesday: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    thursday: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    friday: { enabled: true, slots: [{ startTime: '09:00', endTime: '17:00' }] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  });

  const [blockedDates, setBlockedDates] = useState([]);

  // Fetch schedule
  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await doctorApi.getMySchedule();
      if (response.data) {
        setSchedule(response.data);
        if (response.data.weeklySchedule) {
          setWeeklySchedule(response.data.weeklySchedule);
        }
        if (response.data.blockedDates) {
          setBlockedDates(response.data.blockedDates);
        }
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load schedule. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Toggle day availability
  const handleToggleDay = (day) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day].enabled,
        slots: !prev[day].enabled && prev[day].slots.length === 0 
          ? [{ startTime: '09:00', endTime: '17:00' }]
          : prev[day].slots
      }
    }));
  };

  // Add time slot to a day
  const handleAddTimeSlot = (day) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [...prev[day].slots, { startTime: '09:00', endTime: '17:00' }]
      }
    }));
  };

  // Remove time slot from a day
  const handleRemoveTimeSlot = (day, slotIndex) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== slotIndex)
      }
    }));
  };

  // Update time slot
  const handleUpdateTimeSlot = (day, slotIndex, field, value) => {
    setWeeklySchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === slotIndex ? { ...slot, [field]: value } : slot
        )
      }
    }));
  };

  // Copy schedule to another day
  const handleCopySchedule = (fromDay) => {
    const toDay = prompt(`Copy ${fromDay} schedule to which day?`, 'tuesday');
    if (toDay && daysOfWeek.some(d => d.value === toDay.toLowerCase())) {
      setWeeklySchedule(prev => ({
        ...prev,
        [toDay.toLowerCase()]: {
          enabled: prev[fromDay].enabled,
          slots: [...prev[fromDay].slots]
        }
      }));
      setSuccess(`Schedule copied from ${fromDay} to ${toDay}`);
    }
  };

  // Generate time slots
  const generateTimeSlots = () => {
    const { startTime, endTime, duration } = newSlot;
    const slots = [];
    
    let current = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    
    while (current < end) {
      const nextSlot = new Date(current.getTime() + duration * 60000);
      if (nextSlot <= end) {
        slots.push({
          startTime: current.toTimeString().slice(0, 5),
          endTime: nextSlot.toTimeString().slice(0, 5)
        });
      }
      current = nextSlot;
    }
    
    return slots;
  };

  // Apply generated slots to all enabled days
  const handleApplyGeneratedSlots = () => {
    const generatedSlots = generateTimeSlots();
    
    setWeeklySchedule(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(day => {
        if (updated[day].enabled) {
          updated[day].slots = generatedSlots;
        }
      });
      return updated;
    });
    
    setShowAddSlotModal(false);
    setSuccess(`Generated ${generatedSlots.length} time slots for all working days`);
  };

  // Block time
  const handleBlockTime = async () => {
    if (!blockTime.date || !blockTime.startTime || !blockTime.endTime) {
      setError('Please fill in all required fields');
      return;
    }
    
    try {
      setSaving(true);
      await doctorApi.blockTimeSlot(blockTime);
      
      setBlockedDates([...blockedDates, {
        ...blockTime,
        id: Date.now()
      }]);
      
      setShowBlockTimeModal(false);
      setBlockTime({ date: '', startTime: '', endTime: '', reason: '' });
      setSuccess('Time blocked successfully');
    } catch (err) {
      console.error('Error blocking time:', err);
      setError('Failed to block time');
    } finally {
      setSaving(false);
    }
  };

  // Unblock time
  const handleUnblockTime = async (blockId) => {
    try {
      setSaving(true);
      await doctorApi.unblockTimeSlot(blockId);
      
      setBlockedDates(blockedDates.filter(b => b.id !== blockId));
      setSuccess('Time unblocked successfully');
    } catch (err) {
      console.error('Error unblocking time:', err);
      setError('Failed to unblock time');
    } finally {
      setSaving(false);
    }
  };

  // Save schedule
  const handleSaveSchedule = async () => {
    try {
      setSaving(true);
      setError('');
      
      await doctorApi.updateSchedule({ weeklySchedule });
      
      setSuccess('Schedule saved successfully!');
      await fetchSchedule();
    } catch (err) {
      console.error('Error saving schedule:', err);
      setError('Failed to save schedule. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get schedule statistics
  const getScheduleStats = () => {
    const enabledDays = Object.values(weeklySchedule).filter(d => d.enabled).length;
    const totalSlots = Object.values(weeklySchedule).reduce((sum, day) => 
      sum + (day.enabled ? day.slots.length : 0), 0
    );
    
    return {
      workingDays: enabledDays,
      totalSlots,
      blockedDates: blockedDates.length
    };
  };

  const stats = getScheduleStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Schedule Management</h1>
            <p className="text-gray-600 mt-1">Manage your working hours and availability</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => setShowAddSlotModal(true)} variant="outline">
              <Clock className="w-4 h-4 mr-2" />
              Generate Slots
            </Button>
            <Button onClick={handleSaveSchedule} disabled={saving}>
              {saving ? <Spinner size="sm" className="mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Schedule
            </Button>
          </div>
        </div>

        {/* Error & Success Alerts */}
        {error && (
          <Alert variant="error" className="mb-4" onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert variant="success" className="mb-4" onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Working Days</p>
                <p className="text-2xl font-bold text-gray-900">{stats.workingDays}/7</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <CalendarDays className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Time Slots</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalSlots}</p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Clock className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Blocked Dates</p>
                <p className="text-2xl font-bold text-red-600">{stats.blockedDates}</p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Weekly Schedule */}
      <Card className="mb-6">
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2" />
            Weekly Schedule
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Set your regular working hours for each day of the week
          </p>
        </div>

        <div className="space-y-4">
          {daysOfWeek.map(({ value, label, icon }) => (
            <div key={value} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleToggleDay(value)}
                    className={`
                      w-12 h-6 rounded-full transition-colors relative
                      ${weeklySchedule[value].enabled ? 'bg-green-500' : 'bg-gray-300'}
                    `}
                  >
                    <span
                      className={`
                        absolute w-5 h-5 bg-white rounded-full top-0.5 transition-transform
                        ${weeklySchedule[value].enabled ? 'translate-x-6' : 'translate-x-0.5'}
                      `}
                    />
                  </button>
                  <span className="text-lg font-semibold text-gray-900">
                    {icon} {label}
                  </span>
                  {weeklySchedule[value].enabled && (
                    <Badge variant="success">Available</Badge>
                  )}
                  {!weeklySchedule[value].enabled && (
                    <Badge variant="gray">Day Off</Badge>
                  )}
                </div>
                
                {weeklySchedule[value].enabled && (
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTimeSlot(value)}
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Slot
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopySchedule(value)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {weeklySchedule[value].enabled && weeklySchedule[value].slots.length > 0 && (
                <div className="space-y-2 pl-15">
                  {weeklySchedule[value].slots.map((slot, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-gray-50 p-3 rounded-lg">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <Input
                        type="time"
                        value={slot.startTime}
                        onChange={(e) => handleUpdateTimeSlot(value, index, 'startTime', e.target.value)}
                        className="w-32"
                      />
                      <span className="text-gray-500">to</span>
                      <Input
                        type="time"
                        value={slot.endTime}
                        onChange={(e) => handleUpdateTimeSlot(value, index, 'endTime', e.target.value)}
                        className="w-32"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveTimeSlot(value, index)}
                        disabled={weeklySchedule[value].slots.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Blocked Dates */}
      <Card>
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2 flex items-center">
                <XCircle className="w-5 h-5 mr-2" />
                Blocked Dates
              </h2>
              <p className="text-sm text-gray-600">
                Block specific dates for holidays or personal time
              </p>
            </div>
            <Button onClick={() => setShowBlockTimeModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Block Time
            </Button>
          </div>
        </div>

        {blockedDates.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No blocked dates</p>
          </div>
        ) : (
          <div className="space-y-3">
            {blockedDates.map((block) => (
              <div key={block.id} className="flex items-center justify-between bg-red-50 p-4 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <Badge variant="danger">Blocked</Badge>
                    <span className="font-medium text-gray-900">{formatDate(block.date)}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-1" />
                    {block.startTime} - {block.endTime}
                  </div>
                  {block.reason && (
                    <p className="text-sm text-gray-500 mt-1">{block.reason}</p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleUnblockTime(block.id)}
                >
                  <Trash2 className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Generate Slots Modal */}
      <Modal
        isOpen={showAddSlotModal}
        onClose={() => setShowAddSlotModal(false)}
        title="Generate Time Slots"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Generate consistent time slots for all working days
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Time
            </label>
            <Input
              type="time"
              value={newSlot.startTime}
              onChange={(e) => setNewSlot({ ...newSlot, startTime: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Time
            </label>
            <Input
              type="time"
              value={newSlot.endTime}
              onChange={(e) => setNewSlot({ ...newSlot, endTime: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Slot Duration (minutes)
            </label>
            <select
              value={newSlot.duration}
              onChange={(e) => setNewSlot({ ...newSlot, duration: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="45">45 minutes</option>
              <option value="60">60 minutes</option>
            </select>
          </div>

          <Alert variant="info">
            <AlertCircle className="w-4 h-4 mr-2" />
            This will generate time slots for all enabled working days
          </Alert>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddSlotModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyGeneratedSlots}>
              <CheckCircle className="w-4 h-4 mr-2" />
              Generate Slots
            </Button>
          </div>
        </div>
      </Modal>

      {/* Block Time Modal */}
      <Modal
        isOpen={showBlockTimeModal}
        onClose={() => setShowBlockTimeModal(false)}
        title="Block Time"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Block a specific date and time range
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <Input
              type="date"
              value={blockTime.date}
              onChange={(e) => setBlockTime({ ...blockTime, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <Input
                type="time"
                value={blockTime.startTime}
                onChange={(e) => setBlockTime({ ...blockTime, startTime: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <Input
                type="time"
                value={blockTime.endTime}
                onChange={(e) => setBlockTime({ ...blockTime, endTime: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Reason (Optional)
            </label>
            <textarea
              value={blockTime.reason}
              onChange={(e) => setBlockTime({ ...blockTime, reason: e.target.value })}
              placeholder="E.g., Holiday, Personal leave, Conference..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4">
            <Button variant="outline" onClick={() => setShowBlockTimeModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleBlockTime} disabled={saving}>
              {saving ? <Spinner size="sm" className="mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
              Block Time
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorSchedule;
