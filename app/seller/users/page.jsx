"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated" && !["admin", "seller"].includes(session?.user?.role)) {
      router.push("/");
    } else if (status === "authenticated" && ["admin", "seller"].includes(session?.user?.role)) {
      fetchUsers();
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/users");
      if (!response.ok) throw new Error("Failed to fetch users");
      const data = await response.json();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (error) {
      alert("Failed to load users: " + error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Change this user's role to ${newRole}?`)) return;

    try {
      setUpdating(userId);
      const response = await fetch("/api/admin/users/update-role", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update role");
      }
      const data = await response.json();
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      alert(data.message);
    } catch (error) {
      alert("Failed to update user role: " + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || u.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="animate-spin rounded-full h-10 w-10 min-[375px]:h-12 min-[375px]:w-12 border-b-2 border-[#9d0208]"></div>
      </div>
    );
  }

  if (!["admin", "seller"].includes(session?.user?.role)) return null;

  return (
    <div className="min-h-screen bg-black py-3 px-2 min-[375px]:py-4 min-[375px]:px-3 sm:py-8 sm:px-6 lg:px-8 text-white">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-3 min-[375px]:mb-4 sm:mb-8">
          <h1 className="text-lg min-[375px]:text-xl sm:text-3xl font-bold text-[#9d0208]">User Management</h1>
          <p className="mt-1 sm:mt-2 text-xs min-[375px]:text-sm sm:text-base text-gray-300">
            Manage all registered users and their roles
          </p>
        </div>

        {/* Filters */}
        <div className="bg-[#111] rounded-md min-[375px]:rounded-lg shadow p-2.5 min-[375px]:p-3 sm:p-4 mb-3 min-[375px]:mb-4 sm:mb-6 border border-[#9d0208]">
          <div className="space-y-2.5 min-[375px]:space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-xs min-[375px]:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-2.5 min-[375px]:px-3 py-1.5 min-[375px]:py-2 text-xs min-[375px]:text-sm bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg text-white focus:ring-1 focus:ring-[#9d0208] focus:outline-none focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs min-[375px]:text-sm font-medium text-gray-300 mb-1 sm:mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={e => setFilterRole(e.target.value)}
                className="w-full px-2.5 min-[375px]:px-3 py-1.5 min-[375px]:py-2 text-xs min-[375px]:text-sm bg-black border border-[#9d0208] rounded-md min-[375px]:rounded-lg text-white focus:ring-1 focus:ring-[#9d0208] focus:outline-none focus:border-transparent"
              >
                <option value="all">All Roles</option>
                <option value="customer">Customer</option>
                <option value="seller">Seller</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 min-[375px]:gap-2 sm:gap-4 mb-3 min-[375px]:mb-4 sm:mb-6">
          <div className="bg-[#111] rounded-md min-[375px]:rounded-lg shadow p-2 min-[375px]:p-3 sm:p-4 border border-[#9d0208]">
            <div className="text-[10px] min-[375px]:text-xs sm:text-sm text-gray-300">Total Users</div>
            <div className="text-base min-[375px]:text-lg sm:text-2xl font-bold text-white mt-0.5 min-[375px]:mt-1">{users.length}</div>
          </div>
          <div className="bg-[#111] rounded-md min-[375px]:rounded-lg shadow p-2 min-[375px]:p-3 sm:p-4 border border-[#9d0208]">
            <div className="text-[10px] min-[375px]:text-xs sm:text-sm text-gray-300">Customers</div>
            <div className="text-base min-[375px]:text-lg sm:text-2xl font-bold text-[#9d0208] mt-0.5 min-[375px]:mt-1">
              {users.filter(u => u.role === "customer").length}
            </div>
          </div>
          <div className="bg-[#111] rounded-md min-[375px]:rounded-lg shadow p-2 min-[375px]:p-3 sm:p-4 border border-[#9d0208]">
            <div className="text-[10px] min-[375px]:text-xs sm:text-sm text-gray-300">Sellers</div>
            <div className="text-base min-[375px]:text-lg sm:text-2xl font-bold text-[#9d0208] mt-0.5 min-[375px]:mt-1">
              {users.filter(u => u.role === "seller").length}
            </div>
          </div>
          <div className="bg-[#111] rounded-md min-[375px]:rounded-lg shadow p-2 min-[375px]:p-3 sm:p-4 border border-[#9d0208]">
            <div className="text-[10px] min-[375px]:text-xs sm:text-sm text-gray-300">Admins</div>
            <div className="text-base min-[375px]:text-lg sm:text-2xl font-bold text-[#9d0208] mt-0.5 min-[375px]:mt-1">
              {users.filter(u => u.role === "admin").length}
            </div>
          </div>
        </div>

        {/* Users Cards for Mobile / Table for Desktop */}
        <div className="bg-[#111] rounded-md min-[375px]:rounded-lg shadow overflow-hidden border border-[#9d0208]">

          {/* Mobile View */}
          <div className="block sm:hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-4 min-[375px]:p-6 text-center text-gray-400 text-xs min-[375px]:text-sm">
                No users found
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {filteredUsers.map(user => (
                  <div key={user._id} className="p-2.5 min-[375px]:p-4 space-y-2 min-[375px]:space-y-3">

                    {/* User Info */}
                    <div className="flex items-center space-x-2 min-[375px]:space-x-3">
                      <div className="flex-shrink-0">
                        {user.imageUrl ? (
                          <img className="h-10 w-10 min-[375px]:h-12 min-[375px]:w-12 rounded-full object-cover" src={user.imageUrl} alt={user.name} />
                        ) : (
                          <div className="h-10 w-10 min-[375px]:h-12 min-[375px]:w-12 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-semibold text-sm min-[375px]:text-lg">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs min-[375px]:text-sm font-medium text-white truncate">{user.name || "No Name"}</div>
                        <div className="text-[10px] min-[375px]:text-xs text-gray-400 truncate">{user.email}</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] min-[375px]:text-xs">
                      <div>
                        <span className="text-gray-400 font-medium">Provider:</span>
                        <div className="mt-1">
                          <span className="px-1.5 min-[375px]:px-2 py-0.5 min-[375px]:py-1 inline-flex text-[9px] min-[375px]:text-xs leading-tight font-semibold rounded-full bg-gray-800 text-gray-200">
                            {user.provider || "credentials"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 font-medium">Role:</span>
                        <div className="mt-1">
                          <span className={`px-1.5 min-[375px]:px-2 py-0.5 min-[375px]:py-1 inline-flex text-[9px] min-[375px]:text-xs leading-tight font-semibold rounded-full ${
                            user.role === "admin" || user.role === "seller" || user.role === "customer"
                              ? "bg-[#9d0208]/20 text-[#ffb3b3]"
                              : "bg-gray-700 text-gray-200"
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Change */}
                    <div>
                      <label className="block text-[10px] min-[375px]:text-xs text-gray-400 mb-1 font-medium">Change Role:</label>
                      {user._id === session?.user?.id ? (
                        <span className="text-[10px] min-[375px]:text-xs text-gray-500 italic">Current User</span>
                      ) : session?.user?.role === "seller" ? (
                        <span className="text-[10px] min-[375px]:text-xs text-gray-500 italic">No Permission</span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={e => handleRoleChange(user._id, e.target.value)}
                          disabled={updating === user._id}
                          className="w-full text-[10px] min-[375px]:text-xs border border-[#9d0208] rounded-md px-2 py-1.5 bg-black text-white focus:ring-1 focus:ring-[#9d0208] focus:outline-none disabled:opacity-50"
                        >
                          <option value="customer">Customer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </div>

                    <div className="text-[10px] min-[375px]:text-xs text-gray-400 pt-1 border-t border-gray-700/50">
                      <span className="font-medium">Joined:</span> {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-[#111]">
                <tr>
                  {["User", "Email", "Provider", "Current Role", "Change Role", "Joined"].map((th, idx) => (
                    <th key={idx} className="px-4 lg:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      {th}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-[#111] divide-y divide-gray-700">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-4 lg:px-6 py-4 text-center text-gray-400 text-sm">No users found</td>
                  </tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user._id} className="hover:bg-[#1a1a1a] transition-colors">
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-8 w-8 lg:h-10 lg:w-10 flex-shrink-0">
                            {user.imageUrl ? (
                              <img className="h-8 w-8 lg:h-10 lg:w-10 rounded-full object-cover" src={user.imageUrl} alt={user.name} />
                            ) : (
                              <div className="h-8 w-8 lg:h-10 lg:w-10 rounded-full bg-gray-700 flex items-center justify-center text-gray-300 font-semibold text-sm">
                                {user.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                          <div className="ml-3 lg:ml-4">
                            <div className="text-xs lg:text-sm font-medium text-white truncate max-w-[120px] lg:max-w-none">{user.name || "No Name"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm text-white">
                        <div className="truncate max-w-[150px] lg:max-w-none">{user.email}</div>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm">
                        <span className="px-2 inline-flex text-[10px] lg:text-xs font-semibold rounded-full bg-gray-800 text-gray-200">
                          {user.provider || "credentials"}
                        </span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-xs lg:text-sm">
                        <span className="px-2 inline-flex text-[10px] lg:text-xs font-semibold rounded-full bg-[#9d0208]/20 text-[#ffb3b3]">{user.role}</span>
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                        {user._id === session?.user?.id ? (
                          <span className="text-[10px] lg:text-xs text-gray-400">Current User</span>
                        ) : session?.user?.role === "seller" ? (
                          <span className="text-[10px] lg:text-xs text-gray-400">No Permission</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={e => handleRoleChange(user._id, e.target.value)}
                            disabled={updating === user._id}
                            className="text-[10px] lg:text-xs border border-[#9d0208] rounded px-2 py-1 bg-black text-white focus:ring-1 focus:ring-[#9d0208] focus:outline-none disabled:opacity-50"
                          >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-[10px] lg:text-sm text-gray-400">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  );
}