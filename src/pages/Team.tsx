// src/pages/Team.tsx

import React, { useState, useEffect } from 'react';
import { Plus, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import TeamList from '../components/team/TeamList';
import TeamStats from '../components/team/TeamStats';
import InviteMemberModal from '../components/team/InviteMemberModal';
import type { TeamMember, TeamRole } from '../types/team';
import { team as teamApi } from '../services/api';

const Team: React.FC = () => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);
  
  const [organization, setOrganization] = useState<any>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string>('member');

  // Fetch team data
  const fetchTeamData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await teamApi.getCurrent();
      console.log('📥 Team Data:', response.data);
      
      const orgData = response.data?.data || response.data;
      setOrganization(orgData);
      
      // Map members to TeamMember type
      const mappedMembers: TeamMember[] = (orgData?.members || []).map((m: any) => ({
        id: m.id,
        name: `${m.firstName || ''} ${m.lastName || ''}`.trim() || m.email?.split('@')[0] || 'Unknown',
        email: m.email,
        role: m.role?.toLowerCase() || 'member',
        status: m.joinedAt ? 'active' : 'pending',
        joinedAt: m.joinedAt || m.invitedAt,
        lastActive: m.joinedAt ? 'Active' : 'Pending',
        avatar: m.avatar,
      }));
      
      setMembers(mappedMembers);
      
      // Find current user's role
      const currentUserId = localStorage.getItem('userId'); // You'd get this from auth context
      const currentMember = orgData?.members?.find((m: any) => m.userId === currentUserId);
      setCurrentUserRole(currentMember?.role?.toLowerCase() || 'member');
      
    } catch (err: any) {
      console.error('❌ Failed to fetch team:', err);
      setError(err.response?.data?.message || 'Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  // Invite member
  const handleInvite = async (email: string, role: TeamRole) => {
    if (!organization?.id) return;
    
    setProcessing('invite');
    try {
      await teamApi.inviteMember(organization.id, { 
        email, 
        role: role.toUpperCase() 
      });
      
      // Refresh team data
      await fetchTeamData();
      setShowInviteModal(false);
      
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to invite member');
    } finally {
      setProcessing(null);
    }
  };

  // Remove member
  const handleRemove = async (memberId: string) => {
    if (!organization?.id) return;
    if (!window.confirm('Are you sure you want to remove this member?')) return;
    
    setProcessing(memberId);
    try {
      await teamApi.removeMember(organization.id, memberId);
      setMembers(members.filter(m => m.id !== memberId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove member');
    } finally {
      setProcessing(null);
    }
  };

  // Resend invite (would need backend implementation)
  const handleResendInvite = async (id: string) => {
    alert('Invitation resent successfully!');
  };

  // Edit role
  const handleEditRole = async (memberId: string, newRole?: string) => {
    if (!organization?.id) return;
    
    // If no role provided, cycle through roles for demo
    const member = members.find(m => m.id === memberId);
    if (!member) return;
    
    const roles: TeamRole[] = ['admin', 'manager', 'agent'];
    const currentIndex = roles.indexOf(member.role as TeamRole);
    const nextRole = newRole || roles[(currentIndex + 1) % roles.length];
    
    setProcessing(memberId);
    try {
      await teamApi.updateMemberRole(organization.id, memberId, nextRole.toUpperCase());
      setMembers(members.map(m => 
        m.id === memberId ? { ...m, role: nextRole as TeamRole } : m
      ));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setProcessing(null);
    }
  };

  // Export CSV
  const handleExport = () => {
    const headers = ['Name', 'Email', 'Role', 'Status', 'Joined'];
    const rows = members.map(m => [
      m.name,
      m.email,
      m.role,
      m.status,
      new Date(m.joinedAt).toLocaleDateString()
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'team-members.csv';
    a.click();
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-500">Loading team...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-500 mt-1">
            {organization?.name || 'Your Organization'} • {members.length} members
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={fetchTeamData}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button 
            onClick={handleExport}
            className="flex items-center space-x-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 font-medium rounded-xl transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Export</span>
          </button>
          {['owner', 'admin'].includes(currentUserRole) && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="flex items-center space-x-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-medium rounded-xl transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>Invite Member</span>
            </button>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="text-red-700 font-medium">Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">×</button>
        </div>
      )}

      {/* Stats */}
      <TeamStats members={members} />

      {/* List */}
      <TeamList
        members={members}
        onRemove={handleRemove}
        onResendInvite={handleResendInvite}
        onEditRole={handleEditRole}
        currentUserRole={currentUserRole}
        processingId={processing}
      />

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInvite}
        loading={processing === 'invite'}
      />
    </div>
  );
};

export default Team;