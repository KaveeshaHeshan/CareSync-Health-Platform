import React, { useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  CreditCard, 
  ArrowUpRight, 
  ArrowDownRight,
  Calendar,
  Filter
} from 'lucide-react';

// Relative imports based on your established UI kit
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const StripeAnalyticsChart = () => {
  const [timeRange, setTimeRange] = useState('12 Months');

  // Mock Stripe Data
  const data = [
    { month: 'Jan', revenue: 4500, subscriptions: 2100 },
    { month: 'Feb', revenue: 5200, subscriptions: 2300 },
    { month: 'Mar', revenue: 4800, subscriptions: 2200 },
    { month: 'Apr', revenue: 6100, subscriptions: 2800 },
    { month: 'May', revenue: 5900, subscriptions: 2900 },
    { month: 'Jun', revenue: 7200, subscriptions: 3200 },
    { month: 'Jul', revenue: 8500, subscriptions: 3500 },
  ];

  const stats = [
    { label: 'Net Revenue', value: '$42,200', change: '+12.5%', icon: DollarSign, trend: 'up' },
    { label: 'Active Subscriptions', value: '1,240', change: '+8.2%', icon: CreditCard, trend: 'up' },
    { label: 'Avg. Payout', value: '$3,405', change: '-2.1%', icon: TrendingUp, trend: 'down' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* 1. Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-black text-slate-800">{stat.value}</h3>
                <div className={`flex items-center gap-1 text-xs font-bold ${stat.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change} <span className="text-slate-400 font-medium">vs last month</span>
                </div>
              </div>
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <stat.icon size={20} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* 2. Main Revenue Chart */}
      <Card 
        title="Revenue Overview" 
        subtitle="Gross revenue vs Subscription growth"
        headerAction={
          <div className="flex gap-2">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-slate-50 border-none rounded-xl text-xs font-bold text-slate-600 px-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
              <option>12 Months</option>
            </select>
            <Button variant="ghost" size="sm" icon={Filter}>Filter</Button>
          </div>
        }
      >
        <div className="h-[350px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fontWeight: 600, fill: '#94a3b8' }}
              />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px' }}
                itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#4f46e5" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorRev)" 
                name="Gross Revenue"
              />
              <Area 
                type="monotone" 
                dataKey="subscriptions" 
                stroke="#10b981" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorSub)" 
                name="Subscriptions"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Payout Notice */}
        <div className="mt-8 flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 shadow-sm">
              <Calendar size={20} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800">Next Payout: Jan 12, 2026</p>
              <p className="text-[11px] text-slate-500 font-medium">Estimated arrival to bank: 2-3 business days</p>
            </div>
          </div>
          <Badge variant="info" size="sm">Processing</Badge>
        </div>
      </Card>
    </div>
  );
};

export default StripeAnalyticsChart;