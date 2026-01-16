import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Eye, 
  Calendar, 
  User, 
  FileType,
  Image,
  File,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import patientApi from '../../api/patientApi';

const MedicalRecordCard = ({ record, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const getRecordTypeIcon = (type) => {
    const icons = {
      prescription: FileText,
      'lab-result': FileType,
      'medical-report': FileText,
      'imaging': Image,
      'discharge-summary': FileText,
      'vaccination': FileText,
      other: File,
    };
    const Icon = icons[type] || File;
    return <Icon className="h-5 w-5" />;
  };

  const getRecordTypeBadge = (type) => {
    const variants = {
      prescription: 'info',
      'lab-result': 'success',
      'medical-report': 'warning',
      'imaging': 'secondary',
      'discharge-summary': 'primary',
      'vaccination': 'success',
      other: 'default',
    };
    return variants[type] || 'default';
  };

  const getFileExtension = (filename) => {
    if (!filename) return '';
    const parts = filename.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toUpperCase() : '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      // If record has a direct file URL
      if (record.fileUrl) {
        const link = document.createElement('a');
        link.href = record.fileUrl;
        link.download = record.filename || 'medical-record';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (record._id) {
        // Download via API
        const response = await patientApi.downloadMedicalRecord(record._id);
        const blob = new Blob([response.data]);
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = record.filename || `record-${record._id}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error downloading record:', error);
      alert('Failed to download record');
    } finally {
      setDownloading(false);
    }
  };

  const handleViewDetails = () => {
    window.location.href = `/patient/medical-records/${record._id}`;
  };

  const handlePreview = () => {
    setShowPreviewModal(true);
  };

  const isImageFile = (filename) => {
    if (!filename) return false;
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext);
  };

  const isPDFFile = (filename) => {
    if (!filename) return false;
    return filename.toLowerCase().endsWith('.pdf');
  };

  return (
    <>
      <Card className="hover:shadow-lg transition-shadow">
        <div className="space-y-4">
          {/* Header Section */}
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`p-3 rounded-lg ${
                record.type === 'prescription' ? 'bg-blue-100' :
                record.type === 'lab-result' ? 'bg-green-100' :
                record.type === 'imaging' ? 'bg-purple-100' :
                'bg-gray-100'
              }`}>
                {getRecordTypeIcon(record.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {record.title || record.filename || 'Medical Record'}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {record.description || 'No description available'}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant={getRecordTypeBadge(record.type)} size="sm">
                    {record.type?.replace('-', ' ').toUpperCase() || 'DOCUMENT'}
                  </Badge>
                  {record.filename && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {getFileExtension(record.filename)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-gray-100">
            {/* Date */}
            <div className="flex items-center space-x-2 text-sm">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-gray-700 font-medium">
                  {formatDate(record.date || record.createdAt)}
                </p>
              </div>
            </div>

            {/* Doctor/Provider */}
            {record.doctor && (
              <div className="flex items-center space-x-2 text-sm">
                <User className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Provider</p>
                  <p className="text-gray-700 font-medium">
                    Dr. {record.doctor.name || 'Unknown'}
                  </p>
                </div>
              </div>
            )}

            {/* File Size */}
            {record.fileSize && (
              <div className="flex items-center space-x-2 text-sm">
                <FileType className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">File Size</p>
                  <p className="text-gray-700 font-medium">
                    {formatFileSize(record.fileSize)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Expandable Additional Details */}
          {(record.notes || record.diagnosis || record.medications) && (
            <div className="pt-3 border-t border-gray-100">
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center justify-between w-full text-sm text-gray-600 hover:text-gray-900"
              >
                <span className="font-medium">Additional Details</span>
                {expanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </button>

              {expanded && (
                <div className="mt-3 space-y-2 text-sm">
                  {record.diagnosis && (
                    <div>
                      <p className="text-gray-500 font-medium">Diagnosis:</p>
                      <p className="text-gray-700">{record.diagnosis}</p>
                    </div>
                  )}
                  {record.medications && (
                    <div>
                      <p className="text-gray-500 font-medium">Medications:</p>
                      <p className="text-gray-700">{record.medications}</p>
                    </div>
                  )}
                  {record.notes && (
                    <div>
                      <p className="text-gray-500 font-medium">Notes:</p>
                      <p className="text-gray-700">{record.notes}</p>
                    </div>
                  )}
                  {record.facility && (
                    <div>
                      <p className="text-gray-500 font-medium">Facility:</p>
                      <p className="text-gray-700">{record.facility}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex space-x-2">
              {/* Preview Button - Only for images and PDFs */}
              {(isImageFile(record.filename) || isPDFFile(record.filename)) && (
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={handlePreview}
                >
                  Preview
                </Button>
              )}

              {/* Download Button */}
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={handleDownload}
                loading={downloading}
              >
                Download
              </Button>

              {/* View Details Button */}
              <Button
                variant="secondary"
                size="sm"
                icon={ExternalLink}
                onClick={handleViewDetails}
              >
                View Details
              </Button>
            </div>

            {/* File Info */}
            {record.uploadedBy && (
              <div className="text-xs text-gray-500">
                Uploaded by {record.uploadedBy.name || 'System'}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        title={record.title || record.filename || 'Preview'}
        size="xl"
      >
        <div className="space-y-4">
          {/* Preview Content */}
          {isImageFile(record.filename) && record.fileUrl && (
            <div className="flex justify-center">
              <img
                src={record.fileUrl}
                alt={record.title || 'Medical record'}
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
          )}

          {isPDFFile(record.filename) && record.fileUrl && (
            <div className="w-full h-[600px]">
              <iframe
                src={record.fileUrl}
                title={record.title || 'Medical record'}
                className="w-full h-full border-0 rounded-lg"
              />
            </div>
          )}

          {/* Fallback if preview not available */}
          {!record.fileUrl && (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Preview not available</p>
              <Button
                variant="primary"
                size="sm"
                icon={Download}
                onClick={handleDownload}
                loading={downloading}
                className="mt-4"
              >
                Download to View
              </Button>
            </div>
          )}

          {/* Action Buttons in Modal */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={() => setShowPreviewModal(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              icon={Download}
              onClick={() => {
                handleDownload();
                setShowPreviewModal(false);
              }}
              loading={downloading}
            >
              Download
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MedicalRecordCard;
