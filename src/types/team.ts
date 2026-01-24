export type TeamRole = 'owner' | 'admin' | 'manager' | 'agent';
export type MemberStatus = 'active' | 'pending' | 'suspended';

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  status: MemberStatus;
  avatar?: string;
  lastActive?: string;
  joinedAt: string;
}

export interface RoleDefinition {
  value: TeamRole;
  label: string;
  description: string;
  color: string;
}