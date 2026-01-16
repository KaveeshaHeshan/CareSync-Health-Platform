import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText,
  Upload,
  Download,
  Eye,
  Share2,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  Stethoscope,
  FlaskConical,
  Pill,
  Image as ImageIcon,
  File,
  FolderOpen,
  X,
  Plus,
  ChevronRight,
  Grid3x3,
  List,
  ArrowUpDown,
  Trash2,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const MedicalRecords = () => {
  const navigate = useNavigate();
  
  // State management
  const [records, setRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid, list, timeline
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, name-asc, name-desc
  
  // Filter states
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  
  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  
  // Upload form
  const [uploadForm, setUploadForm] = useState({
    title: '',
    category: 'document',
    date: new Date().toISOString().split('T')[0],
    description: '',
    file: null
  });
  const [uploading, setUploading] = useState(false);
  
  // Share form
  const [shareForm, setShareForm] = useState({
    doctorId: '',
    message: ''
  });
  const [sharing, setSharing] = useState(false);

  // Categories
  const categories = [
    { id: 'all', label: 'All Records', icon: FolderOpen, color: 'slate' },
    { id: 'lab-result', label: 'Lab Results', icon: FlaskConical, color: 'blue' },
    { id: 'prescription', label: 'Prescriptions', icon: Pill, color: 'green' },
    { id: 'consultation', label: 'Consultations', icon: Stethoscope, color: 'purple' },
    { id: 'imaging', label: 'Imaging', icon: ImageIcon, color: 'indigo' },
    { id: 'document', label: 'Documents', icon: FileText, color: 'orange' }
  ];

  // Mock data - Replace with API call
  const mockRecords = [
    {
      id: '1',
      title: 'Complete Blood Count (CBC)',
      category: 'lab-result',
      date: new Date('2024-01-10'),
      doctor: 'Dr. Sarah Johnson',
      fileType: 'pdf',
      fileSize: '245 KB',
      description: 'Routine blood work showing normal ranges',
      tags: ['blood work', 'routine'],
      shared: false
    },
    {
      id: '2',
      title: 'Blood Pressure Medication',
      category: 'prescription',
      date: new Date('2024-01-08'),
      doctor: 'Dr. Michael Chen',
      fileType: 'pdf',
      fileSize: '128 KB',
      description: 'Lisinopril 10mg - Take once daily',
      tags: ['medication', 'blood pressure'],
      shared: true
    },
    {
      id: '3',
      title: 'Annual Physical Examination',
      category: 'consultation',
      date: new Date('2024-01-05'),
      doctor: 'Dr. Sarah Johnson',
      fileType: 'pdf',
      fileSize: '892 KB',
      description: 'Complete physical exam with health assessment',
      tags: ['physical', 'annual checkup'],
      shared: false
    },
    {
      id: '4',
      title: 'Chest X-Ray',
      category: 'imaging',
      date: new Date('2024-01-03'),
      doctor: 'Dr. Robert Williams',
      fileType: 'jpg',
      fileSize: '1.2 MB',
      description: 'Chest X-ray shows clear lungs',
      tags: ['x-ray', 'chest'],
      shared: false
    },
    {
      id: '5',
      title: 'Insurance Card',
      category: 'document',
      date: new Date('2023-12-15'),
      doctor: null,
      fileType: 'jpg',
      fileSize: '456 KB',
      description: 'Health insurance card - front and back',
      tags: ['insurance'],
      shared: false
    },
    {
      id: '6',
      title: 'Allergy Test Results',
      category: 'lab-result',
      date: new Date('2023-12-10'),
      doctor: 'Dr. Emily Davis',
      fileType: 'pdf',
      fileSize: '324 KB',
      description: 'Comprehensive allergy panel',
      tags: ['allergy', 'test results'],
      shared: true
    },
    {
      id: '7',
      title: 'Diabetes Management Plan',
      category: 'prescription',
      date: new Date('2023-12-05'),
      doctor: 'Dr. Michael Chen',
      fileType: 'pdf',
      fileSize: '567 KB',
      description: 'Treatment plan and medication schedule',
      tags: ['diabetes', 'management'],
      shared: true
    },
    {
      id: '8',
      title: 'Follow-up Consultation Notes',
      category: 'consultation',
      date: new Date('2023-11-28'),
      doctor: 'Dr. Sarah Johnson',
      fileType: 'pdf',
      fileSize: '198 KB',
      description: 'Follow-up after surgery',
      tags: ['follow-up', 'post-op'],
      shared: false
    }
  ];

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    applyFiltersAndSort();
  }, [records, searchQuery, selectedCategory, dateRange, sortBy]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFiltersAndSort = () => {
    let filtered = [...records];
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(record => record.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(record =>
        record.title.toLowerCase().includes(query) ||
        record.description.toLowerCase().includes(query) ||
        record.doctor?.toLowerCase().includes(query) ||
        record.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // Date range filter
    if (dateRange.start) {
      filtered = filtered.filter(record => 
        new Date(record.date) >= new Date(dateRange.start)
      );
    }
    if (dateRange.end) {
      filtered = filtered.filter(record => 
        new Date(record.date) <= new Date(dateRange.end)
      );
    }
    
    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.date) - new Date(a.date);
        case 'date-asc':
          return new Date(a.date) - new Date(b.date);
        case 'name-asc':
          return a.title.localeCompare(b.title);
        case 'name-desc':
          return b.title.localeCompare(a.title);
        default:
          return 0;
      }
    });
    
    setFilteredRecords(filtered);
  };

  const handleUploadFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadForm({ ...uploadForm, file });
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadForm.title || !uploadForm.file) {
      alert('Please provide title and file');
      return;
    }
    
    try {
      setUploading(true);
      
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const newRecord = {
        id: Date.now().toString(),
        title: uploadForm.title,
        category: uploadForm.category,
        date: new Date(uploadForm.date),
        doctor: null,
        fileType: uploadForm.file.name.split('.').pop(),
        fileSize: `${Math.round(uploadForm.file.size / 1024)} KB`,
        description: uploadForm.description,
        tags: [],
        shared: false
      };
      
      setRecords([newRecord, ...records]);
      setShowUploadModal(false);
      setUploadForm({
        title: '',
        category: 'document',
        date: new Date().toISOString().split('T')[0],
        description: '',
        file: null
      });
      
      alert('File uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

  const handleDownloadRecord = (record) => {
    // Simulate download
    alert(`Downloading ${record.title}...`);
    console.log('Downloading:', record);
  };

  const handleShareRecord = (record) => {
    setSelectedRecord(record);
    setShowShareModal(true);
  };

  const handleShareSubmit = async () => {
    if (!shareForm.doctorId) {
      alert('Please select a doctor');
      return;
    }
    
    try {
      setSharing(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update record shared status
      const updatedRecords = records.map(r =>
        r.id === selectedRecord.id ? { ...r, shared: true } : r
      );
      setRecords(updatedRecords);
      
      setShowShareModal(false);
      setShareForm({ doctorId: '', message: '' });
      alert('Record shared successfully!');
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share record');
    } finally {
      setSharing(false);
    }
  };

  const handleDeleteRecord = (recordId) => {
    const confirm = window.confirm('Are you sure you want to delete this record?');
    if (confirm) {
      setRecords(records.filter(r => r.id !== recordId));
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setDateRange({ start: '', end: '' });
  };

  const getCategoryInfo = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0];
  };

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'pdf':
        return <FileText size={40} className="text-red-600" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <ImageIcon size={40} className="text-blue-600" />;
      default:
        return <File size={40} className="text-slate-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading medical records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">Medical Records</h1>
              <p className="text-sm text-slate-600 mt-1">
                {filteredRecords.length} {filteredRecords.length === 1 ? 'record' : 'records'} found
              </p>
            </div>
            <Button onClick={() => setShowUploadModal(true)}>
              <Upload className="mr-2" size={20} />
              Upload Record
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters Bar */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search by title, doctor, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* View Mode */}
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg border transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
                title="Grid View"
              >
                <Grid3x3 size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg border transition-colors ${
                  viewMode === 'list'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
                title="List View"
              >
                <List size={20} />
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`p-2 rounded-lg border transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-indigo-50 border-indigo-600 text-indigo-600'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                }`}
                title="Timeline View"
              >
                <Clock size={20} />
              </button>
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
            </select>

            {/* Advanced Filters */}
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
            >
              <Filter className="mr-2" size={20} />
              Filters
            </Button>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-slate-200">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const Icon = category.icon;
              const count = category.id === 'all' 
                ? records.length 
                : records.filter(r => r.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedCategory === category.id
                      ? `bg-${category.color}-50 border-${category.color}-600 text-${category.color}-700`
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={20} />
                  <span className="font-medium">{category.label}</span>
                  <Badge variant={selectedCategory === category.id ? 'primary' : 'default'}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Records Display */}
        {filteredRecords.length === 0 ? (
          <Card className="text-center py-16">
            <FolderOpen className="mx-auto text-slate-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Records Found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || dateRange.start || dateRange.end
                ? 'Try adjusting your filters'
                : 'Upload your first medical record to get started'}
            </p>
            {!searchQuery && !dateRange.start && !dateRange.end && (
              <Button onClick={() => setShowUploadModal(true)}>
                <Upload className="mr-2" size={20} />
                Upload Record
              </Button>
            )}
          </Card>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecords.map((record) => {
                  const categoryInfo = getCategoryInfo(record.category);
                  const Icon = categoryInfo.icon;
                  
                  return (
                    <Card key={record.id} className="hover:shadow-lg transition-shadow">
                      <div className="flex items-start gap-3 mb-3">
                        <div className={`w-12 h-12 rounded-lg bg-${categoryInfo.color}-100 flex items-center justify-center`}>
                          <Icon className={`text-${categoryInfo.color}-600`} size={24} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-slate-900 mb-1">{record.title}</h3>
                          <p className="text-xs text-slate-600">{formatDate(record.date)}</p>
                        </div>
                        {record.shared && (
                          <Badge variant="success" size="sm">
                            <Share2 size={12} className="mr-1" />
                            Shared
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                        {record.description}
                      </p>
                      
                      {record.doctor && (
                        <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                          <User size={16} />
                          <span>{record.doctor}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                        <span>{record.fileType.toUpperCase()}</span>
                        <span>{record.fileSize}</span>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleViewRecord(record)}
                          size="sm"
                          className="flex-1"
                        >
                          <Eye size={16} className="mr-1" />
                          View
                        </Button>
                        <Button
                          onClick={() => handleDownloadRecord(record)}
                          variant="outline"
                          size="sm"
                        >
                          <Download size={16} />
                        </Button>
                        <Button
                          onClick={() => handleShareRecord(record)}
                          variant="outline"
                          size="sm"
                        >
                          <Share2 size={16} />
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <Card>
                <div className="divide-y divide-slate-200">
                  {filteredRecords.map((record) => {
                    const categoryInfo = getCategoryInfo(record.category);
                    const Icon = categoryInfo.icon;
                    
                    return (
                      <div key={record.id} className="p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-lg bg-${categoryInfo.color}-100 flex items-center justify-center flex-shrink-0`}>
                            <Icon className={`text-${categoryInfo.color}-600`} size={24} />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-900">{record.title}</h3>
                              {record.shared && (
                                <Badge variant="success" size="sm">
                                  Shared
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-slate-600 mb-1">{record.description}</p>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>{formatDate(record.date)}</span>
                              {record.doctor && (
                                <>
                                  <span>•</span>
                                  <span>{record.doctor}</span>
                                </>
                              )}
                              <span>•</span>
                              <span>{record.fileType.toUpperCase()} • {record.fileSize}</span>
                            </div>
                          </div>
                          
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={() => handleViewRecord(record)}
                              size="sm"
                            >
                              <Eye size={16} className="mr-1" />
                              View
                            </Button>
                            <Button
                              onClick={() => handleDownloadRecord(record)}
                              variant="outline"
                              size="sm"
                            >
                              <Download size={16} />
                            </Button>
                            <Button
                              onClick={() => handleShareRecord(record)}
                              variant="outline"
                              size="sm"
                            >
                              <Share2 size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}

            {/* Timeline View */}
            {viewMode === 'timeline' && (
              <div className="space-y-8">
                {filteredRecords.map((record, index) => {
                  const categoryInfo = getCategoryInfo(record.category);
                  const Icon = categoryInfo.icon;
                  
                  return (
                    <div key={record.id} className="relative">
                      {/* Timeline line */}
                      {index !== filteredRecords.length - 1 && (
                        <div className="absolute left-6 top-14 bottom-0 w-0.5 bg-slate-200" />
                      )}
                      
                      <div className="flex gap-4">
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-12 h-12 rounded-full bg-${categoryInfo.color}-100 flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`text-${categoryInfo.color}-600`} size={24} />
                        </div>
                        
                        {/* Content */}
                        <Card className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-slate-900">{record.title}</h3>
                                {record.shared && (
                                  <Badge variant="success" size="sm">
                                    <Share2 size={12} className="mr-1" />
                                    Shared
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-slate-600">{formatDate(record.date)}</p>
                            </div>
                            <Badge variant="default">{categoryInfo.label}</Badge>
                          </div>
                          
                          <p className="text-sm text-slate-600 mb-3">{record.description}</p>
                          
                          {record.doctor && (
                            <div className="flex items-center gap-2 text-sm text-slate-600 mb-4">
                              <User size={16} />
                              <span>{record.doctor}</span>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-500">
                              {record.fileType.toUpperCase()} • {record.fileSize}
                            </span>
                            <div className="flex gap-2">
                              <Button onClick={() => handleViewRecord(record)} size="sm">
                                <Eye size={16} className="mr-1" />
                                View
                              </Button>
                              <Button onClick={() => handleDownloadRecord(record)} variant="outline" size="sm">
                                <Download size={16} />
                              </Button>
                              <Button onClick={() => handleShareRecord(record)} variant="outline" size="sm">
                                <Share2 size={16} />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      <Modal
        isOpen={showUploadModal}
        onClose={() => !uploading && setShowUploadModal(false)}
        title="Upload Medical Record"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Title <span className="text-red-600">*</span>
            </label>
            <Input
              type="text"
              value={uploadForm.title}
              onChange={(e) => setUploadForm({ ...uploadForm, title: e.target.value })}
              placeholder="e.g., Blood Test Results"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Category <span className="text-red-600">*</span>
            </label>
            <select
              value={uploadForm.category}
              onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              {categories.filter(c => c.id !== 'all').map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Date <span className="text-red-600">*</span>
            </label>
            <Input
              type="date"
              value={uploadForm.date}
              onChange={(e) => setUploadForm({ ...uploadForm, date: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Description
            </label>
            <textarea
              value={uploadForm.description}
              onChange={(e) => setUploadForm({ ...uploadForm, description: e.target.value })}
              rows={3}
              placeholder="Add any notes or details..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              File <span className="text-red-600">*</span>
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-500 transition-colors">
              <input
                type="file"
                onChange={handleUploadFile}
                className="hidden"
                id="file-upload"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto text-slate-400 mb-2" size={32} />
                <p className="text-sm text-slate-600 mb-1">
                  {uploadForm.file ? uploadForm.file.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-xs text-slate-500">
                  PDF, JPG, PNG, DOC (max 10MB)
                </p>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowUploadModal(false)}
              variant="outline"
              disabled={uploading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleUploadSubmit}
              disabled={uploading}
              className="flex-1"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Record Details"
      >
        {selectedRecord && (
          <div className="space-y-6">
            <div className="text-center py-8 bg-slate-50 rounded-lg">
              {getFileIcon(selectedRecord.fileType)}
              <p className="mt-2 text-sm text-slate-600">
                {selectedRecord.fileType.toUpperCase()} • {selectedRecord.fileSize}
              </p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-slate-700">Title</label>
                <p className="text-slate-900">{selectedRecord.title}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Category</label>
                <p className="text-slate-900">{getCategoryInfo(selectedRecord.category).label}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700">Date</label>
                <p className="text-slate-900">{formatDate(selectedRecord.date)}</p>
              </div>

              {selectedRecord.doctor && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Doctor</label>
                  <p className="text-slate-900">{selectedRecord.doctor}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-slate-700">Description</label>
                <p className="text-slate-900">{selectedRecord.description}</p>
              </div>

              {selectedRecord.tags && selectedRecord.tags.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-slate-700">Tags</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selectedRecord.tags.map((tag, index) => (
                      <Badge key={index} variant="default">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => handleDownloadRecord(selectedRecord)}
                className="flex-1"
              >
                <Download className="mr-2" size={20} />
                Download
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleShareRecord(selectedRecord);
                }}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="mr-2" size={20} />
                Share
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleDeleteRecord(selectedRecord.id);
                }}
                variant="outline"
              >
                <Trash2 size={20} />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => !sharing && setShowShareModal(false)}
        title="Share Record with Doctor"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Sharing Medical Records</p>
                <p>This record will be accessible to the selected doctor in their patient records section.</p>
              </div>
            </div>
          </div>

          {selectedRecord && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-1">Record to Share:</p>
              <p className="text-slate-900">{selectedRecord.title}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Doctor <span className="text-red-600">*</span>
            </label>
            <select
              value={shareForm.doctorId}
              onChange={(e) => setShareForm({ ...shareForm, doctorId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a doctor...</option>
              <option value="1">Dr. Sarah Johnson - General Practice</option>
              <option value="2">Dr. Michael Chen - Cardiology</option>
              <option value="3">Dr. Emily Davis - Dermatology</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Message (Optional)
            </label>
            <textarea
              value={shareForm.message}
              onChange={(e) => setShareForm({ ...shareForm, message: e.target.value })}
              rows={3}
              placeholder="Add a message for your doctor..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowShareModal(false)}
              variant="outline"
              disabled={sharing}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleShareSubmit}
              disabled={sharing}
              className="flex-1"
            >
              {sharing ? 'Sharing...' : 'Share Record'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MedicalRecords;
