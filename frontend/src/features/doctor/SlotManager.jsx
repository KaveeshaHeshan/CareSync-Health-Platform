import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Trash2, Save, Copy, RefreshCw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/forms/FormInput';
import FormCheckbox from '../../components/forms/FormCheckbox';
import Alert from '../../components/ui/Alert';
import Badge from '../../components/ui/Badge';
import doctorApi from '../../api/doctorApi';

const SlotManager = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' },
  ];

  const [weeklySchedule, setWeeklySchedule] = useState({
    monday: { enabled: false, slots: [] },
    tuesday: { enabled: false, slots: [] },
    wednesday: { enabled: false, slots: [] },
    thursday: { enabled: false, slots: [] },
    friday: { enabled: false, slots: [] },
    saturday: { enabled: false, slots: [] },
    sunday: { enabled: false, slots: [] },
  });

  useEffect(() => {
    fetchSlots();
  }, [selectedDate]);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await doctorApi.getAvailableSlots(selectedDate);
      setSlots(response.data || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load slots');
    } finally {
      setLoading(false);
    }
  };

  const generateTimeSlots = (startTime, endTime, duration = 30) => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);

    while (start < end) {
      const timeString = start.toTimeString().slice(0, 5);
      slots.push({
        time: timeString,
        isAvailable: true,
        isBooked: false,
      });
      start.setMinutes(start.getMinutes() + duration);
    }

    return slots;
  };

  const handleAddSlot = () => {
    setSlots([
      ...slots,
      {
        id: Date.now(),
        time: '09:00',
        isAvailable: true,
        isBooked: false,
      },
    ]);
  };

  const handleRemoveSlot = (index) => {
    const slot = slots[index];
    if (slot.isBooked) {
      setError('Cannot delete a booked slot');
      return;
    }
    setSlots(slots.filter((_, i) => i !== index));
  };

  const handleSlotChange = (index, field, value) => {
    const newSlots = [...slots];
    newSlots[index] = { ...newSlots[index], [field]: value };
    setSlots(newSlots);
  };

  const handleGenerateSlots = () => {
    const startTime = prompt('Enter start time (HH:MM)', '09:00');
    const endTime = prompt('Enter end time (HH:MM)', '17:00');
    const duration = parseInt(prompt('Enter slot duration in minutes', '30'));

    if (startTime && endTime && duration) {
      const generatedSlots = generateTimeSlots(startTime, endTime, duration);
      setSlots([...slots, ...generatedSlots]);
      setSuccess(`Generated ${generatedSlots.length} slots`);
    }
  };

  const handleSaveSlots = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await doctorApi.updateAvailableSlots(selectedDate, slots);
      setSuccess('Slots saved successfully!');
      await fetchSlots();
    } catch (err) {
      console.error('Error saving slots:', err);
      setError(err.response?.data?.message || 'Failed to save slots');
    } finally {
      setSaving(false);
    }
  };

  const handleCopySlots = () => {
    const targetDate = prompt('Copy slots to date (YYYY-MM-DD)', selectedDate);
    if (targetDate) {
      // Store slots in state or make API call
      alert(`Slots will be copied to ${targetDate}`);
    }
  };

  const handleDayToggle = (day) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const handleAddWeeklySlot = (day) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: [
          ...prev[day].slots,
          { id: Date.now(), startTime: '09:00', endTime: '17:00' },
        ],
      },
    }));
  };

  const handleRemoveWeeklySlot = (day, slotIndex) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.filter((_, i) => i !== slotIndex),
      },
    }));
  };

  const handleWeeklySlotChange = (day, slotIndex, field, value) => {
    setWeeklySchedule((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        slots: prev[day].slots.map((slot, i) =>
          i === slotIndex ? { ...slot, [field]: value } : slot
        ),
      },
    }));
  };

  const handleSaveWeeklySchedule = async () => {
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      await doctorApi.updateWeeklySchedule(weeklySchedule);
      setSuccess('Weekly schedule saved successfully!');
    } catch (err) {
      console.error('Error saving weekly schedule:', err);
      setError(err.response?.data?.message || 'Failed to save weekly schedule');
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-indigo-100 rounded-lg">
            <Clock className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">Slot Manager</h2>
            <p className="text-sm text-gray-600">Manage your availability schedule</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="error" closable onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success" closable onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Daily Schedule Management */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Daily Schedule</h3>
            <div className="flex items-center space-x-2">
              <FormInput
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-auto"
              />
              <Button
                variant="secondary"
                size="sm"
                icon={RefreshCw}
                onClick={fetchSlots}
                loading={loading}
              >
                Refresh
              </Button>
            </div>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <strong>Selected Date:</strong> {formatDate(selectedDate)}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="primary" size="sm" icon={Plus} onClick={handleAddSlot}>
              Add Slot
            </Button>
            <Button variant="secondary" size="sm" icon={Clock} onClick={handleGenerateSlots}>
              Generate Slots
            </Button>
            <Button variant="secondary" size="sm" icon={Copy} onClick={handleCopySlots}>
              Copy to Date
            </Button>
          </div>

          {/* Slots List */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading slots...</p>
            </div>
          ) : slots.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No slots configured for this date</p>
              <p className="text-sm text-gray-500 mt-1">Click "Add Slot" to create one</p>
            </div>
          ) : (
            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div
                  key={slot.id || index}
                  className="flex items-center space-x-3 p-4 bg-white border border-gray-200 rounded-lg"
                >
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                    <FormInput
                      type="time"
                      label="Time"
                      value={slot.time}
                      onChange={(e) => handleSlotChange(index, 'time', e.target.value)}
                      disabled={slot.isBooked}
                    />

                    <div className="flex items-center space-x-4 pt-6">
                      <label className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={slot.isAvailable}
                          onChange={(e) =>
                            handleSlotChange(index, 'isAvailable', e.target.checked)
                          }
                          disabled={slot.isBooked}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">Available</span>
                      </label>
                    </div>

                    <div className="flex items-center justify-end space-x-2 pt-6">
                      {slot.isBooked && <Badge variant="warning">Booked</Badge>}
                      <button
                        onClick={() => handleRemoveSlot(index)}
                        disabled={slot.isBooked}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Save Button */}
          {slots.length > 0 && (
            <div className="flex justify-end pt-4 border-t border-gray-200">
              <Button
                variant="primary"
                icon={Save}
                onClick={handleSaveSlots}
                loading={saving}
              >
                Save Daily Slots
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Weekly Schedule Template */}
      <Card>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Weekly Schedule Template</h3>
              <p className="text-sm text-gray-600 mt-1">
                Set your recurring weekly availability
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {daysOfWeek.map((day) => (
              <div key={day.value} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={weeklySchedule[day.value].enabled}
                      onChange={() => handleDayToggle(day.value)}
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <span className="font-medium text-gray-900">{day.label}</span>
                  </label>

                  {weeklySchedule[day.value].enabled && (
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={Plus}
                      onClick={() => handleAddWeeklySlot(day.value)}
                    >
                      Add Time Range
                    </Button>
                  )}
                </div>

                {weeklySchedule[day.value].enabled &&
                  weeklySchedule[day.value].slots.length > 0 && (
                    <div className="space-y-2 pl-8">
                      {weeklySchedule[day.value].slots.map((slot, slotIndex) => (
                        <div
                          key={slot.id}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg"
                        >
                          <FormInput
                            type="time"
                            label="Start"
                            value={slot.startTime}
                            onChange={(e) =>
                              handleWeeklySlotChange(
                                day.value,
                                slotIndex,
                                'startTime',
                                e.target.value
                              )
                            }
                          />
                          <span className="text-gray-500 pt-6">to</span>
                          <FormInput
                            type="time"
                            label="End"
                            value={slot.endTime}
                            onChange={(e) =>
                              handleWeeklySlotChange(
                                day.value,
                                slotIndex,
                                'endTime',
                                e.target.value
                              )
                            }
                          />
                          <button
                            onClick={() => handleRemoveWeeklySlot(day.value, slotIndex)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors mt-6"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                {weeklySchedule[day.value].enabled &&
                  weeklySchedule[day.value].slots.length === 0 && (
                    <div className="pl-8 text-sm text-gray-500">
                      Click "Add Time Range" to set availability
                    </div>
                  )}
              </div>
            ))}
          </div>

          {/* Save Weekly Schedule Button */}
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button
              variant="primary"
              icon={Save}
              onClick={handleSaveWeeklySchedule}
              loading={saving}
            >
              Save Weekly Schedule
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SlotManager;
