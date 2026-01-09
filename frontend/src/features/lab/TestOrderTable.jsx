import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Beaker, 
  Download, 
  ExternalLink, 
  MoreHorizontal,
  Clock,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

// Relative imports based on your established UI kit
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const TestOrderTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Mock data for laboratory orders
  const orders = [
    {
      id: "LAB-8801",
      patient: "Alexander Thompson",
      test: "Complete Blood Count (CBC)",
      date: "Jan 08, 2026",
      status: "Completed",
      priority: "Routine",
      variant: "success"
    },
    {
      id: "LAB-8842",
      patient: "Sarah Miller",
      test: "Lipid Panel",
      date: "Jan 09, 2026",
      status: "Processing",
      priority: "Urgent",
      variant: "warning"
    },
    {
      id: "LAB-8910",
      patient: "Michael Chen",
      test: "HbA1c (Diabetes Screen)",
      date: "Jan 09, 2026",
      status: "Pending",
      priority: "Routine",
      variant: "neutral"
    }
  ];

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 size={14} className="text-emerald-500" />;
      case 'Processing': return <Clock size={14} className="text-amber-500" />;
      default: return <AlertTriangle size={14} className="text-slate-400" />;
    }
  };

  return (
    <Card 
      title="Diagnostic Orders" 
      subtitle="Track and manage laboratory test requests"
      headerAction={
        <Button variant="outline" size="sm" icon={Download}>Export List</Button>
      }
    >
      {/* 1. Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <Input 
            placeholder="Search by patient or test ID..." 
            icon={Search}
            className="bg-slate-50 border-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Pending', 'Processing', 'Completed'].map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all
                ${statusFilter === tab 
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' 
                  : 'bg-white text-slate-500 border border-slate-100 hover:bg-slate-50'}
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Responsive Table */}
      <div className="overflow-x-auto rounded-2xl border border-slate-100">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Order ID</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Patient</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Test Type</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Priority</th>
              <th className="p-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-indigo-50/30 transition-colors group">
                <td className="p-4">
                  <span className="text-xs font-bold text-slate-400">#{order.id}</span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-slate-800">{order.patient}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{order.date}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                      <Beaker size={14} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">{order.test}</span>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(order.status)}
                    <span className="text-xs font-bold text-slate-600">{order.status}</span>
                  </div>
                </td>
                <td className="p-4">
                  <Badge variant={order.priority === 'Urgent' ? 'danger' : 'neutral'} size="sm">
                    {order.priority}
                  </Badge>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <ExternalLink size={14} />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 3. Footer / Pagination */}
      <div className="mt-6 flex items-center justify-between px-2">
        <p className="text-xs font-medium text-slate-400">Showing 3 of 24 lab orders</p>
        <div className="flex gap-1">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </Card>
  );
};

export default TestOrderTable;