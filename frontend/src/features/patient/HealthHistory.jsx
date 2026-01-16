import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertCircle, Activity, Pill, Heart } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/forms/FormInput';
import FormTextarea from '../../components/forms/FormTextarea';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import patientApi from '../../api/patientApi';

const HealthHistory = () => {
  const [healthData, setHealthData] = useState({
    allergies: [],
    conditions: [],
    medications: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState(''); // 'allergy', 'condition', 'medication'
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    severity: '',
    startDate: '',
    endDate: '',
    dosage: '',
  });

  useEffect(() => {
    fetchHealthHistory();
  }, []);

  const fetchHealthHistory = async () => {
    setLoading(true);
    try {
      const response = await patientApi.getHealthHistory();
      setHealthData(response.data || { allergies: [], conditions: [], medications: [] });
    } catch (err) {
      console.error('Error fetching health history:', err);
      setError('Failed to load health history');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type, item = null) => {
    setModalType(type);
    setEditingItem(item);
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        severity: item.severity || '',
        startDate: item.startDate || '',
        endDate: item.endDate || '',
        dosage: item.dosage || '',
      });
    } else {
      setFormData({
        name: '',
        description: '',
        severity: '',
        startDate: '',
        endDate: '',
        dosage: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalType('');
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      severity: '',
      startDate: '',
      endDate: '',
      dosage: '',
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
      };

      if (modalType === 'allergy') {
        payload.severity = formData.severity;
      } else if (modalType === 'condition') {
        payload.startDate = formData.startDate;
        if (formData.endDate) payload.endDate = formData.endDate;
      } else if (modalType === 'medication') {
        payload.dosage = formData.dosage;
        payload.startDate = formData.startDate;
      }

      if (editingItem) {
        // Update existing item
        await patientApi.updateHealthHistory({
          type: modalType,
          id: editingItem._id,
          data: payload,
        });
      } else {
        // Add new item
        await patientApi.addHealthHistoryItem(modalType, payload);
      }

      await fetchHealthHistory();
      handleCloseModal();
    } catch (err) {
      console.error('Error saving health history:', err);
      setError(err.response?.data?.message || 'Failed to save. Please try again.');
    }
  };

  const handleDelete = async (type, itemId) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await patientApi.deleteHealthHistoryItem(type, itemId);
      await fetchHealthHistory();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item');
    }
  };

  const renderModalContent = () => {
    const titles = {
      allergy: 'Allergy',
      condition: 'Medical Condition',
      medication: 'Medication',
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="name"
          name="name"
          label={`${titles[modalType]} Name`}
          placeholder={`Enter ${modalType} name`}
          value={formData.name}
          onChange={handleChange}
          required
        />

        <FormTextarea
          id="description"
          name="description"
          label="Description"
          placeholder="Additional details"
          value={formData.description}
          onChange={handleChange}
          rows={3}
        />

        {modalType === 'allergy' && (
          <FormInput
            id="severity"
            name="severity"
            label="Severity"
            placeholder="e.g., Mild, Moderate, Severe"
            value={formData.severity}
            onChange={handleChange}
          />
        )}

        {modalType === 'condition' && (
          <>
            <FormInput
              id="startDate"
              name="startDate"
              type="date"
              label="Diagnosed Date"
              value={formData.startDate}
              onChange={handleChange}
            />
            <FormInput
              id="endDate"
              name="endDate"
              type="date"
              label="Recovery Date (Optional)"
              value={formData.endDate}
              onChange={handleChange}
            />
          </>
        )}

        {modalType === 'medication' && (
          <>
            <FormInput
              id="dosage"
              name="dosage"
              label="Dosage"
              placeholder="e.g., 500mg twice daily"
              value={formData.dosage}
              onChange={handleChange}
            />
            <FormInput
              id="startDate"
              name="startDate"
              type="date"
              label="Start Date"
              value={formData.startDate}
              onChange={handleChange}
            />
          </>
        )}

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {editingItem ? 'Update' : 'Add'}
          </Button>
        </div>
      </form>
    );
  };

  const renderAllergyCard = (allergy) => (
    <Card key={allergy._id} className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{allergy.name}</h4>
            {allergy.description && (
              <p className="text-sm text-gray-600 mt-1">{allergy.description}</p>
            )}
            {allergy.severity && (
              <Badge variant="danger" size="sm" className="mt-2">
                {allergy.severity}
              </Badge>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenModal('allergy', allergy)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete('allergy', allergy._id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );

  const renderConditionCard = (condition) => (
    <Card key={condition._id} className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Activity className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{condition.name}</h4>
            {condition.description && (
              <p className="text-sm text-gray-600 mt-1">{condition.description}</p>
            )}
            <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
              {condition.startDate && (
                <span>Since: {new Date(condition.startDate).toLocaleDateString()}</span>
              )}
              {condition.endDate && (
                <Badge variant="success" size="sm">Recovered</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenModal('condition', condition)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete('condition', condition._id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );

  const renderMedicationCard = (medication) => (
    <Card key={medication._id} className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Pill className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900">{medication.name}</h4>
            {medication.dosage && (
              <p className="text-sm text-gray-600 mt-1">{medication.dosage}</p>
            )}
            {medication.description && (
              <p className="text-sm text-gray-600 mt-1">{medication.description}</p>
            )}
            {medication.startDate && (
              <p className="text-xs text-gray-500 mt-2">
                Started: {new Date(medication.startDate).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => handleOpenModal('medication', medication)}
            className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
          >
            <Edit2 className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleDelete('medication', medication._id)}
            className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </Card>
  );

  if (loading) {
    return <Spinner size="lg" text="Loading health history..." fullScreen />;
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="error" closable onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Allergies Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-6 w-6 text-red-600" />
            <h2 className="text-xl font-semibold text-gray-900">Allergies</h2>
            {healthData.allergies.length > 0 && (
              <Badge variant="danger">{healthData.allergies.length}</Badge>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => handleOpenModal('allergy')}
          >
            Add Allergy
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.allergies.length > 0 ? (
            healthData.allergies.map(renderAllergyCard)
          ) : (
            <Card className="col-span-full">
              <p className="text-center text-gray-500 py-4">
                No allergies recorded. Click "Add Allergy" to add one.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Medical Conditions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-6 w-6 text-orange-600" />
            <h2 className="text-xl font-semibold text-gray-900">Medical Conditions</h2>
            {healthData.conditions.length > 0 && (
              <Badge variant="warning">{healthData.conditions.length}</Badge>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => handleOpenModal('condition')}
          >
            Add Condition
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.conditions.length > 0 ? (
            healthData.conditions.map(renderConditionCard)
          ) : (
            <Card className="col-span-full">
              <p className="text-center text-gray-500 py-4">
                No medical conditions recorded. Click "Add Condition" to add one.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Medications Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Pill className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Current Medications</h2>
            {healthData.medications.length > 0 && (
              <Badge variant="info">{healthData.medications.length}</Badge>
            )}
          </div>
          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => handleOpenModal('medication')}
          >
            Add Medication
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {healthData.medications.length > 0 ? (
            healthData.medications.map(renderMedicationCard)
          ) : (
            <Card className="col-span-full">
              <p className="text-center text-gray-500 py-4">
                No medications recorded. Click "Add Medication" to add one.
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`${editingItem ? 'Edit' : 'Add'} ${
          modalType === 'allergy' ? 'Allergy' : 
          modalType === 'condition' ? 'Medical Condition' : 
          'Medication'
        }`}
        size="md"
      >
        {renderModalContent()}
      </Modal>
    </div>
  );
};

export default HealthHistory;
