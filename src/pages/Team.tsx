import React, { useState } from "react";
import { Plus, Trash2, Mail, Shield } from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  joinedDate: string;
}

export default function Team() {
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: "1",
      name: "You",
      email: "user@example.com",
      role: "admin",
      joinedDate: "2024-01-15",
    },
  ]);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (inviteEmail) {
      setMembers([
        ...members,
        {
          id: Date.now().toString(),
          name: inviteEmail.split("@")[0],
          email: inviteEmail,
          role: "editor",
          joinedDate: new Date().toISOString().split("T")[0],
        },
      ]);
      setInviteEmail("");
      setShowInvite(false);
    }
  };

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100 mb-2">
          Team Management
        </h1>
        <p className="text-gray-600 dark:text-slate-400">
          Manage your team members and their permissions
        </p>
      </div>

      <button
        onClick={() => setShowInvite(!showInvite)}
        className="mb-6 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
      >
        <Plus className="w-5 h-5" />
        Invite Member
      </button>

      {showInvite && (
        <div className="mb-6 p-4 bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
          <form onSubmit={handleInvite} className="flex gap-2">
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Enter email address"
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
              required
            />
            <button
              type="submit"
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Send Invite
            </button>
          </form>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                Member
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                Email
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                Role
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                Joined
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-slate-100">
                  {member.name}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {member.email}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                    <Shield className="w-4 h-4" />
                    {member.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-slate-400">
                  {new Date(member.joinedDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm">
                  {member.role !== "admin" && (
                    <button
                      onClick={() => removeMember(member.id)}
                      className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}