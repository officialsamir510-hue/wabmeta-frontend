import React, { useState } from 'react';
import { Plus, Download } from 'lucide-react';
import TeamList from '../components/team/TeamList';
import TeamStats from '../components/team/TeamStats';
import InviteMemberModal from '../components/team/InviteMemberModal';
import type { TeamMember, TeamRole } from '../types/team';

const Team: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  
  // Simulated current user role (usually comes from auth context)
  const currentUserRole = 'owner';

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john@wabmeta.com',
      role: 'owner',
      status: 'active',
      joinedAt: '2023-01-01',
      lastActive: 'Active now'
    },
    {
      id: '2',
      name: 'Sarah Smith',
      email: 'sarah@wabmeta.com',
      role: 'admin',
      status: 'active',
      joinedAt: '2023-03-15',
      lastActive: '2 hours ago'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike@wabmeta.com',
      role: 'manager',
      status: 'active',
      joinedAt: '2023-06-10',
      lastActive: '1 day ago'
    },
    {
      id: '4',
      name: 'Emma Wilson',
      email: 'emma@wabmeta.com',
      role: 'agent',
      status: 'pending',
      joinedAt: '2024-01-20',
      lastActive: ''
    }
  ]);

  const handleInvite = (email: string, role: TeamRole) => {
    const newMember: TeamMember = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0], // Placeholder name
      email,
      role,
      status: 'pending',
      joinedAt: new Date().toISOString(),
      lastActive: ''
    };
    setMembers([...members, newMember]);
  };

  const handleRemove = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleResendInvite = (_id: string) => {
    alert('Invitation resent successfully!');
  };

  const handleEditRole = (id: string) => {
    // In a real app, this would open an edit modal
    // For now, let's just simulate cycling roles for demo
    setMembers(members.map(m => {
      if (m.id === id) {
        const roles: TeamRole[] = ['admin', 'manager', 'agent'];
        const nextRole = roles[(roles.indexOf(m.role) + 1) % roles.length];
        return { ...m, role: nextRole };
      }
      return m;
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">Manage your team members and their permissions</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Invite Member</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <TeamStats members={members} />

      {/* List */}
      <TeamList
        members={members}
        onRemove={handleRemove}
        onResendInvite={handleResendInvite}
        onEditRole={handleEditRole}
        currentUserRole={currentUserRole}
      />

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
      />
    </div>
  );
};

export default Team;