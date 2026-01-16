import React, { useState } from 'react';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock,
  FileText,
  AlertCircle,
  Activity,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  MessageSquare,
  Video
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import doctorApi from '../../api/doctorApi';

const PatientCard = ({ patient, onViewDetails, showActions = true }) => {
  const [expanded, setExpanded] = useState(false);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getLastVisit = () => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return 'No visits yet';
    }
    const completedAppointments = patient.appointments.filter(
      (apt) => apt.status === 'completed'
    );
    if (completedAppointments.length === 0) return 'No visits yet';
    
    const lastAppointment = completedAppointments.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    )[0];
    return formatDate(lastAppointment.date);
  };

  const getUpcomingAppointment = () => {
    if (!patient.appointments || patient.appointments.length === 0) {
      return null;
    }
    const upcoming = patient.appointments.filter(
      (apt) => apt.status === 'scheduled' || apt.status === 'confirmed'
    );
    if (upcoming.length === 0) return null;
    
    return upcoming.sort((a, b) => new Date(a.date) - new Date(b.date))[0];
  };

  const handleAddNotes = async () => {
    if (!notes.trim()) return;

    setLoading(true);
    try {
      await doctorApi.addPatientNotes(patient._id, { notes });
      setShowNotesModal(false);
      setNotes('');
      // Optionally refresh patient data
      if (onViewDetails) onViewDetails(patient._id);
    } catch (error) {
      console.error('Error adding notes:', error);
      alert('Failed to add notes');
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (patient.phone) {
      window.location.href = `tel:${patient.phone}`;
    }
  };

  const handleEmail = () => {
    if (patient.email) {
      window.location.href = `mailto:${patient.email}`;
    }
  };

  const handleViewProfile = () => {
    if (onViewDetails) {
      onViewDetails(patient._id);
    } else {
      window.location.href = `/doctor/patients/${patient._id}`;
    }
  };

  const upcomingAppointment = getUpcomingAppointment();

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {patient.profilePicture ? (
                  <img
                    src={patient.profilePicture}
                    alt={patient.name}
                    className="h-16 w-16 rounded-full object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center border-2 border-gray-200">
                    <User className="h-8 w-8 text-indigo-600" />
                  </div>
                )}
              </div>

              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {patient.name || 'Unknown Patient'}
                </h3>
                <div className="flex items-center space-x-3 mt-1">
                  <span className="text-sm text-gray-600">
                    {patient.age ? `${patient.age} years` : calculateAge(patient.dateOfBirth) + ' years'}
                  </span>
                  {patient.gender && (
                    <>
                      <span className="text-gray-400">•</span>
                      <span className="text-sm text-gray-600">{patient.gender}</span>
                    </>
                  )}
                  {patient.bloodGroup && (
                    <>
                      <span className="text-gray-400">•</span>
                      <Badge variant="secondary" size="sm">
                        {patient.bloodGroup}
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            {patient.phone && (
              <div className="flex items-center space-x-2 text-sm">
                <Phone className="h-4 w-4 text-gray-400" />
                <a
                  href={`tel:${patient.phone}`}
                  className="text-gray-700 hover:text-indigo-600 transition-colors"
                >
                  {patient.phone}
                </a>
              </div>
            )}

            {patient.email && (
              <div className="flex items-center space-x-2 text-sm">
                <Mail className="h-4 w-4 text-gray-400" />
                <a
                  href={`mailto:${patient.email}`}
                  className="text-gray-700 hover:text-indigo-600 transition-colors truncate"
                >
                  {patient.email}
                </a>
              </div>
            )}
          </div>

          {/* Medical Summary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 border-t border-gray-100">
            {/* Last Visit */}
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Last Visit</p>
                <p className="text-gray-700 font-medium">{getLastVisit()}</p>
              </div>
            </div>

            {/* Total Visits */}
            <div className="flex items-center space-x-2 text-sm">
              <Activity className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Total Visits</p>
                <p className="text-gray-700 font-medium">
                  {patient.appointments?.filter((a) => a.status === 'completed').length || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Upcoming Appointment Alert */}
          {upcomingAppointment && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">
                    Upcoming Appointment
                  </p>
                  <p className="text-xs text-blue-700">
                    {formatDate(upcomingAppointment.date)} at {upcomingAppointment.time}
                  </p>
                </div>
                {upcomingAppointment.appointmentType === 'online' && (
                  <Badge variant="info" size="sm" icon={Video}>
                    Online
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Medical Conditions (if any) */}
          {patient.conditions && patient.conditions.length > 0 && (
            <div className="pt-3 border-t border-gray-100">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-orange-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-gray-500 mb-1">Medical Conditions</p>
                  <div className="flex flex-wrap gap-1">
                    {patient.conditions.slice(0, 3).map((condition, index) => (
                      <Badge key={index} variant="warning" size="sm">
                        {condition.name || condition}
                      </Badge>
                    ))}
                    {patient.conditions.length > 3 && (
                      <Badge variant="secondary" size="sm">
                        +{patient.conditions.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Expandable Additional Details */}
          {(patient.allergies?.length > 0 || patient.medications?.length > 0 || patient.notes) && (
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
              >
                <span className="font-medium">Additional Information</span>
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {expanded && (
                <div className="mt-3 space-y-3 text-sm">
                  {patient.allergies && patient.allergies.length > 0 && (
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Allergies:</p>
                      <div className="flex flex-wrap gap-1">
                        {patient.allergies.map((allergy, index) => (
                          <Badge key={index} variant="danger" size="sm">
                            {allergy.name || allergy}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {patient.medications && patient.medications.length > 0 && (
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Current Medications:</p>
                      <ul className="list-disc list-inside text-gray-700 space-y-1">
                        {patient.medications.slice(0, 3).map((med, index) => (
                          <li key={index}>{med.name || med}</li>
                        ))}
                        {patient.medications.length > 3 && (
                          <li className="text-gray-500">
                            +{patient.medications.length - 3} more medications
                          </li>
                        )}
                      </ul>
                    </div>
                  )}

                  {patient.notes && (
                    <div>
                      <p className="text-gray-500 font-medium mb-1">Doctor's Notes:</p>
                      <p className="text-gray-700">{patient.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <div className="flex space-x-2">
                {/* View Profile */}
                <Button
                  variant="primary"
                  size="sm"
                  icon={ExternalLink}
                  onClick={handleViewProfile}
                >
                  View Profile
                </Button>

                {/* Add Notes */}
                <Button
                  variant="secondary"
                  size="sm"
                  icon={FileText}
                  onClick={() => setShowNotesModal(true)}
                >
                  Add Notes
                </Button>

                {/* Contact Actions */}
                {patient.phone && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Phone}
                    onClick={handleCall}
                  />
                )}

                {patient.email && (
                  <Button
                    variant="secondary"
                    size="sm"
                    icon={Mail}
                    onClick={handleEmail}
                  />
                )}
              </div>

              {/* Patient ID */}
              {patient.patientId && (
                <span className="text-xs text-gray-500">
                  ID: {patient.patientId}
                </span>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Add Notes Modal */}
      <Modal
        isOpen={showNotesModal}
        onClose={() => {
          setShowNotesModal(false);
          setNotes('');
        }}
        title={`Add Notes for ${patient.name}`}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
              Medical Notes
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter medical notes, observations, or important information..."
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => {
                setShowNotesModal(false);
                setNotes('');
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddNotes}
              loading={loading}
              disabled={!notes.trim()}
            >
              Save Notes
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PatientCard;
