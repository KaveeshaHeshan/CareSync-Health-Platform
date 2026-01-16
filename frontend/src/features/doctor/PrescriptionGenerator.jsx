import React, { useState } from 'react';
import { Plus, Trash2, FileText, Download, Eye, User, Calendar } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import FormSelect from '../../components/forms/FormSelect';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import doctorApi from '../../api/doctorApi';

const PrescriptionGenerator = ({ patient, appointmentId, onSuccess }) => {
  const [formData, setFormData] = useState({
    patientId: patient?._id || '',
    appointmentId: appointmentId || '',
    diagnosis: '',
    notes: '',
    followUpDate: '',
  });

  const [medications, setMedications] = useState([
    {
      id: 1,
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      instructions: '',
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [generatedPrescription, setGeneratedPrescription] = useState(null);

  const frequencyOptions = [
    { value: 'once-daily', label: 'Once Daily' },
    { value: 'twice-daily', label: 'Twice Daily' },
    { value: 'thrice-daily', label: 'Three Times Daily' },
    { value: 'four-times-daily', label: 'Four Times Daily' },
    { value: 'every-4-hours', label: 'Every 4 Hours' },
    { value: 'every-6-hours', label: 'Every 6 Hours' },
    { value: 'every-8-hours', label: 'Every 8 Hours' },
    { value: 'every-12-hours', label: 'Every 12 Hours' },
    { value: 'before-meals', label: 'Before Meals' },
    { value: 'after-meals', label: 'After Meals' },
    { value: 'at-bedtime', label: 'At Bedtime' },
    { value: 'as-needed', label: 'As Needed' },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleMedicationChange = (id, field, value) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, [field]: value } : med
      )
    );
  };

  const addMedication = () => {
    const newId = Math.max(...medications.map((m) => m.id), 0) + 1;
    setMedications([
      ...medications,
      {
        id: newId,
        name: '',
        dosage: '',
        frequency: '',
        duration: '',
        instructions: '',
      },
    ]);
  };

  const removeMedication = (id) => {
    if (medications.length === 1) {
      setError('At least one medication is required');
      return;
    }
    setMedications((prev) => prev.filter((med) => med.id !== id));
  };

  const validateForm = () => {
    if (!formData.diagnosis.trim()) {
      setError('Diagnosis is required');
      return false;
    }

    const hasEmptyMedication = medications.some(
      (med) => !med.name.trim() || !med.dosage.trim() || !med.frequency
    );

    if (hasEmptyMedication) {
      setError('All medications must have name, dosage, and frequency');
      return false;
    }

    return true;
  };

  const handlePreview = () => {
    setError('');
    if (!validateForm()) return;
    setShowPreview(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const prescriptionData = {
        ...formData,
        medications: medications.map(({ id, ...med }) => med),
      };

      const response = await doctorApi.createPrescription(prescriptionData);
      setGeneratedPrescription(response.data);
      setSuccess('Prescription created successfully!');
      
      // Reset form
      setFormData({
        patientId: patient?._id || '',
        appointmentId: appointmentId || '',
        diagnosis: '',
        notes: '',
        followUpDate: '',
      });
      setMedications([
        {
          id: 1,
          name: '',
          dosage: '',
          frequency: '',
          duration: '',
          instructions: '',
        },
      ]);

      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      console.error('Error creating prescription:', err);
      setError(err.response?.data?.message || 'Failed to create prescription');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await doctorApi.downloadPrescriptionPDF(generatedPrescription._id);
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `prescription-${generatedPrescription._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading PDF:', err);
      setError('Failed to download PDF');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <>
      <Card>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Generate Prescription
                </h2>
                {patient && (
                  <p className="text-sm text-gray-600 mt-1">
                    For: {patient.name}
                  </p>
                )}
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
              {generatedPrescription && (
                <div className="mt-2 flex space-x-2">
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Download}
                    onClick={handleDownloadPDF}
                  >
                    Download PDF
                  </Button>
                </div>
              )}
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Patient Information (if not provided) */}
            {!patient && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900">Patient Information</h3>
                <FormInput
                  id="patientId"
                  name="patientId"
                  label="Patient ID"
                  placeholder="Enter patient ID"
                  value={formData.patientId}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* Diagnosis */}
            <div>
              <FormTextarea
                id="diagnosis"
                name="diagnosis"
                label="Diagnosis"
                placeholder="Enter diagnosis details"
                value={formData.diagnosis}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            {/* Medications */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Medications</h3>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  icon={Plus}
                  onClick={addMedication}
                >
                  Add Medication
                </Button>
              </div>

              <div className="space-y-4">
                {medications.map((medication, index) => (
                  <Card key={medication.id} className="bg-gray-50">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900">
                          Medication {index + 1}
                        </h4>
                        {medications.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeMedication(medication.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormInput
                          id={`med-name-${medication.id}`}
                          label="Medicine Name"
                          placeholder="e.g., Amoxicillin"
                          value={medication.name}
                          onChange={(e) =>
                            handleMedicationChange(medication.id, 'name', e.target.value)
                          }
                          required
                        />

                        <FormInput
                          id={`med-dosage-${medication.id}`}
                          label="Dosage"
                          placeholder="e.g., 500mg"
                          value={medication.dosage}
                          onChange={(e) =>
                            handleMedicationChange(medication.id, 'dosage', e.target.value)
                          }
                          required
                        />

                        <FormSelect
                          id={`med-frequency-${medication.id}`}
                          label="Frequency"
                          value={medication.frequency}
                          onChange={(e) =>
                            handleMedicationChange(medication.id, 'frequency', e.target.value)
                          }
                          options={frequencyOptions}
                          required
                        />

                        <FormInput
                          id={`med-duration-${medication.id}`}
                          label="Duration"
                          placeholder="e.g., 7 days"
                          value={medication.duration}
                          onChange={(e) =>
                            handleMedicationChange(medication.id, 'duration', e.target.value)
                          }
                        />
                      </div>

                      <FormTextarea
                        id={`med-instructions-${medication.id}`}
                        label="Special Instructions"
                        placeholder="e.g., Take with food, Avoid alcohol"
                        value={medication.instructions}
                        onChange={(e) =>
                          handleMedicationChange(medication.id, 'instructions', e.target.value)
                        }
                        rows={2}
                      />
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <FormTextarea
                id="notes"
                name="notes"
                label="Additional Notes"
                placeholder="Any additional instructions or precautions"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            {/* Follow-up Date */}
            <div>
              <FormInput
                id="followUpDate"
                name="followUpDate"
                type="date"
                label="Follow-up Date (Optional)"
                value={formData.followUpDate}
                onChange={handleChange}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="secondary"
                icon={Eye}
                onClick={handlePreview}
              >
                Preview
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={FileText}
                loading={loading}
              >
                Generate Prescription
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Prescription Preview"
        size="lg"
      >
        <div className="space-y-6">
          {/* Patient Info */}
          {patient && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <User className="h-5 w-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">Patient Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="ml-2 text-gray-900 font-medium">{patient.name}</span>
                </div>
                <div>
                  <span className="text-gray-600">Age:</span>
                  <span className="ml-2 text-gray-900 font-medium">{patient.age} years</span>
                </div>
                <div>
                  <span className="text-gray-600">Gender:</span>
                  <span className="ml-2 text-gray-900 font-medium">{patient.gender}</span>
                </div>
                <div>
                  <span className="text-gray-600">Date:</span>
                  <span className="ml-2 text-gray-900 font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Diagnosis */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Diagnosis</h3>
            <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{formData.diagnosis}</p>
          </div>

          {/* Medications */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Prescribed Medications</h3>
            <div className="space-y-3">
              {medications.map((med, index) => (
                <div key={med.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium text-gray-900">{index + 1}. {med.name}</h4>
                    <span className="text-sm text-gray-600">{med.dosage}</span>
                  </div>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      <span className="font-medium">Frequency:</span>{' '}
                      {frequencyOptions.find((opt) => opt.value === med.frequency)?.label}
                    </p>
                    {med.duration && (
                      <p>
                        <span className="font-medium">Duration:</span> {med.duration}
                      </p>
                    )}
                    {med.instructions && (
                      <p>
                        <span className="font-medium">Instructions:</span> {med.instructions}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Notes */}
          {formData.notes && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Additional Notes</h3>
              <p className="text-gray-700 p-3 bg-gray-50 rounded-lg">{formData.notes}</p>
            </div>
          )}

          {/* Follow-up */}
          {formData.followUpDate && (
            <div className="flex items-center space-x-2 text-sm p-3 bg-blue-50 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span className="text-gray-700">
                Follow-up scheduled for:{' '}
                <span className="font-medium text-blue-900">
                  {formatDate(formData.followUpDate)}
                </span>
              </span>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button variant="secondary" onClick={() => setShowPreview(false)}>
              Edit
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setShowPreview(false);
                handleSubmit(new Event('submit'));
              }}
              loading={loading}
            >
              Confirm & Generate
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PrescriptionGenerator;
