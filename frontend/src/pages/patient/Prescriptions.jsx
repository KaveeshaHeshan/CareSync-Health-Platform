import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Pill,
  Download,
  Calendar,
  Clock,
  User,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  MapPin,
  Phone,
  FileText,
  Info,
  Package,
  ClipboardList,
  AlertTriangle,
  ChevronRight,
  Building2
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const Prescriptions = () => {
  const navigate = useNavigate();
  
  // State management
  const [prescriptions, setPrescriptions] = useState([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, completed, expired
  const [dateFilter, setDateFilter] = useState('all'); // all, last30, last90, lastyear
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showRefillModal, setShowRefillModal] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  
  // Refill form
  const [refillForm, setRefillForm] = useState({
    pharmacyId: '',
    deliveryAddress: '',
    notes: ''
  });
  const [requestingRefill, setRequestingRefill] = useState(false);

  // Status tabs
  const statusTabs = [
    { id: 'all', label: 'All', count: 0 },
    { id: 'active', label: 'Active', count: 0, color: 'text-green-600' },
    { id: 'completed', label: 'Completed', count: 0, color: 'text-blue-600' },
    { id: 'expired', label: 'Expired', count: 0, color: 'text-red-600' }
  ];

  // Mock data - Replace with API call
  const mockPrescriptions = [
    {
      id: '1',
      prescriptionId: 'RX-2024-001',
      medication: 'Metformin',
      genericName: 'Metformin Hydrochloride',
      dosage: '500mg',
      frequency: 'Twice daily',
      duration: '90 days',
      quantity: '180 tablets',
      refills: 2,
      refillsUsed: 0,
      status: 'active',
      prescribedDate: new Date('2024-01-10'),
      expiryDate: new Date('2024-04-10'),
      lastRefillDate: null,
      doctor: {
        name: 'Dr. Michael Chen',
        specialization: 'Endocrinology',
        phone: '(555) 123-4567'
      },
      pharmacy: {
        name: 'CareSync Pharmacy',
        address: '123 Medical Plaza, Suite 100',
        phone: '(555) 987-6543'
      },
      instructions: 'Take with meals. Swallow whole, do not crush or chew.',
      sideEffects: 'May cause nausea, diarrhea, or stomach upset. Contact doctor if severe.',
      warnings: 'Do not take if you have kidney disease. Avoid alcohol.',
      purpose: 'Treatment of Type 2 Diabetes',
      notes: 'Monitor blood sugar levels regularly'
    },
    {
      id: '2',
      prescriptionId: 'RX-2024-002',
      medication: 'Lisinopril',
      genericName: 'Lisinopril',
      dosage: '10mg',
      frequency: 'Once daily in the morning',
      duration: '30 days',
      quantity: '30 tablets',
      refills: 5,
      refillsUsed: 2,
      status: 'active',
      prescribedDate: new Date('2024-01-08'),
      expiryDate: new Date('2024-07-08'),
      lastRefillDate: new Date('2024-01-15'),
      doctor: {
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiology',
        phone: '(555) 234-5678'
      },
      pharmacy: {
        name: 'CareSync Pharmacy',
        address: '123 Medical Plaza, Suite 100',
        phone: '(555) 987-6543'
      },
      instructions: 'Take at the same time each day. Can be taken with or without food.',
      sideEffects: 'Dizziness, headache, persistent dry cough. Report swelling immediately.',
      warnings: 'Avoid potassium supplements. Do not use during pregnancy.',
      purpose: 'Treatment of High Blood Pressure',
      notes: 'Check blood pressure regularly'
    },
    {
      id: '3',
      prescriptionId: 'RX-2024-003',
      medication: 'Amoxicillin',
      genericName: 'Amoxicillin',
      dosage: '500mg',
      frequency: 'Three times daily',
      duration: '10 days',
      quantity: '30 capsules',
      refills: 0,
      refillsUsed: 0,
      status: 'completed',
      prescribedDate: new Date('2023-12-20'),
      expiryDate: new Date('2023-12-30'),
      lastRefillDate: null,
      doctor: {
        name: 'Dr. Emily Davis',
        specialization: 'General Practice',
        phone: '(555) 345-6789'
      },
      pharmacy: {
        name: 'MediCare Pharmacy',
        address: '456 Health Street',
        phone: '(555) 876-5432'
      },
      instructions: 'Take at evenly spaced intervals. Complete full course even if feeling better.',
      sideEffects: 'Nausea, vomiting, diarrhea, rash. Stop if allergic reaction occurs.',
      warnings: 'Inform doctor of any antibiotic allergies. Take probiotics if needed.',
      purpose: 'Treatment of Bacterial Infection',
      notes: 'Full course completed successfully'
    },
    {
      id: '4',
      prescriptionId: 'RX-2024-004',
      medication: 'Atorvastatin',
      genericName: 'Atorvastatin Calcium',
      dosage: '20mg',
      frequency: 'Once daily at bedtime',
      duration: '90 days',
      quantity: '90 tablets',
      refills: 3,
      refillsUsed: 0,
      status: 'active',
      prescribedDate: new Date('2024-01-05'),
      expiryDate: new Date('2024-04-05'),
      lastRefillDate: null,
      doctor: {
        name: 'Dr. Michael Chen',
        specialization: 'Cardiology',
        phone: '(555) 123-4567'
      },
      pharmacy: {
        name: 'CareSync Pharmacy',
        address: '123 Medical Plaza, Suite 100',
        phone: '(555) 987-6543'
      },
      instructions: 'Take in the evening with or without food. Avoid grapefruit juice.',
      sideEffects: 'Muscle pain, weakness, liver problems. Report unexplained muscle pain.',
      warnings: 'Avoid alcohol. Regular liver function tests recommended.',
      purpose: 'Cholesterol Management',
      notes: 'Monitor lipid levels every 3 months'
    },
    {
      id: '5',
      prescriptionId: 'RX-2023-015',
      medication: 'Omeprazole',
      genericName: 'Omeprazole',
      dosage: '20mg',
      frequency: 'Once daily before breakfast',
      duration: '30 days',
      quantity: '30 capsules',
      refills: 2,
      refillsUsed: 2,
      status: 'expired',
      prescribedDate: new Date('2023-10-15'),
      expiryDate: new Date('2023-12-15'),
      lastRefillDate: new Date('2023-11-20'),
      doctor: {
        name: 'Dr. Sarah Johnson',
        specialization: 'Gastroenterology',
        phone: '(555) 234-5678'
      },
      pharmacy: {
        name: 'HealthFirst Pharmacy',
        address: '789 Wellness Ave',
        phone: '(555) 765-4321'
      },
      instructions: 'Take 30 minutes before first meal. Swallow whole.',
      sideEffects: 'Headache, stomach pain, nausea, diarrhea.',
      warnings: 'Long-term use may increase risk of bone fractures.',
      purpose: 'Treatment of GERD',
      notes: 'Prescription expired - contact doctor for renewal'
    }
  ];

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [prescriptions, searchQuery, statusFilter, dateFilter]);

  const fetchPrescriptions = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setPrescriptions(mockPrescriptions);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...prescriptions];
    
    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(rx => rx.status === statusFilter);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(rx =>
        rx.medication.toLowerCase().includes(query) ||
        rx.genericName.toLowerCase().includes(query) ||
        rx.prescriptionId.toLowerCase().includes(query) ||
        rx.doctor.name.toLowerCase().includes(query)
      );
    }
    
    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(rx => {
        const rxDate = new Date(rx.prescribedDate);
        const daysDiff = Math.floor((now - rxDate) / (1000 * 60 * 60 * 24));
        
        switch (dateFilter) {
          case 'last30':
            return daysDiff <= 30;
          case 'last90':
            return daysDiff <= 90;
          case 'lastyear':
            return daysDiff <= 365;
          default:
            return true;
        }
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.prescribedDate) - new Date(a.prescribedDate));
    
    setFilteredPrescriptions(filtered);
  };

  const handleViewDetails = (prescription) => {
    setSelectedPrescription(prescription);
    setShowDetailModal(true);
  };

  const handleRequestRefill = (prescription) => {
    setSelectedPrescription(prescription);
    setRefillForm({
      pharmacyId: prescription.pharmacy.name,
      deliveryAddress: '',
      notes: ''
    });
    setShowRefillModal(true);
  };

  const handleRefillSubmit = async () => {
    if (!refillForm.pharmacyId) {
      alert('Please select a pharmacy');
      return;
    }
    
    try {
      setRequestingRefill(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setShowRefillModal(false);
      setRefillForm({ pharmacyId: '', deliveryAddress: '', notes: '' });
      alert('Refill request submitted successfully! You will be notified when it\'s ready.');
    } catch (error) {
      console.error('Refill request error:', error);
      alert('Failed to submit refill request');
    } finally {
      setRequestingRefill(false);
    }
  };

  const handleDownloadPdf = (prescription) => {
    // Simulate PDF download
    alert(`Downloading ${prescription.medication} prescription...`);
    console.log('Downloading:', prescription);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Active</Badge>;
      case 'completed':
        return <Badge variant="default">Completed</Badge>;
      case 'expired':
        return <Badge variant="danger">Expired</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'completed':
        return <CheckCircle className="text-blue-600" size={20} />;
      case 'expired':
        return <XCircle className="text-red-600" size={20} />;
      default:
        return <AlertCircle className="text-slate-600" size={20} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-50 border-green-200';
      case 'completed':
        return 'bg-blue-50 border-blue-200';
      case 'expired':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-slate-50 border-slate-200';
    }
  };

  const isRefillAvailable = (prescription) => {
    return prescription.status === 'active' && 
           prescription.refillsUsed < prescription.refills;
  };

  const getDaysUntilExpiry = (expiryDate) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysDiff = Math.floor((expiry - now) / (1000 * 60 * 60 * 24));
    return daysDiff;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading prescriptions...</p>
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
              <h1 className="text-3xl font-bold text-slate-900">My Prescriptions</h1>
              <p className="text-sm text-slate-600 mt-1">
                {filteredPrescriptions.length} {filteredPrescriptions.length === 1 ? 'prescription' : 'prescriptions'} found
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <ClipboardList className="mr-2" size={20} />
                Request New Prescription
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                <Input
                  type="text"
                  placeholder="Search by medication, prescription ID, or doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="all">All Time</option>
              <option value="last30">Last 30 Days</option>
              <option value="last90">Last 90 Days</option>
              <option value="lastyear">Last Year</option>
            </select>
          </div>
        </Card>

        {/* Status Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {statusTabs.map((tab) => {
              const count = tab.id === 'all' 
                ? prescriptions.length 
                : prescriptions.filter(rx => rx.status === tab.id).length;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    statusFilter === tab.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Pill size={20} />
                  <span className="font-medium">{tab.label}</span>
                  <Badge variant={statusFilter === tab.id ? 'primary' : 'default'}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Prescriptions List */}
        {filteredPrescriptions.length === 0 ? (
          <Card className="text-center py-16">
            <Pill className="mx-auto text-slate-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Prescriptions Found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your prescriptions will appear here'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredPrescriptions.map((prescription) => {
              const daysUntilExpiry = getDaysUntilExpiry(prescription.expiryDate);
              const isExpiringSoon = daysUntilExpiry <= 7 && daysUntilExpiry > 0;
              
              return (
                <Card key={prescription.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center border-2 ${getStatusColor(prescription.status)}`}>
                        {getStatusIcon(prescription.status)}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {prescription.medication}
                          </h3>
                          {getStatusBadge(prescription.status)}
                          {isExpiringSoon && (
                            <Badge variant="warning">
                              <AlertTriangle size={12} className="mr-1" />
                              Expiring Soon
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm text-slate-600 mb-2">{prescription.genericName}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                          <span className="flex items-center gap-1 font-medium">
                            <Package size={16} />
                            {prescription.dosage}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={16} />
                            {prescription.frequency}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {prescription.duration}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600">
                          <span className="flex items-center gap-1">
                            <FileText size={16} />
                            {prescription.prescriptionId}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={16} />
                            {prescription.doctor.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            Prescribed: {formatDate(prescription.prescribedDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDetails(prescription)}
                        size="sm"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDownloadPdf(prescription)}
                        variant="outline"
                        size="sm"
                      >
                        <Download size={16} />
                      </Button>
                      {isRefillAvailable(prescription) && (
                        <Button
                          onClick={() => handleRequestRefill(prescription)}
                          variant="outline"
                          size="sm"
                        >
                          <RefreshCw size={16} className="mr-1" />
                          Refill
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Refill Info */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                    <div className="flex items-center gap-6 text-sm">
                      <div>
                        <span className="text-slate-600">Refills: </span>
                        <span className="font-medium text-slate-900">
                          {prescription.refillsUsed} / {prescription.refills} used
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-600">Expires: </span>
                        <span className={`font-medium ${isExpiringSoon ? 'text-orange-600' : 'text-slate-900'}`}>
                          {formatDate(prescription.expiryDate)}
                          {daysUntilExpiry > 0 && ` (${daysUntilExpiry} days)`}
                        </span>
                      </div>
                      {prescription.lastRefillDate && (
                        <div>
                          <span className="text-slate-600">Last Refill: </span>
                          <span className="font-medium text-slate-900">
                            {formatDate(prescription.lastRefillDate)}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Building2 size={16} />
                      <span>{prescription.pharmacy.name}</span>
                    </div>
                  </div>

                  {/* Instructions Preview */}
                  {prescription.instructions && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex gap-2">
                        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-blue-800">{prescription.instructions}</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal
        isOpen={showDetailModal}
        onClose={() => setShowDetailModal(false)}
        title="Prescription Details"
        size="xl"
      >
        {selectedPrescription && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold text-slate-900">
                    {selectedPrescription.medication}
                  </h2>
                  {getStatusBadge(selectedPrescription.status)}
                </div>
                <p className="text-slate-600">{selectedPrescription.genericName}</p>
                <p className="text-sm text-slate-500 mt-1">
                  ID: {selectedPrescription.prescriptionId}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-xl flex items-center justify-center border-2 ${getStatusColor(selectedPrescription.status)}`}>
                <Pill size={32} className={selectedPrescription.status === 'active' ? 'text-green-600' : 'text-slate-600'} />
              </div>
            </div>

            {/* Dosage Information */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Dosage Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Dosage</p>
                  <p className="font-semibold text-slate-900">{selectedPrescription.dosage}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Frequency</p>
                  <p className="font-semibold text-slate-900">{selectedPrescription.frequency}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Duration</p>
                  <p className="font-semibold text-slate-900">{selectedPrescription.duration}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-600 mb-1">Quantity</p>
                  <p className="font-semibold text-slate-900">{selectedPrescription.quantity}</p>
                </div>
              </div>
            </div>

            {/* Purpose */}
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
              <p className="text-sm font-medium text-indigo-900 mb-1">Purpose</p>
              <p className="text-indigo-800">{selectedPrescription.purpose}</p>
            </div>

            {/* Instructions */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Instructions</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex gap-3">
                  <Info className="text-blue-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-blue-800">{selectedPrescription.instructions}</p>
                </div>
              </div>
            </div>

            {/* Side Effects */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Possible Side Effects</h3>
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-yellow-800">{selectedPrescription.sideEffects}</p>
                </div>
              </div>
            </div>

            {/* Warnings */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-2">Warnings</h3>
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex gap-3">
                  <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
                  <p className="text-sm text-red-800">{selectedPrescription.warnings}</p>
                </div>
              </div>
            </div>

            {/* Refill Information */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Refills Available</p>
                <p className="font-semibold text-slate-900">
                  {selectedPrescription.refills - selectedPrescription.refillsUsed} of {selectedPrescription.refills}
                </p>
              </div>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-600 mb-1">Expiry Date</p>
                <p className="font-semibold text-slate-900">
                  {formatDate(selectedPrescription.expiryDate)}
                </p>
              </div>
            </div>

            {/* Doctor Information */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Prescribing Doctor</h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-900">{selectedPrescription.doctor.name}</p>
                <p className="text-sm text-slate-600 mb-2">{selectedPrescription.doctor.specialization}</p>
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <Phone size={14} />
                  {selectedPrescription.doctor.phone}
                </p>
              </div>
            </div>

            {/* Pharmacy Information */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Pharmacy</h3>
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-semibold text-slate-900 mb-2">{selectedPrescription.pharmacy.name}</p>
                <p className="text-sm text-slate-600 flex items-center gap-1 mb-1">
                  <MapPin size={14} />
                  {selectedPrescription.pharmacy.address}
                </p>
                <p className="text-sm text-slate-600 flex items-center gap-1">
                  <Phone size={14} />
                  {selectedPrescription.pharmacy.phone}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                onClick={() => handleDownloadPdf(selectedPrescription)}
                className="flex-1"
              >
                <Download className="mr-2" size={20} />
                Download PDF
              </Button>
              {isRefillAvailable(selectedPrescription) && (
                <Button
                  onClick={() => {
                    setShowDetailModal(false);
                    handleRequestRefill(selectedPrescription);
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="mr-2" size={20} />
                  Request Refill
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Refill Request Modal */}
      <Modal
        isOpen={showRefillModal}
        onClose={() => !requestingRefill && setShowRefillModal(false)}
        title="Request Prescription Refill"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <Info className="text-blue-600 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Refill Request</p>
                <p>Your refill request will be sent to the pharmacy for processing. You'll receive a notification when it's ready for pickup or delivery.</p>
              </div>
            </div>
          </div>

          {selectedPrescription && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-1">Medication:</p>
              <p className="text-slate-900 font-semibold mb-1">{selectedPrescription.medication}</p>
              <p className="text-sm text-slate-600 mb-2">{selectedPrescription.dosage} - {selectedPrescription.frequency}</p>
              <p className="text-sm text-slate-600">
                Refills remaining: {selectedPrescription.refills - selectedPrescription.refillsUsed}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Select Pharmacy <span className="text-red-600">*</span>
            </label>
            <select
              value={refillForm.pharmacyId}
              onChange={(e) => setRefillForm({ ...refillForm, pharmacyId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Choose a pharmacy...</option>
              <option value="CareSync Pharmacy">CareSync Pharmacy - 123 Medical Plaza</option>
              <option value="MediCare Pharmacy">MediCare Pharmacy - 456 Health Street</option>
              <option value="HealthFirst Pharmacy">HealthFirst Pharmacy - 789 Wellness Ave</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Delivery Address (Optional)
            </label>
            <Input
              type="text"
              placeholder="Enter delivery address if needed"
              value={refillForm.deliveryAddress}
              onChange={(e) => setRefillForm({ ...refillForm, deliveryAddress: e.target.value })}
            />
            <p className="text-xs text-slate-500 mt-1">Leave blank for pharmacy pickup</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={refillForm.notes}
              onChange={(e) => setRefillForm({ ...refillForm, notes: e.target.value })}
              rows={3}
              placeholder="Any special instructions or notes..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={() => setShowRefillModal(false)}
              variant="outline"
              disabled={requestingRefill}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRefillSubmit}
              disabled={requestingRefill}
              className="flex-1"
            >
              {requestingRefill ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2" size={20} />
                  Submit Request
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Prescriptions;
