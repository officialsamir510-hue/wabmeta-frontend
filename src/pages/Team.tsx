import React, { useState } from "react";
import { Users, UserPlus, Mail, Shield, Trash2, MoreVertical } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "member";
  status: "active" | "pending";
  avatar?: string;
  joinedAt: string;
}

const Team: React.FC = () => {
  const [teamMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "owner",
      status: "active",
      joinedAt: "2024-01-15",
    },
    {
      id: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "admin",
      status: "active",
      joinedAt: "2024-02-01",
    },
  ]);

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "owner":
        return "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400";
      case "admin":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 flex items-center gap-3">
              <Users className="w-8 h-8" />
              Team Management
            </h1>
            <p className="text-gray-500 dark:text-slate-400 mt-2">
              Manage your team members and their permissions
            </p>
          </div>
          <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Member
          </button>
        </div>
      </div>

      {/* Team Members Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Role
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Joined
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700 dark:text-slate-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
              {teamMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 dark:text-primary-400 font-semibold">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-slate-100">
                          {member.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(member.role)}`}>
                      <Shield className="w-3 h-3 inline mr-1" />
                      {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      member.status === "active"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                    }`}>
                      {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {member.role !== "owner" && (
                        <button className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button className="p-2 text-gray-600 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Team;