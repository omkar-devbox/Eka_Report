import React, { useState, useEffect } from "react";
import { 
  UserPlus, 
  Edit2, 
  Trash2, 
  Key, 
  Search, 
  ShieldAlert, 
  Check, 
  X, 
  Loader2, 
  UserCheck, 
  UserX,
  Lock,
  User as UserIcon,
  Mail,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";
import { apiClient } from "@/app/api/api-client";
import { useAuthStore } from "@/shared/lib/store/authStore";

interface User {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
}

export default function UsersPage() {
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modal visibility states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form field states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [isActive, setIsActive] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Currently selected users for Edit/Password Reset
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [passwordUser, setPasswordUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<User[]>("/api/users");
      setUsers(data);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to load users list from server."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setRole("viewer");
    setIsActive(true);
    setShowPassword(false);
    setEditingUser(null);
    setPasswordUser(null);
  };

  const handleOpenAddModal = () => {
    resetForm();
    setShowAddModal(true);
  };

  const handleOpenEditModal = (user: User) => {
    resetForm();
    setEditingUser(user);
    setEmail(user.email);
    setFullName(user.full_name);
    setRole(user.role);
    setIsActive(user.is_active === 1);
    setShowEditModal(true);
  };

  const handleOpenPasswordModal = (user: User) => {
    resetForm();
    setPasswordUser(user);
    setShowPasswordModal(true);
  };

  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setToast(null);

    try {
      await apiClient("/api/users", {
        body: {
          username: username.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
          password,
          role,
          is_active: isActive
        }
      });

      setToast({
        type: "success",
        message: `User '${username}' successfully created.`
      });
      setShowAddModal(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to create user."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setIsSubmitting(true);
    setToast(null);

    try {
      await apiClient(`/api/users/${editingUser.id}`, {
        method: "PUT",
        body: {
          email: email.trim(),
          full_name: fullName.trim(),
          role,
          is_active: isActive
        }
      });

      setToast({
        type: "success",
        message: `User profile for '${editingUser.username}' successfully updated.`
      });
      setShowEditModal(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to update user."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordUser) return;
    
    if (password !== confirmPassword) {
      setToast({
        type: "error",
        message: "Passwords do not match."
      });
      return;
    }

    setIsSubmitting(true);
    setToast(null);

    try {
      await apiClient(`/api/users/${passwordUser.id}/password`, {
        method: "PUT",
        body: { password }
      });

      setToast({
        type: "success",
        message: `Password for '${passwordUser.username}' successfully updated.`
      });
      setShowPasswordModal(false);
      resetForm();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to change user password."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser?.id) {
      setToast({
        type: "error",
        message: "You cannot delete your own active admin account."
      });
      return;
    }

    const confirmDelete = window.confirm(`Are you sure you want to permanently delete user "${user.username}"?`);
    if (!confirmDelete) return;

    try {
      await apiClient(`/api/users/${user.id}`, {
        method: "DELETE"
      });

      setToast({
        type: "success",
        message: `User '${user.username}' successfully removed.`
      });
      fetchUsers();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to delete user."
      });
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.username.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative font-sans text-text-primary max-w-7xl mx-auto py-2 flex flex-col gap-6 select-none">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl">
          <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
            toast.type === "success" 
              ? "bg-emerald-50/95 border-emerald-200 text-emerald-800" 
              : "bg-rose-50/95 border-rose-200 text-rose-800"
          }`}>
            {toast.type === "success" ? (
              <Check className="w-5.5 h-5.5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-5.5 h-5.5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold font-display text-slate-900 tracking-tight">
            User Account Management
          </h2>
          <p className="text-sm text-text-secondary max-w-2xl mt-1">
            Register new users, modify access levels, change active status, or reset credentials. Restricted to administrators.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white font-bold text-sm px-5 py-3 rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.01] active:scale-98 cursor-pointer transition-all shrink-0"
        >
          <UserPlus className="w-4.5 h-4.5" />
          Add New User
        </button>
      </div>

      {/* Main Console Area */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50/50">
          <div className="relative w-full md:max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="w-4.5 h-4.5 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by username, full name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div className="text-xs text-slate-500 font-semibold shrink-0">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users Table Container */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/20 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-4 px-6">User details</th>
                <th className="py-4 px-6">Email</th>
                <th className="py-4 px-6">Role</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400 font-medium">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-3" />
                    Fetching user records...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  
                  // Role tag configuration
                  let roleBadgeStyle = "bg-slate-100 border-slate-200 text-slate-600";
                  if (user.role === "admin") {
                    roleBadgeStyle = "bg-purple-50 border-purple-200/80 text-purple-700 font-semibold";
                  } else if (user.role === "editor") {
                    roleBadgeStyle = "bg-indigo-50 border-indigo-200/80 text-indigo-700 font-semibold";
                  }

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/40 transition-colors">
                      {/* Name / Username */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 text-slate-500 border border-slate-200/80 flex items-center justify-center font-bold text-sm">
                            {user.full_name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                              {user.full_name}
                              {isSelf && (
                                <span className="bg-teal-50 border border-teal-200 text-teal-700 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                                  You
                                </span>
                              )}
                            </span>
                            <span className="text-xs text-slate-400 font-mono">@{user.username}</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {user.email}
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs border uppercase tracking-wider font-semibold ${roleBadgeStyle}`}>
                          {user.role}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          user.is_active === 1
                            ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                            : "bg-slate-100 border-slate-200 text-slate-500"
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            user.is_active === 1 
                              ? "bg-emerald-500 animate-pulse" 
                              : "bg-slate-400"
                          }`} />
                          {user.is_active === 1 ? "Active" : "Inactive"}
                        </span>
                      </td>

                      {/* Creation Date */}
                      <td className="py-4 px-6 text-xs font-mono text-slate-500">
                        {user.created_at}
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenPasswordModal(user)}
                            title="Reset Password"
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Key className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(user)}
                            title="Edit User profile"
                            className="p-2 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user)}
                            disabled={isSelf}
                            title={isSelf ? "Cannot delete yourself" : "Delete User"}
                            className={`p-2 rounded-lg border transition-all ${
                              isSelf
                                ? "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed opacity-50"
                                : "bg-slate-50 border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 cursor-pointer"
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <UserX className="w-10 h-10 mx-auto text-slate-300 mb-3" />
                    No users match your search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. ADD USER MODAL */}
      {/* ========================================================================= */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-primary" />
                Register New User
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAddUserSubmit} className="p-6 flex flex-col gap-4">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-primary" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full"
                />
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <span className="font-mono text-primary font-bold text-xs">@</span>
                  Username
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="john.doe"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full font-mono"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    Access Role
                  </label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full cursor-pointer"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 justify-end">
                  <label className="flex items-center gap-2 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-primary border-slate-300 focus:ring-primary h-4.5 w-4.5 accent-primary"
                    />
                    <span className="text-xs font-bold text-slate-700">Account Active</span>
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Register User"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT USER PROFILE MODAL */}
      {/* ========================================================================= */}
      {showEditModal && editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Edit2 className="w-4.5 h-4.5 text-primary" />
                Edit Profile: @{editingUser.username}
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditUserSubmit} className="p-6 flex flex-col gap-4">
              
              {/* Full Name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <UserIcon className="w-3.5 h-3.5 text-primary" />
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-primary" />
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="john@example.com"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full"
                />
              </div>

              {/* Role & Status Row */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-primary" />
                    Access Role
                  </label>
                  <select
                    value={role}
                    disabled={editingUser.id === currentUser?.id}
                    onChange={(e) => setRole(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-800 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5 justify-end">
                  <label className={`flex items-center gap-2 px-3 py-3 border border-slate-200 rounded-xl bg-slate-50/50 cursor-pointer select-none ${
                    editingUser.id === currentUser?.id ? "opacity-60 cursor-not-allowed" : ""
                  }`}>
                    <input
                      type="checkbox"
                      checked={isActive}
                      disabled={editingUser.id === currentUser?.id}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded text-primary border-slate-300 focus:ring-primary h-4.5 w-4.5 accent-primary disabled:cursor-not-allowed"
                    />
                    <span className="text-xs font-bold text-slate-700">Account Active</span>
                  </label>
                </div>
              </div>

              {/* Self warnings */}
              {editingUser.id === currentUser?.id && (
                <div className="text-[10.5px] bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl flex gap-2 leading-relaxed">
                  <ShieldAlert className="w-4.5 h-4.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    You cannot change your own admin role or status to prevent self-lockout. To edit, please request another administrator.
                  </span>
                </div>
              )}

              {/* Modal Actions */}
              <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. RESET PASSWORD MODAL */}
      {/* ========================================================================= */}
      {showPasswordModal && passwordUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm transition-all duration-300">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl animate-scale-up">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
                <Key className="w-4.5 h-4.5 text-primary" />
                Reset Password: @{passwordUser.username}
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePasswordSubmit} className="p-6 flex flex-col gap-4">
              
              {/* New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-10 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-primary" />
                  Confirm New Password
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 focus:bg-white transition-all w-full"
                />
              </div>

              {/* Modal Actions */}
              <div className="mt-4 flex items-center justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md active:scale-98 transition-all cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Reset Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
