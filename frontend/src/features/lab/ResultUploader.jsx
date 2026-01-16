import React, { useState, useRef } from 'react';
import {
  Upload,
  File,
  Image as ImageIcon,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Download,
  Eye,
  Trash2,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import FormInput from '../../components/forms/FormInput';
import FormSelect from '../../components/forms/FormSelect';
import FormTextarea from '../../components/forms/FormTextarea';
import labApi from '../../api/labApi';

const ResultUploader = () => {
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    patientId: '',
    patientName: '',
    testName: '',
    testCategory: '',
    notes: '',
    files: [],
  });

  // Preview modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const fileInputRef = useRef(null);

  const testCategories = [
    { value: 'blood-test', label: 'Blood Test' },
    { value: 'urine-test', label: 'Urine Test' },
    { value: 'imaging', label: 'Imaging (X-Ray, MRI, CT)' },
    { value: 'biopsy', label: 'Biopsy' },
    { value: 'pathology', label: 'Pathology' },
    { value: 'microbiology', label: 'Microbiology' },
    { value: 'genetic', label: 'Genetic Testing' },
    { value: 'other', label: 'Other' },
  ];

  const allowedFileTypes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = (files) => {
    setError('');
    const validFiles = [];
    const errors = [];

    files.forEach((file) => {
      // Check file type
      if (!allowedFileTypes.includes(file.type)) {
        errors.push(`${file.name}: Invalid file type. Only PDF and images are allowed.`);
        return;
      }

      // Check file size
      if (file.size > maxFileSize) {
        errors.push(`${file.name}: File size exceeds 10MB limit.`);
        return;
      }

      // Create file preview
      const fileData = {
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        id: Math.random().toString(36).substring(7),
      };

      validFiles.push(fileData);
    });

    if (errors.length > 0) {
      setError(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...validFiles],
      }));
    }
  };

  const removeFile = (fileId) => {
    setFormData((prev) => ({
      ...prev,
      files: prev.files.filter((f) => f.id !== fileId),
    }));
  };

  const handlePreview = (file) => {
    setPreviewFile(file);
    setShowPreviewModal(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (type) => {
    if (type === 'application/pdf') {
      return <FileText className="h-8 w-8 text-red-600" />;
    } else if (type.startsWith('image/')) {
      return <ImageIcon className="h-8 w-8 text-blue-600" />;
    }
    return <File className="h-8 w-8 text-gray-600" />;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!formData.patientId.trim()) {
      setError('Please enter Patient ID');
      return;
    }
    if (!formData.patientName.trim()) {
      setError('Please enter Patient Name');
      return;
    }
    if (!formData.testName.trim()) {
      setError('Please enter Test Name');
      return;
    }
    if (!formData.testCategory) {
      setError('Please select Test Category');
      return;
    }
    if (formData.files.length === 0) {
      setError('Please upload at least one file');
      return;
    }

    setUploading(true);

    try {
      // Create FormData for file upload
      const uploadData = new FormData();
      uploadData.append('patientId', formData.patientId);
      uploadData.append('patientName', formData.patientName);
      uploadData.append('testName', formData.testName);
      uploadData.append('testCategory', formData.testCategory);
      uploadData.append('notes', formData.notes);

      formData.files.forEach((fileData) => {
        uploadData.append('files', fileData.file);
      });

      await labApi.uploadLabResult(uploadData);

      setSuccess('Lab results uploaded successfully!');
      
      // Add to uploaded files list
      setUploadedFiles((prev) => [
        {
          id: Date.now(),
          patientName: formData.patientName,
          testName: formData.testName,
          testCategory: formData.testCategory,
          files: formData.files,
          uploadDate: new Date().toISOString(),
        },
        ...prev,
      ]);

      // Reset form
      setFormData({
        patientId: '',
        patientName: '',
        testName: '',
        testCategory: '',
        notes: '',
        files: [],
      });

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error uploading results:', err);
      setError(err.response?.data?.message || 'Failed to upload lab results');
    } finally {
      setUploading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      patientId: '',
      patientName: '',
      testName: '',
      testCategory: '',
      notes: '',
      files: [],
    });
    setError('');
    setSuccess('');
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Upload className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Upload Lab Results
              </h2>
              <p className="text-sm text-gray-600">
                Upload patient lab test results and reports
              </p>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="error" closable onClose={() => setError('')}>
            <pre className="whitespace-pre-wrap text-sm">{error}</pre>
          </Alert>
        )}
        {success && (
          <Alert variant="success" closable onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Upload Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">
                Patient & Test Information
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Patient ID"
                    placeholder="Enter patient ID or medical record number"
                    value={formData.patientId}
                    onChange={(e) =>
                      setFormData({ ...formData, patientId: e.target.value })
                    }
                    required
                  />

                  <FormInput
                    label="Patient Name"
                    placeholder="Enter patient full name"
                    value={formData.patientName}
                    onChange={(e) =>
                      setFormData({ ...formData, patientName: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput
                    label="Test Name"
                    placeholder="E.g., Complete Blood Count, Lipid Panel"
                    value={formData.testName}
                    onChange={(e) =>
                      setFormData({ ...formData, testName: e.target.value })
                    }
                    required
                  />

                  <FormSelect
                    label="Test Category"
                    value={formData.testCategory}
                    onChange={(e) =>
                      setFormData({ ...formData, testCategory: e.target.value })
                    }
                    options={testCategories}
                    required
                  />
                </div>

                <FormTextarea
                  label="Notes (Optional)"
                  placeholder="Add any additional notes or observations..."
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                />
              </div>
            </Card.Body>
          </Card>

          {/* File Upload Area */}
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Files
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Accepted formats: PDF, JPG, PNG, GIF (Max 10MB per file)
              </p>
            </Card.Header>
            <Card.Body>
              {/* Drag & Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.gif"
                  onChange={handleFileInput}
                  className="hidden"
                />

                <div className="space-y-3">
                  <div className="flex justify-center">
                    <Upload className="h-12 w-12 text-gray-400" />
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="text-indigo-600 hover:text-indigo-700 font-medium"
                    >
                      Click to upload
                    </button>
                    <span className="text-gray-600"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, JPG, PNG, GIF up to 10MB
                  </p>
                </div>
              </div>

              {/* Uploaded Files List */}
              {formData.files.length > 0 && (
                <div className="mt-6 space-y-3">
                  <h4 className="font-medium text-gray-900">
                    Selected Files ({formData.files.length})
                  </h4>
                  <div className="space-y-2">
                    {formData.files.map((fileData) => (
                      <div
                        key={fileData.id}
                        className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-300 transition-colors"
                      >
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex-shrink-0">
                            {getFileIcon(fileData.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {fileData.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {formatFileSize(fileData.size)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 ml-4">
                          {fileData.preview && (
                            <button
                              type="button"
                              onClick={() => handlePreview(fileData)}
                              className="p-1 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded"
                              title="Preview"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => removeFile(fileData.id)}
                            className="p-1 text-red-600 hover:text-red-700 hover:bg-red-50 rounded"
                            title="Remove"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={handleReset}
              disabled={uploading}
            >
              Reset
            </Button>
            <Button
              type="submit"
              variant="primary"
              icon={Upload}
              loading={uploading}
              disabled={formData.files.length === 0}
            >
              Upload Results
            </Button>
          </div>
        </form>

        {/* Recently Uploaded */}
        {uploadedFiles.length > 0 && (
          <Card>
            <Card.Header>
              <h3 className="text-lg font-semibold text-gray-900">
                Recently Uploaded
              </h3>
            </Card.Header>
            <Card.Body>
              <div className="space-y-4">
                {uploadedFiles.map((upload) => (
                  <div
                    key={upload.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <h4 className="font-medium text-gray-900">
                            {upload.testName}
                          </h4>
                          <Badge variant="info">
                            {testCategories.find(
                              (c) => c.value === upload.testCategory
                            )?.label}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>Patient: {upload.patientName}</p>
                          <p>
                            Files: {upload.files.length} file(s)
                          </p>
                          <p className="text-xs text-gray-500">
                            Uploaded:{' '}
                            {new Date(upload.uploadDate).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card.Body>
          </Card>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => {
          setShowPreviewModal(false);
          setPreviewFile(null);
        }}
        title="File Preview"
        size="lg"
      >
        {previewFile && (
          <div className="space-y-4">
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-900">
                {previewFile.name}
              </p>
              <p className="text-xs text-gray-600">
                {formatFileSize(previewFile.size)}
              </p>
            </div>

            {previewFile.preview ? (
              <div className="flex justify-center bg-gray-100 rounded-lg p-4">
                <img
                  src={previewFile.preview}
                  alt={previewFile.name}
                  className="max-w-full max-h-96 object-contain rounded"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-gray-50 rounded-lg">
                <FileText className="h-16 w-16 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">
                  PDF preview not available
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  File will be viewable after upload
                </p>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="secondary"
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewFile(null);
                }}
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};

export default ResultUploader;
