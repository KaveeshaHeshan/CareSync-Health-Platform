import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Search, 
  Filter, 
  MoreVertical, 
  Eye, 
  Edit, 
  Trash2, 
  UserCheck, 
  UserX,
  Download,
  ChevronLeft,
  ChevronRight,
  X,
  Mail,
  Phone,
  Calendar,
  Shield,
  User,
  Activity,
  Clock
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import adminApi from '../../api/adminApi';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 12;

  // Statistics
  const statistics = {
    total: users.length,
    patients: users.filter(u => u.role === 'PATIENT').length,
    doctors: users.filter(u => u.role === 'DOCTOR').length,
    admins: users.filter(u => u.role === 'ADMIN').length,
    active: users.filter(u => u.isActive).length,
    inactive: users.filter(u => !u.isActive).length,
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAllUsers();
      setUsers(response.users || []);
      setError('');
    } catch (err) {
      setError('Failed to load users');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filter users
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.phone?.includes(searchTerm);
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'active' ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Pagination
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await adminApi.deleteUser(selectedUser._id);
      setUsers(users.filter(u => u._id !== selectedUser._id));
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      setError('Failed to delete user');
      console.error(err);
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await adminApi.updateUserStatus(userId, !currentStatus);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, isActive: !currentStatus } : u
      ));
    } catch (err) {
      setError('Failed to update user status');
      console.error(err);
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await adminApi.updateUserRole(userId, newRole);
      setUsers(users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      ));
      setShowEditModal(false);
    } catch (err) {
      setError('Failed to update user role');
      console.error(err);
    }
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Role', 'Status', 'Joined Date'];
    const data = filteredUsers.map(user => [
      user.name,
      user.email,
      user.phone || 'N/A',
      user.role,
      user.isActive ? 'Active' : 'Inactive',
      new Date(user.createdAt).toLocaleDateString()
    ]);

    const csvContent = [
      headers.join(','),
      ...data.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800';
      case 'DOCTOR': return 'bg-blue-100 text-blue-800';
      case 'PATIENT': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getAvatarColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-gradient-to-br from-purple-500 to-purple-600';
      case 'DOCTOR': return 'bg-gradient-to-br from-blue-500 to-blue-600';
      case 'PATIENT': return 'bg-gradient-to-br from-green-500 to-green-600';
      default: return 'bg-gradient-to-br from-gray-500 to-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <UsersIcon className="text-indigo-600" size={32} />
            User Management
          </h1>
          <p className="text-gray-600 mt-1">Manage all platform users</p>
        </div>
        <Button onClick={exportToCSV} className="flex items-center gap-2">
          <Download size={20} />
          Export CSV
        </Button>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError('')} />}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{statistics.total}</p>
            </div>
            <UsersIcon className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Patients</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{statistics.patients}</p>
            </div>
            <User className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Doctors</p>
              <p className="text-2xl font-bold text-blue-900 mt-1">{statistics.doctors}</p>
            </div>
            <Activity className="text-blue-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-purple-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Admins</p>
              <p className="text-2xl font-bold text-purple-900 mt-1">{statistics.admins}</p>
            </div>
            <Shield className="text-purple-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Active</p>
              <p className="text-2xl font-bold text-green-900 mt-1">{statistics.active}</p>
            </div>
            <UserCheck className="text-green-500" size={32} />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-red-50 to-red-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Inactive</p>
              <p className="text-2xl font-bold text-red-900 mt-1">{statistics.inactive}</p>
            </div>
            <UserX className="text-red-500" size={32} />
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Role Filter */}
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Roles</option>
            <option value="PATIENT">Patients</option>
            <option value="DOCTOR">Doctors</option>
            <option value="ADMIN">Admins</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Users Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {currentUsers.map((user) => (
          <Card key={user._id} className="p-6 hover:shadow-lg transition-shadow">
            {/* User Avatar & Basic Info */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-full ${getAvatarColor(user.role)} flex items-center justify-center text-white font-semibold text-lg`}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{user.name}</h3>
                  <Badge className={getRoleBadgeColor(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>
              <div className="relative group">
                <button className="p-1 hover:bg-gray-100 rounded-lg">
                  <MoreVertical size={20} className="text-gray-400" />
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 hidden group-hover:block z-10">
                  <button
                    onClick={() => handleViewDetails(user)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <Eye size={16} />
                    View Details
                  </button>
                  <button
                    onClick={() => handleEditUser(user)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    <Edit size={16} />
                    Edit User
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user._id, user.isActive)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-left"
                  >
                    {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                    {user.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    onClick={() => handleDeleteUser(user)}
                    className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-red-600 text-left"
                  >
                    <Trash2 size={16} />
                    Delete User
                  </button>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={16} />
                <span className="truncate">{user.email}</span>
              </div>
              {user.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={16} />
                  <span>{user.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={16} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <Badge className={getStatusBadgeColor(user.isActive)}>
                {user.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {user.role === 'DOCTOR' && user.specialization && (
                <span className="text-xs text-gray-500">{user.specialization}</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="p-12 text-center">
          <UsersIcon className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-gray-600 text-lg">No users found</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting your filters</p>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {indexOfFirstUser + 1} to {Math.min(indexOfLastUser, filteredUsers.length)} of {filteredUsers.length} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1"
              >
                <ChevronLeft size={20} />
                Previous
              </Button>
              <span className="px-4 py-2 text-sm font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1"
              >
                Next
                <ChevronRight size={20} />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedUser && (
        <Modal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedUser(null);
          }}
          title="User Details"
        >
          <div className="space-y-6">
            {/* User Header */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-200">
              <div className={`w-16 h-16 rounded-full ${getAvatarColor(selectedUser.role)} flex items-center justify-center text-white font-bold text-2xl`}>
                {selectedUser.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">{selectedUser.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge className={getRoleBadgeColor(selectedUser.role)}>
                    {selectedUser.role}
                  </Badge>
                  <Badge className={getStatusBadgeColor(selectedUser.isActive)}>
                    {selectedUser.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Mail size={18} />
                Contact Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{selectedUser.email}</span>
                </div>
                {selectedUser.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedUser.phone}</span>
                  </div>
                )}
                {selectedUser.age && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Age:</span>
                    <span className="font-medium">{selectedUser.age} years</span>
                  </div>
                )}
                {selectedUser.gender && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Gender:</span>
                    <span className="font-medium">{selectedUser.gender}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Doctor Specific Info */}
            {selectedUser.role === 'DOCTOR' && (
              <div>
                <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Activity size={18} />
                  Professional Information
                </h4>
                <div className="space-y-2 text-sm">
                  {selectedUser.specialization && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Specialization:</span>
                      <span className="font-medium">{selectedUser.specialization}</span>
                    </div>
                  )}
                  {selectedUser.experience && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Experience:</span>
                      <span className="font-medium">{selectedUser.experience}</span>
                    </div>
                  )}
                  {selectedUser.fees && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consultation Fee:</span>
                      <span className="font-medium">${selectedUser.fees}</span>
                    </div>
                  )}
                  {selectedUser.rating !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">⭐ {selectedUser.rating.toFixed(1)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved:</span>
                    <span className="font-medium">
                      {selectedUser.isApproved ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Account Information */}
            <div>
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Clock size={18} />
                Account Information
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">User ID:</span>
                  <span className="font-mono text-xs">{selectedUser._id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created:</span>
                  <span className="font-medium">
                    {new Date(selectedUser.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="font-medium">
                    {new Date(selectedUser.updatedAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-200">
              <Button
                onClick={() => {
                  setShowDetailModal(false);
                  handleEditUser(selectedUser);
                }}
                className="flex-1"
              >
                <Edit size={18} />
                Edit User
              </Button>
              <Button
                onClick={() => toggleUserStatus(selectedUser._id, selectedUser.isActive)}
                variant="outline"
                className="flex-1"
              >
                {selectedUser.isActive ? <UserX size={18} /> : <UserCheck size={18} />}
                {selectedUser.isActive ? 'Deactivate' : 'Activate'}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Role Modal */}
      {showEditModal && selectedUser && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          title="Edit User Role"
        >
          <div className="space-y-4">
            <div>
              <p className="text-gray-700 mb-4">
                Change role for <strong>{selectedUser.name}</strong>
              </p>
              <div className="space-y-2">
                {['PATIENT', 'DOCTOR', 'ADMIN'].map((role) => (
                  <button
                    key={role}
                    onClick={() => handleUpdateRole(selectedUser._id, role)}
                    className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                      selectedUser.role === role
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{role}</span>
                      {selectedUser.role === role && (
                        <span className="text-indigo-600">✓ Current</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedUser(null);
          }}
          title="Delete User"
        >
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-800 font-medium">⚠️ Warning: This action cannot be undone</p>
            </div>
            <p className="text-gray-700">
              Are you sure you want to delete <strong>{selectedUser.name}</strong>?
            </p>
            <p className="text-sm text-gray-600">
              All associated data including appointments, prescriptions, and medical records will be permanently deleted.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                onClick={confirmDelete}
                variant="danger"
                className="flex-1"
              >
                Yes, Delete User
              </Button>
              <Button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Users;
