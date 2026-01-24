import React, { useState } from 'react';
import {
  MoreVertical,
  Edit2,
  Trash2,
  RefreshCw,
  Search,
  Filter
} from 'lucide-react';
import RoleBadge from './RoleBadge';
import type { TeamMember } from '../../types/team';

interface TeamListProps {
  members: TeamMember[];
  onRemove: (id: string) => void;
  onResendInvite: (id: string) => void;
  onEditRole: (id: string) => void;
  currentUserRole: string;
}

const TeamList: React.FC<TeamListProps> = ({
  members,
  onRemove,
  onResendInvite,
  onEditRole,
  currentUserRole
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'suspended': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  // Check if current user can edit the target member
  const canManage = (targetMember: TeamMember) => {
    if (currentUserRole === 'owner') return targetMember.role !== 'owner';
    if (currentUserRole === 'admin') return !['owner', 'admin'].includes(targetMember.role);
    return false;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50">
        <div className="relative max-w-md w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <button className="flex items-center space-x-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          <span>Filter</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Member</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredMembers.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="shrink-0 h-10 w-10">
                      {member.avatar ? (
                        <img className="h-10 w-10 rounded-full object-cover" src={member.avatar} alt="" />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary-500 to-whatsapp-teal flex items-center justify-center text-white font-bold text-sm">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{member.name}</div>
                      <div className="text-sm text-gray-500">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RoleBadge role={member.role} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(member.status)}`}>
                    {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(member.joinedAt)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {member.lastActive || 'Never'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative">
                  {canManage(member) && (
                    <>
                      <button
                        onClick={() => setActiveMenu(activeMenu === member.id ? null : member.id)}
                        className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                      >
                        <MoreVertical className="w-5 h-5" />
                      </button>

                      {activeMenu === member.id && (
                        <>
                          <div 
                            className="fixed inset-0 z-10"
                            onClick={() => setActiveMenu(null)}
                          ></div>
                          <div className="absolute right-0 top-full -mt-2.5 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20 animate-fade-in">
                            <button
                              onClick={() => {
                                onEditRole(member.id);
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Edit Role</span>
                            </button>
                            
                            {member.status === 'pending' && (
                              <button
                                onClick={() => {
                                  onResendInvite(member.id);
                                  setActiveMenu(null);
                                }}
                                className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-50"
                              >
                                <RefreshCw className="w-4 h-4" />
                                <span>Resend Invite</span>
                              </button>
                            )}

                            <button
                              onClick={() => {
                                if (confirm('Remove this team member?')) {
                                  onRemove(member.id);
                                }
                                setActiveMenu(null);
                              }}
                              className="w-full flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Remove</span>
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TeamList;