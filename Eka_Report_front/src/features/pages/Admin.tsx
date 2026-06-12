import React, { useState, useEffect, useId } from "react";
import { m, AnimatePresence } from "framer-motion";
import {
  UserPlus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  User,
  Mail,
  Shield,
  X,
  Power,
  KeyRound,
} from "lucide-react";
import { apiClient } from "@/app/api/api-client";
import { useAuthStore } from "@/shared/lib/store/authStore";

interface UserType {
  id: number;
  username: string;
  email: string;
  full_name: string;
  role: string;
  is_active: number;
  created_at: string;
}

export default function AdminPage() {
  const currentUser = useAuthStore((s) => s.user);

  const [users, setUsers] = useState<UserType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);

  // Form states
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("viewer");
  const [isActive, setIsActive] = useState(1);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const usernameId = useId();
  const emailId = useId();
  const fullNameId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const roleId = useId();
  const isActiveId = useId();

  // Load all users
  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient<UserType[]>("/api/admin/users");
      setUsers(data);
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to fetch users list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Auto-clear toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Handle User Creation
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormLoading(true);
    try {
      await apiClient("/api/admin/users", {
        body: {
          username: username.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
          password,
          role,
          is_active: isActive,
        },
      });

      setToast({
        type: "success",
        message: `User '${username}' created successfully.`,
      });
      setIsAddOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Failed to create user.");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle User Edit
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormError(null);

    if (password && password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setFormLoading(true);
    try {
      await apiClient(`/api/admin/users/${selectedUser.id}`, {
        method: "PUT",
        body: {
          username: username.trim(),
          email: email.trim(),
          full_name: fullName.trim(),
          password: password || undefined,
          role,
          is_active: isActive,
        },
      });

      setToast({
        type: "success",
        message: `User '${username}' updated successfully.`,
      });
      setIsEditOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      setFormError(err.message || "Failed to update user.");
    } finally {
      setFormLoading(false);
    }
  };

  // Handle User Delete
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    setFormLoading(true);
    try {
      await apiClient(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      setToast({
        type: "success",
        message: `User '${selectedUser.username}' deleted successfully.`,
      });
      setIsDeleteOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      setToast({
        type: "error",
        message: err.message || "Failed to delete user.",
      });
      setIsDeleteOpen(false);
    } finally {
      setFormLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setEmail("");
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setRole("viewer");
    setIsActive(1);
    setFormError(null);
    setSelectedUser(null);
  };

  const openAddModal = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const openEditModal = (user: UserType) => {
    resetForm();
    setSelectedUser(user);
    setUsername(user.username);
    setEmail(user.email);
    setFullName(user.full_name);
    setRole(user.role);
    setIsActive(user.is_active);
    setIsEditOpen(true);
  };

  const openDeleteModal = (user: UserType) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.username.toLowerCase().includes(q) ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative font-sans text-text-primary select-none max-w-7xl mx-auto py-6 md:py-10 flex flex-col gap-10">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none -translate-y-1/2"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce shadow-2xl">
          <div
            className={`flex items-center gap-3 px-5 py-4 rounded-2xl border backdrop-blur-md transition-all duration-300 ${toast.type === "success"
                ? "bg-emerald-50/95 border-emerald-200 text-emerald-800"
                : "bg-rose-50/95 border-rose-200 text-rose-800"
              }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="w-5.5 h-5.5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5.5 h-5.5 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold text-sm">{toast.message}</span>
          </div>
        </div>
      )}

      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-2">
        <div className="flex flex-col gap-2">
          <h2 className="text-2xl md:text-3.5xl font-extrabold font-display text-slate-900 tracking-tight leading-tight">
            User Administration
          </h2>
          <p className="text-sm md:text-base text-text-secondary max-w-3xl leading-relaxed">
            Manage register credentials, assign roles (viewer, editor, admin), enable or disable accounts, and perform system password resets.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white bg-primary hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all active:scale-98 cursor-pointer self-start md:self-center shrink-0"
        >
          <UserPlus size={16} />
          Add User
        </button>
      </div>

      {/* Main Panel */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm flex flex-col">
        {/* Toolbar */}
        <div className="px-8 py-6 md:py-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/50">
          <div className="relative max-w-lg w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4.5 h-4.5" />
            <input
              type="text"
              placeholder="Search by username, full name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-5 py-3 text-sm text-text-primary placeholder-slate-400 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/10 transition-all font-medium shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="text-xs md:text-sm text-text-secondary font-semibold">
            Showing {filteredUsers.length} of {users.length} registered users
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-text-secondary">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm font-semibold">Loading user accounts...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-2">
              <User size={40} className="stroke-1 text-slate-300" />
              <p className="text-sm font-bold">No users match your query</p>
              <p className="text-xs">Try searching for something else or add a new user profile.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-500 bg-slate-50/80 uppercase tracking-wider">
                  <th className="px-8 py-5">User Profile</th>
                  <th className="px-8 py-5">System Role</th>
                  <th className="px-8 py-5">Access Status</th>
                  <th className="px-8 py-5">Created Date</th>
                  <th className="px-8 py-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?.id === u.id;
                  const initials = u.full_name
                    ? u.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                      .slice(0, 2)
                    : "??";

                  // Dynamic styles for role badges
                  let roleBadgeClass = "";
                  if (u.role === "admin") {
                    roleBadgeClass = "bg-violet-50 text-violet-700 border-violet-200/60";
                  } else if (u.role === "editor") {
                    roleBadgeClass = "bg-blue-50 text-blue-700 border-blue-200/60";
                  } else {
                    roleBadgeClass = "bg-slate-50 text-slate-600 border-slate-200/60";
                  }

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/40 transition-colors group">
                      <td className="px-8 py-5.5">
                        <div className="flex items-center gap-3.5">
                          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary/10 to-indigo-500/10 text-primary border border-primary/20 flex items-center justify-center text-xs font-bold shadow-xs transition-all duration-300 group-hover:scale-102">
                            {initials}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                              {u.full_name}
                              {isSelf && (
                                <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                              <span>@{u.username}</span>
                              <span className="text-slate-300">•</span>
                              <span>{u.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${roleBadgeClass}`}>
                          <Shield size={12} className="shrink-0 opacity-80" />
                          <span className="capitalize">{u.role}</span>
                        </span>
                      </td>
                      <td className="px-8 py-5.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border ${u.is_active
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200/60"
                              : "bg-rose-50 text-rose-700 border-rose-200/60"
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${u.is_active ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`} />
                          {u.is_active ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-8 py-5.5 text-xs font-semibold text-slate-500 font-mono">
                        {u.created_at || "N/A"}
                      </td>
                      <td className="px-8 py-5.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <m.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(u)}
                            className="p-2 bg-slate-50 hover:bg-primary/10 text-slate-600 hover:text-primary rounded-xl border border-slate-200 hover:border-primary/20 transition-all cursor-pointer shadow-xs"
                            title="Edit User Details"
                          >
                            <Edit2 size={14} />
                          </m.button>
                          <m.button
                            whileHover={isSelf ? {} : { scale: 1.05 }}
                            whileTap={isSelf ? {} : { scale: 0.95 }}
                            onClick={() => openDeleteModal(u)}
                            disabled={isSelf}
                            className={`p-2 rounded-xl border transition-all cursor-pointer shadow-xs ${isSelf
                                ? "bg-slate-50/50 border-slate-100 text-slate-200 cursor-not-allowed"
                                : "bg-slate-50 hover:bg-rose-50 border-slate-200 hover:border-rose-200 text-slate-600 hover:text-error"
                              }`}
                            title={isSelf ? "You cannot delete yourself" : "Delete User Profile"}
                          >
                            <Trash2 size={14} />
                          </m.button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>


    </div>
  );
}
