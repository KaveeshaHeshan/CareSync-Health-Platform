import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  ShieldAlert, 
  MoreVertical, 
  Mail, 
  UserCog,
  Ban,
  Filter
} from 'lucide-react';

// Relative imports based on feature-based architecture
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import adminApi from '../../api/adminApi';

const UserManagement = () => {
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesTab = activeTab === 'All' || user.role.toUpperCase() === activeTab.toUpperCase();
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card 
        title="System Users" 
        subtitle="Manage platform access and verify healthcare provider credentials"
        headerAction={
          <Button variant="primary" size="sm" icon={UserPlus}>Add New User</Button>
        }
      >
        {/* 1. Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1">
            <Input 
              placeholder="Search by name, email, or ID..." 
              icon={Search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-slate-50 border-none"
            />
          </div>
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            {['All', 'Doctor', 'Patient', 'Admin'].map((role) => (
              <button
                key={role}
                onClick={() => setActiveTab(role)}
                className={`px-5 py-2 rounded-xl text-xs font-black transition-all
                  ${activeTab === role 
                    ? 'bg-white text-indigo-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-700'}
                `}
              >
                {role}s
              </button>
            ))}
          </div>
        </div>

        {/* 2. Users Table */}
        <div className="overflow-x-auto rounded-3xl border border-slate-100">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">User Profile</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Role</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Verification</th>
                <th className="p-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                <th className="p-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">No users found</td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-indigo-50/20 transition-colors group">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm border-2 border-white shadow-sm">
                        {user.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">{user.name}</span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Mail size={12} />
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1.5 rounded-lg ${
                        user.role === 'Doctor' ? 'bg-sky-50 text-sky-600' : 
                        user.role === 'Admin' ? 'bg-amber-50 text-amber-600' : 
                        'bg-slate-50 text-slate-600'
                      }`}>
                        {user.role === 'Doctor' ? <UserCog size={14} /> : user.role === 'Admin' ? <ShieldCheck size={14} /> : <Users size={14} />}
                      </div>
                      <span className="text-xs font-bold text-slate-700">{user.role}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    {user.verified ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[11px] uppercase tracking-wide">
                        <ShieldCheck size={14} />
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-amber-500 font-bold text-[11px] uppercase tracking-wide">
                        <ShieldAlert size={14} />
                        Pending
                      </div>
                    )}
                  </td>
                  <td className="p-5">
                    <Badge variant={user.status === 'Active' ? 'success' : user.status === 'Pending' ? 'warning' : 'neutral'} size="sm">
                      {user.status}
                    </Badge>
                  </td>
                  <td className="p-5 text-right">
                    <div className="flex justify-end gap-1">
                      <button className="p-2 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                        <UserCog size={18} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all">
                        <Ban size={18} />
                      </button>
                      <button className="p-2 text-slate-300 hover:text-slate-600 rounded-xl">
                        <MoreVertical size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 3. Administrative Safety Note */}
        <div className="mt-8 p-4 bg-slate-50 rounded-2xl border border-slate-100 flex gap-3">
          <ShieldCheck className="text-indigo-600 shrink-0" size={20} />
          <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
            <strong>Security Protocol:</strong> Role changes and account deactivations are logged in the system audit trail. Changing a user to the "Doctor" role requires manual verification of their medical license and credentials.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default UserManagement;