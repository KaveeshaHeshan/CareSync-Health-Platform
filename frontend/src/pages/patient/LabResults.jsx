import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FlaskConical,
  Download,
  Share2,
  Search,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Activity,
  Filter,
  Eye,
  ChevronRight,
  FileText,
  User,
  Clock,
  BarChart3,
  LineChart,
  Info
} from 'lucide-react';
import { formatDate } from '../../utils/formatters';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Modal from '../../components/ui/Modal';

const LabResults = () => {
  const navigate = useNavigate();
  
  // State management
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // all, last30, last90, lastyear
  
  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showTrendModal, setShowTrendModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [selectedTest, setSelectedTest] = useState(null);
  
  // Share form
  const [shareForm, setShareForm] = useState({
    doctorId: '',
    message: ''
  });
  const [sharing, setSharing] = useState(false);

  // Categories
  const categories = [
    { id: 'all', label: 'All Tests', count: 0 },
    { id: 'blood', label: 'Blood Tests', count: 0 },
    { id: 'urine', label: 'Urine Tests', count: 0 },
    { id: 'imaging', label: 'Imaging', count: 0 },
    { id: 'metabolic', label: 'Metabolic', count: 0 },
    { id: 'cardiac', label: 'Cardiac', count: 0 }
  ];

  // Mock data - Replace with API call
  const mockResults = [
    {
      id: '1',
      orderId: 'LAB-2024-001',
      testName: 'Complete Blood Count (CBC)',
      category: 'blood',
      date: new Date('2024-01-10'),
      status: 'completed',
      doctor: 'Dr. Sarah Johnson',
      lab: 'CareSync Medical Lab',
      tests: [
        { name: 'White Blood Cells', value: '7.2', unit: 'K/uL', range: '4.5-11.0', status: 'normal' },
        { name: 'Red Blood Cells', value: '4.8', unit: 'M/uL', range: '4.5-5.9', status: 'normal' },
        { name: 'Hemoglobin', value: '14.2', unit: 'g/dL', range: '13.5-17.5', status: 'normal' },
        { name: 'Hematocrit', value: '42.1', unit: '%', range: '38.8-50.0', status: 'normal' },
        { name: 'Platelets', value: '245', unit: 'K/uL', range: '150-400', status: 'normal' }
      ],
      summary: 'All blood cell counts are within normal ranges. No abnormalities detected.',
      hasPdf: true
    },
    {
      id: '2',
      orderId: 'LAB-2024-002',
      testName: 'Lipid Panel',
      category: 'metabolic',
      date: new Date('2024-01-08'),
      status: 'completed',
      doctor: 'Dr. Michael Chen',
      lab: 'CareSync Medical Lab',
      tests: [
        { name: 'Total Cholesterol', value: '210', unit: 'mg/dL', range: '<200', status: 'high' },
        { name: 'LDL Cholesterol', value: '135', unit: 'mg/dL', range: '<100', status: 'high' },
        { name: 'HDL Cholesterol', value: '52', unit: 'mg/dL', range: '>40', status: 'normal' },
        { name: 'Triglycerides', value: '165', unit: 'mg/dL', range: '<150', status: 'high' }
      ],
      summary: 'Cholesterol levels are elevated. Diet and lifestyle modifications recommended.',
      hasPdf: true
    },
    {
      id: '3',
      orderId: 'LAB-2024-003',
      testName: 'Thyroid Function Test',
      category: 'metabolic',
      date: new Date('2024-01-05'),
      status: 'completed',
      doctor: 'Dr. Emily Davis',
      lab: 'CareSync Medical Lab',
      tests: [
        { name: 'TSH', value: '2.8', unit: 'mIU/L', range: '0.4-4.0', status: 'normal' },
        { name: 'Free T4', value: '1.2', unit: 'ng/dL', range: '0.8-1.8', status: 'normal' },
        { name: 'Free T3', value: '3.1', unit: 'pg/mL', range: '2.3-4.2', status: 'normal' }
      ],
      summary: 'Thyroid function is normal. Continue current treatment.',
      hasPdf: true
    },
    {
      id: '4',
      orderId: 'LAB-2024-004',
      testName: 'Urinalysis',
      category: 'urine',
      date: new Date('2024-01-03'),
      status: 'completed',
      doctor: 'Dr. Sarah Johnson',
      lab: 'CareSync Medical Lab',
      tests: [
        { name: 'Color', value: 'Yellow', unit: '', range: 'Yellow-Amber', status: 'normal' },
        { name: 'Clarity', value: 'Clear', unit: '', range: 'Clear', status: 'normal' },
        { name: 'pH', value: '6.0', unit: '', range: '4.5-8.0', status: 'normal' },
        { name: 'Protein', value: 'Negative', unit: '', range: 'Negative', status: 'normal' },
        { name: 'Glucose', value: 'Negative', unit: '', range: 'Negative', status: 'normal' }
      ],
      summary: 'Urine analysis shows no abnormalities.',
      hasPdf: true
    },
    {
      id: '5',
      orderId: 'LAB-2024-005',
      testName: 'HbA1c (Diabetes Test)',
      category: 'blood',
      date: new Date('2023-12-20'),
      status: 'completed',
      doctor: 'Dr. Michael Chen',
      lab: 'CareSync Medical Lab',
      tests: [
        { name: 'HbA1c', value: '6.2', unit: '%', range: '<5.7', status: 'high' }
      ],
      summary: 'HbA1c level indicates prediabetes. Follow up recommended.',
      hasPdf: true
    },
    {
      id: '6',
      orderId: 'LAB-2024-006',
      testName: 'Liver Function Test',
      category: 'metabolic',
      date: new Date('2023-12-15'),
      status: 'completed',
      doctor: 'Dr. Emily Davis',
      lab: 'CareSync Medical Lab',
      tests: [
        { name: 'ALT', value: '28', unit: 'U/L', range: '7-56', status: 'normal' },
        { name: 'AST', value: '24', unit: 'U/L', range: '10-40', status: 'normal' },
        { name: 'Alkaline Phosphatase', value: '72', unit: 'U/L', range: '44-147', status: 'normal' },
        { name: 'Total Bilirubin', value: '0.8', unit: 'mg/dL', range: '0.1-1.2', status: 'normal' }
      ],
      summary: 'Liver function is normal.',
      hasPdf: true
    }
  ];

  // Historical data for trends (for demo)
  const mockTrendData = {
    'Total Cholesterol': [
      { date: '2023-07-10', value: 195 },
      { date: '2023-10-15', value: 205 },
      { date: '2024-01-08', value: 210 }
    ],
    'HbA1c': [
      { date: '2023-06-20', value: 5.8 },
      { date: '2023-09-15', value: 6.0 },
      { date: '2023-12-20', value: 6.2 }
    ]
  };

  useEffect(() => {
    fetchResults();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [results, searchQuery, selectedCategory, dateFilter]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      setResults(mockResults);
    } catch (error) {
      console.error('Error fetching lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...results];
    
    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(result => result.category === selectedCategory);
    }
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(result =>
        result.testName.toLowerCase().includes(query) ||
        result.orderId.toLowerCase().includes(query) ||
        result.doctor.toLowerCase().includes(query)
      );
    }
    
    // Date filter
    const now = new Date();
    if (dateFilter !== 'all') {
      filtered = filtered.filter(result => {
        const resultDate = new Date(result.date);
        const daysDiff = Math.floor((now - resultDate) / (1000 * 60 * 60 * 24));
        
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
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    setFilteredResults(filtered);
  };

  const handleViewDetails = (result) => {
    setSelectedResult(result);
    setShowDetailModal(true);
  };

  const handleDownloadPdf = (result) => {
    // Simulate PDF download
    alert(`Downloading ${result.testName} report...`);
    console.log('Downloading:', result);
  };

  const handleShareResult = (result) => {
    setSelectedResult(result);
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
      
      setShowShareModal(false);
      setShareForm({ doctorId: '', message: '' });
      alert('Lab result shared successfully!');
    } catch (error) {
      console.error('Share error:', error);
      alert('Failed to share result');
    } finally {
      setSharing(false);
    }
  };

  const handleViewTrend = (test) => {
    setSelectedTest(test);
    setShowTrendModal(true);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'high':
      case 'low':
        return <AlertCircle className="text-red-600" size={20} />;
      default:
        return <Activity className="text-slate-600" size={20} />;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'normal':
        return <Badge variant="success">Normal</Badge>;
      case 'high':
        return <Badge variant="danger">High</Badge>;
      case 'low':
        return <Badge variant="warning">Low</Badge>;
      default:
        return <Badge variant="default">Pending</Badge>;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'normal':
        return 'text-green-600 bg-green-50';
      case 'high':
      case 'low':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-600 bg-slate-50';
    }
  };

  const calculateOverallStatus = (tests) => {
    const hasAbnormal = tests.some(t => t.status === 'high' || t.status === 'low');
    return hasAbnormal ? 'abnormal' : 'normal';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <Spinner size="lg" />
          <p className="mt-4 text-slate-600">Loading lab results...</p>
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
              <h1 className="text-3xl font-bold text-slate-900">Lab Results</h1>
              <p className="text-sm text-slate-600 mt-1">
                {filteredResults.length} {filteredResults.length === 1 ? 'result' : 'results'} found
              </p>
            </div>
            <div className="flex gap-3">
              <Button variant="outline">
                <BarChart3 className="mr-2" size={20} />
                View Trends
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
                  placeholder="Search by test name, order ID, or doctor..."
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

        {/* Category Tabs */}
        <div className="mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => {
              const count = category.id === 'all' 
                ? results.length 
                : results.filter(r => r.category === category.id).length;
              
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                    selectedCategory === category.id
                      ? 'bg-indigo-50 border-indigo-600 text-indigo-700'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FlaskConical size={20} />
                  <span className="font-medium">{category.label}</span>
                  <Badge variant={selectedCategory === category.id ? 'primary' : 'default'}>
                    {count}
                  </Badge>
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List */}
        {filteredResults.length === 0 ? (
          <Card className="text-center py-16">
            <FlaskConical className="mx-auto text-slate-400 mb-4" size={64} />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Lab Results Found</h3>
            <p className="text-slate-600 mb-6">
              {searchQuery || dateFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Your lab results will appear here once available'}
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredResults.map((result) => {
              const overallStatus = calculateOverallStatus(result.tests);
              
              return (
                <Card key={result.id} className="hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        overallStatus === 'abnormal' ? 'bg-red-100' : 'bg-green-100'
                      }`}>
                        <FlaskConical className={
                          overallStatus === 'abnormal' ? 'text-red-600' : 'text-green-600'
                        } size={24} />
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {result.testName}
                          </h3>
                          {overallStatus === 'abnormal' && (
                            <Badge variant="danger">
                              <AlertCircle size={12} className="mr-1" />
                              Abnormal
                            </Badge>
                          )}
                          {overallStatus === 'normal' && (
                            <Badge variant="success">
                              <CheckCircle size={12} className="mr-1" />
                              Normal
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                          <span className="flex items-center gap-1">
                            <FileText size={16} />
                            {result.orderId}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={16} />
                            {formatDate(result.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <User size={16} />
                            {result.doctor}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600">{result.lab}</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleViewDetails(result)}
                        size="sm"
                      >
                        <Eye size={16} className="mr-1" />
                        View
                      </Button>
                      <Button
                        onClick={() => handleDownloadPdf(result)}
                        variant="outline"
                        size="sm"
                      >
                        <Download size={16} />
                      </Button>
                      <Button
                        onClick={() => handleShareResult(result)}
                        variant="outline"
                        size="sm"
                      >
                        <Share2 size={16} />
                      </Button>
                    </div>
                  </div>

                  {/* Test Summary */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                    {result.tests.slice(0, 3).map((test, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border ${
                          test.status === 'normal' 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-red-200 bg-red-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-1">
                          <p className="text-sm font-medium text-slate-900">{test.name}</p>
                          {getStatusIcon(test.status)}
                        </div>
                        <div className="flex items-baseline gap-2">
                          <span className={`text-lg font-bold ${
                            test.status === 'normal' ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {test.value}
                          </span>
                          <span className="text-sm text-slate-600">{test.unit}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Range: {test.range}
                        </p>
                      </div>
                    ))}
                  </div>

                  {result.tests.length > 3 && (
                    <button
                      onClick={() => handleViewDetails(result)}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
                    >
                      View all {result.tests.length} tests
                      <ChevronRight size={16} />
                    </button>
                  )}

                  {/* Summary Note */}
                  {result.summary && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                      <div className="flex gap-2">
                        <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={16} />
                        <p className="text-sm text-slate-700">{result.summary}</p>
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
        title="Lab Result Details"
        size="xl"
      >
        {selectedResult && (
          <div className="space-y-6">
            {/* Header Info */}
            <div className="grid md:grid-cols-2 gap-4 pb-4 border-b border-slate-200">
              <div>
                <label className="text-sm font-medium text-slate-700">Test Name</label>
                <p className="text-slate-900 font-semibold">{selectedResult.testName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Order ID</label>
                <p className="text-slate-900">{selectedResult.orderId}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Date</label>
                <p className="text-slate-900">{formatDate(selectedResult.date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Doctor</label>
                <p className="text-slate-900">{selectedResult.doctor}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Laboratory</label>
                <p className="text-slate-900">{selectedResult.lab}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700">Status</label>
                <div>{getStatusBadge(selectedResult.status)}</div>
              </div>
            </div>

            {/* Test Results */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-4">Test Results</h3>
              <div className="space-y-3">
                {selectedResult.tests.map((test, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${getStatusColor(test.status)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-slate-900">{test.name}</h4>
                          {getStatusBadge(test.status)}
                        </div>
                        <div className="flex items-baseline gap-3">
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-slate-900">
                              {test.value}
                            </span>
                            <span className="text-sm text-slate-600">{test.unit}</span>
                          </div>
                          <span className="text-sm text-slate-600">
                            Reference: {test.range}
                          </span>
                        </div>
                      </div>
                      
                      {mockTrendData[test.name] && (
                        <Button
                          onClick={() => handleViewTrend(test)}
                          variant="outline"
                          size="sm"
                        >
                          <LineChart size={16} className="mr-1" />
                          Trend
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {selectedResult.summary && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <Info className="text-blue-600 flex-shrink-0" size={20} />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Summary</p>
                    <p className="text-sm text-blue-800">{selectedResult.summary}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                onClick={() => handleDownloadPdf(selectedResult)}
                className="flex-1"
              >
                <Download className="mr-2" size={20} />
                Download PDF
              </Button>
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleShareResult(selectedResult);
                }}
                variant="outline"
                className="flex-1"
              >
                <Share2 className="mr-2" size={20} />
                Share with Doctor
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Trend Modal */}
      <Modal
        isOpen={showTrendModal}
        onClose={() => setShowTrendModal(false)}
        title={`${selectedTest?.name} - Historical Trend`}
      >
        {selectedTest && mockTrendData[selectedTest.name] && (
          <div className="space-y-6">
            <div className="bg-slate-50 rounded-lg p-6 text-center">
              <LineChart className="mx-auto text-indigo-600 mb-4" size={48} />
              <p className="text-sm text-slate-600 mb-4">
                Showing historical values for {selectedTest.name}
              </p>
              
              {/* Simple trend visualization */}
              <div className="space-y-3">
                {mockTrendData[selectedTest.name].map((point, index) => {
                  const isLatest = index === mockTrendData[selectedTest.name].length - 1;
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        isLatest ? 'bg-indigo-50 border-2 border-indigo-600' : 'bg-white border border-slate-200'
                      }`}
                    >
                      <span className="text-sm text-slate-600">{formatDate(point.date)}</span>
                      <div className="flex items-center gap-3">
                        <span className={`text-lg font-bold ${isLatest ? 'text-indigo-600' : 'text-slate-900'}`}>
                          {point.value} {selectedTest.unit}
                        </span>
                        {index > 0 && (
                          <span className="flex items-center gap-1">
                            {point.value > mockTrendData[selectedTest.name][index - 1].value ? (
                              <>
                                <TrendingUp className="text-red-600" size={16} />
                                <span className="text-sm text-red-600">
                                  +{(point.value - mockTrendData[selectedTest.name][index - 1].value).toFixed(1)}
                                </span>
                              </>
                            ) : (
                              <>
                                <TrendingDown className="text-green-600" size={16} />
                                <span className="text-sm text-green-600">
                                  {(point.value - mockTrendData[selectedTest.name][index - 1].value).toFixed(1)}
                                </span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-3">
                <Info className="text-blue-600 flex-shrink-0" size={20} />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">Reference Range</p>
                  <p>{selectedTest.range}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={showShareModal}
        onClose={() => !sharing && setShowShareModal(false)}
        title="Share Lab Result"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Sharing Lab Results</p>
                <p>This result will be accessible to the selected doctor in their patient records.</p>
              </div>
            </div>
          </div>

          {selectedResult && (
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-1">Result to Share:</p>
              <p className="text-slate-900 font-semibold">{selectedResult.testName}</p>
              <p className="text-sm text-slate-600">{formatDate(selectedResult.date)}</p>
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
              <option value="3">Dr. Emily Davis - Endocrinology</option>
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
              {sharing ? 'Sharing...' : 'Share Result'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default LabResults;
