import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  TrendingUp, 
  AlertCircle, 
  Download, 
  Filter, 
  ChevronRight,
  Activity
} from 'lucide-react';

// Logic & Tools
import { useAuth } from '../../hooks/useAuth';
import { formatDate } from '../../utils/formatters';
import labApi from '../../api/labApi';

const LabResults = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('All');
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLabResults();
  }, []);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      const response = await labApi.getPatientResults();
      setRecentTests(response.data || []);
    } catch (error) {
      console.error('Failed to fetch lab results:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* 1. Header */}
      <header>
        <h1 className="text-3xl font-black text-slate-900">Laboratory Results</h1>
        <p className="text-slate-500 mt-1">Monitor your diagnostic trends and clinical reports.</p>
      </header>

      {/* 2. Vital Trends (Visual Summary) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-indigo-600" /> Trend Analysis: Blood Glucose
            </h3>
            <select className="text-sm border-none bg-slate-50 rounded-lg p-1 outline-none font-medium">
              <option>Last 6 Months</option>
              <option>Last Year</option>
            </select>
          </div>
          
          {/* Placeholder for Charting Library like Recharts */}
          <div className="h-48 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
            <p className="text-slate-400 text-sm italic font-medium">Interactive Trend Visualization Loading...</p>
          </div>
        </div>

        <div className="bg-indigo-600 p-6 rounded-2xl text-white flex flex-col justify-between">
          <div>
            <div className="bg-white/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4">
              <Activity size={24} />
            </div>
            <h3 className="text-xl font-bold">Health Summary</h3>
            <p className="text-indigo-100 text-sm mt-2 leading-relaxed">
              Your overall cholesterol levels are within the target range. However, your A1C has shown a slight increase.
            </p>
          </div>
          <button className="mt-6 w-full py-2.5 bg-white text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-50 transition-colors">
            Request Consultation
          </button>
        </div>
      </div>

      {/* 3. Detailed Results List */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Individual Reports</h2>
          <button className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-4 py-2 rounded-xl border border-slate-200">
            <Filter size={16} /> Filter Results
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {loading ? (
            <div className="p-8 text-center text-slate-500">Loading lab results...</div>
          ) : recentTests.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No lab results available</div>
          ) : recentTests.map((test) => (
            <div key={test._id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-indigo-200 transition-all">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${test.isCritical ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  <FileText size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 flex items-center gap-2">
                    {test.testName}
                    {test.isCritical && <AlertCircle size={14} className="text-amber-500" />}
                  </h4>
                  <p className="text-xs text-slate-500">{formatDate(test.createdAt || test.date, 'short')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-center flex-1 max-w-xl">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Result</p>
                  <p className={`text-sm font-black ${test.isCritical ? 'text-amber-600' : 'text-slate-900'}`}>
                    {test.result || test.resultSummary || 'Pending'}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Type</p>
                  <p className="text-sm font-bold text-slate-700">{test.testType || test.category || 'General'}</p>
                </div>
                <div className="hidden md:block">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</p>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    test.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {test.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {test.fileUrl && (
                  <a href={test.fileUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border border-transparent hover:border-indigo-100">
                    <Download size={20} />
                  </a>
                )}
                <button className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default LabResults;