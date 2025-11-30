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
      const response = await fetch("/api/admin/users", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to fetch users";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (e) {
          errorMessage = `Server error: ${response.status}`;
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log("Fetched users:", data.users);
      
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else {
        console.error("Invalid users data:", data);
        setUsers([]);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Failed to load users: " + error.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      return;
    }

    try {
      setUpdating(userId);
      const response = await fetch("/api/admin/users/update-role", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update role");
      }

      const data = await response.json();
      
      // Update local state
      setUsers(users.map(user => 
        user._id === userId ? { ...user, role: newRole } : user
      ));
      
      alert(data.message);
    } catch (error) {
      console.error("Error updating role:", error);
      alert("Failed to update user role: " + error.message);
    } finally {
      setUpdating(null);
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (session?.user?.role !== "admin" && session?.user?.role !== "seller") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-3 sm:py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-xl sm:text-3xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-gray-600">
            Manage all registered users and their roles
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="space-y-3 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Search Users
              </label>
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Filter by Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600">Total Users</div>
            <div className="text-lg sm:text-2xl font-bold text-gray-900">{users.length}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600">Customers</div>
            <div className="text-lg sm:text-2xl font-bold text-blue-600">
              {users.filter(u => u.role === "customer").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600">Sellers</div>
            <div className="text-lg sm:text-2xl font-bold text-green-600">
              {users.filter(u => u.role === "seller").length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-3 sm:p-4">
            <div className="text-xs sm:text-sm text-gray-600">Admins</div>
            <div className="text-lg sm:text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === "admin").length}
            </div>
          </div>
        </div>

        {/* Users Cards for Mobile, Table for Desktop */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {/* Mobile View - Cards */}
          <div className="block sm:hidden">
            {filteredUsers.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                No users found
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <div key={user._id} className="p-4 space-y-3">
                    {/* User Info */}
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {user.imageUrl ? (
                          <img
                            className="h-12 w-12 rounded-full object-cover"
                            src={user.imageUrl}
                            alt={user.name}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-lg">
                            {user.name?.charAt(0).toUpperCase() || "?"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {user.name || "No Name"}
                        </div>
                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Provider:</span>
                        <div className="mt-1">
                          <span className="px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full bg-gray-100 text-gray-800">
                            {user.provider || "credentials"}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Role:</span>
                        <div className="mt-1">
                          <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${
                            user.role === "admin" 
                              ? "bg-purple-100 text-purple-800"
                              : user.role === "seller"
                              ? "bg-green-100 text-green-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {user.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Change */}
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Change Role:</label>
                      {user._id === session?.user?.id ? (
                        <span className="text-xs text-gray-500 italic">Current User</span>
                      ) : session?.user?.role === "seller" ? (
                        <span className="text-xs text-gray-500 italic">No Permission</span>
                      ) : (
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          disabled={updating === user._id}
                          className="w-full text-xs border border-gray-300 rounded px-2 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                        >
                          <option value="customer">Customer</option>
                          <option value="seller">Seller</option>
                          <option value="admin">Admin</option>
                        </select>
                      )}
                    </div>

                    {/* Joined Date */}
                    <div className="text-xs text-gray-500">
                      Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Desktop View - Table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Current Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Change Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {user.imageUrl ? (
                              <img
                                className="h-10 w-10 rounded-full object-cover"
                                src={user.imageUrl}
                                alt={user.name}
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                                {user.name?.charAt(0).toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name || "No Name"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                          {user.provider || "credentials"}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === "admin" 
                            ? "bg-purple-100 text-purple-800"
                            : user.role === "seller"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user._id === session?.user?.id ? (
                          <span className="text-sm text-gray-500">Current User</span>
                        ) : session?.user?.role === "seller" ? (
                          <span className="text-sm text-gray-500">No Permission</span>
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user._id, e.target.value)}
                            disabled={updating === user._id}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                          >
                            <option value="customer">Customer</option>
                            <option value="seller">Seller</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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