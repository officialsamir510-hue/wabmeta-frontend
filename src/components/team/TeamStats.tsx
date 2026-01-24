import React from 'react';
import { Users, UserPlus, Shield, Clock } from 'lucide-react';
import type { TeamMember } from '../../types/team';

interface TeamStatsProps {
  members: TeamMember[];
}

const TeamStats: React.FC<TeamStatsProps> = ({ members }) => {
  const total = members.length;
  const active = members.filter(m => m.status === 'active').length;
  const pending = members.filter(m => m.status === 'pending').length;
  const admins = members.filter(m => ['admin', 'owner'].includes(m.role)).length;

  const stats = [
    { label: 'Total Members', value: total, icon: Users, color: 'bg-blue-100 text-blue-600' },
    { label: 'Active Now', value: active, icon: UserPlus, color: 'bg-green-100 text-green-600' },
    { label: 'Pending Invites', value: pending, icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
    { label: 'Admins', value: admins, icon: Shield, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
              <stat.icon className="w-6 h-6" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TeamStats;