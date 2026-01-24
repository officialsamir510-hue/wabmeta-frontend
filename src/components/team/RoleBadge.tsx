import React from 'react';
import { Shield, ShieldAlert, UserCog, User } from 'lucide-react';
import type { TeamRole } from '../../types/team';

interface RoleBadgeProps {
  role: TeamRole;
}

const RoleBadge: React.FC<RoleBadgeProps> = ({ role }) => {
  const config = {
    owner: {
      icon: ShieldAlert,
      text: 'Owner',
      className: 'bg-purple-100 text-purple-700 border-purple-200'
    },
    admin: {
      icon: Shield,
      text: 'Admin',
      className: 'bg-blue-100 text-blue-700 border-blue-200'
    },
    manager: {
      icon: UserCog,
      text: 'Manager',
      className: 'bg-orange-100 text-orange-700 border-orange-200'
    },
    agent: {
      icon: User,
      text: 'Agent',
      className: 'bg-gray-100 text-gray-700 border-gray-200'
    }
  };

  const current = config[role];
  const Icon = current.icon;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${current.className}`}>
      <Icon className="w-3 h-3 mr-1" />
      <span className="capitalize">{current.text}</span>
    </span>
  );
};

export default RoleBadge;