"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function UsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    department: "",
    role: "user",
    isActive: true,
  });
  const [originalData, setOriginalData] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    username: "",
    password: "",
    role: "user",
    department: "",
    isActive: true,
  });

  const roleOptions = ["admin", "manager", "user"];

  // Get current user's ID from session
  const currentUserId = session?.user?.id;
  const currentUserRole = session?.user?.role;

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("🔍 Fetching users...");
      const res = await fetch("/api/users");

      console.log("Response status:", res.status);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Error response:", errorText);
        throw new Error(
          `HTTP error! status: ${res.status}, message: ${errorText}`
        );
      }

      const data = await res.json();
      console.log("API Response:", data);

      // Check if response has data property or is an array
      let usersArray = [];

      if (Array.isArray(data)) {
        usersArray = data;
      } else if (data && typeof data === "object" && Array.isArray(data.data)) {
        usersArray = data.data;
      } else if (data && typeof data === "object" && data.success) {
        usersArray = data.data || [];
      }

      console.log("Users array:", usersArray);
      setUsers(usersArray || []);
      setError("");
    } catch (err) {
      console.error("Detailed fetch error:", err);
      setError(`Failed to fetch users: ${err.message}`);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data = await res.json();

      let departmentsArray = [];

      if (Array.isArray(data)) {
        departmentsArray = data;
      } else if (data && typeof data === "object" && Array.isArray(data.data)) {
        departmentsArray = data.data;
      }

      setDepartments(departmentsArray || []);
    } catch (err) {
      console.error("Error fetching departments:", err);
      setDepartments([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const handleEdit = (user) => {
    // Check if user is trying to edit themselves and they are admin
    if (user._id === currentUserId && user.role === "admin") {
      setError("You cannot edit your own admin account.");
      return;
    }

    setEditingId(user._id);
    setOriginalData({
      name: user.name || "",
      department: user.department?._id || "",
      role: user.role || "user",
      isActive: user.isActive !== false,
    });
    setFormData({
      name: user.name || "",
      department: user.department?._id || "",
      role: user.role || "user",
      isActive: user.isActive !== false,
    });
    setError("");
    setSuccess("");
    setIsCreating(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setOriginalData({});
    setFormData({ name: "", department: "", role: "user", isActive: true });
    setIsCreating(false);
    setNewUser({
      name: "",
      username: "",
      password: "",
      role: "user",
      department: "",
      isActive: true,
    });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Check if user is trying to deactivate themselves
      if (editingId === currentUserId && formData.isActive === false) {
        setError("You cannot deactivate your own account.");
        setLoading(false);
        return;
      }

      // Check if admin user is trying to change their own role
      if (editingId === currentUserId && formData.role !== originalData.role) {
        setError("You cannot change your own role.");
        setLoading(false);
        return;
      }

      // Build payload with only changed fields
      const payload = { id: editingId };

      // Compare each field with original data
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== originalData[key]) {
          // Handle empty department string
          if (key === "department") {
            payload[key] = formData[key] === "" ? null : formData[key];
          } else {
            payload[key] = formData[key];
          }
        }
      });

      // If no changes, just cancel
      if (Object.keys(payload).length === 1) {
        setSuccess("No changes detected.");
        setTimeout(() => {
          handleCancel();
        }, 1000);
        return;
      }

      console.log("📤 Sending PUT payload:", payload);

      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      console.log("📥 Response:", responseData);

      if (res.ok) {
        setSuccess("✅ User updated successfully!");
        await fetchUsers();
        setTimeout(() => {
          handleCancel();
        }, 1500);
      } else {
        setError(
          responseData.message ||
            responseData.errors?.join(", ") ||
            `Failed to update user. Status: ${res.status}`
        );
      }
    } catch (err) {
      console.error("❌ Save error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Validate required fields
      const requiredFields = ["name", "username", "password"];
      const missingFields = requiredFields.filter((field) => !newUser[field]);

      if (missingFields.length > 0) {
        setError(`Missing required fields: ${missingFields.join(", ")}`);
        setLoading(false);
        return;
      }

      // Validate username format (alphanumeric, underscores, hyphens)
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(newUser.username)) {
        setError(
          "Username must be 3-20 characters, alphanumeric with underscores or hyphens only."
        );
        setLoading(false);
        return;
      }

      console.log("📤 Sending POST payload:", newUser);

      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      const responseData = await res.json();
      console.log("📥 Response:", responseData);

      if (res.ok) {
        setSuccess("✅ User created successfully!");
        setNewUser({
          name: "",
          username: "",
          password: "",
          role: "user",
          department: "",
          isActive: true,
        });
        setIsCreating(false);
        await fetchUsers();
      } else {
        setError(
          responseData.message ||
            responseData.errors?.join(", ") ||
            `Failed to create user. Status: ${res.status}`
        );
      }
    } catch (err) {
      console.error("❌ Create error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId, username, userRole) => {
    // Check if user is trying to delete themselves
    if (userId === currentUserId) {
      setError("You cannot delete your own account.");
      return;
    }

    // Check if user is trying to delete an admin
    if (userRole === "admin") {
      setError("Cannot delete admin users.");
      return;
    }

    if (!confirm(`Are you sure you want to delete user: ${username}?`)) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log(`🗑️ Deleting user: ${userId}`);

      const res = await fetch(`/api/users?id=${userId}`, {
        method: "DELETE",
      });

      const responseData = await res.json();
      console.log("📥 Response:", responseData);

      if (res.ok) {
        setSuccess("✅ User deleted successfully!");
        await fetchUsers();
      } else {
        setError(
          responseData.message || `Failed to delete user. Status: ${res.status}`
        );
      }
    } catch (err) {
      console.error("❌ Delete error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Ensure users is always an array before rendering
  const usersArray = Array.isArray(users) ? users : [];

  // Check if current user is viewing their own row
  const isCurrentUser = (userId) => userId === currentUserId;

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users Management</h1>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
          onClick={() => {
            setIsCreating(!isCreating);
            setEditingId(null);
            setError("");
            setSuccess("");
          }}
          disabled={loading || editingId}
        >
          {isCreating ? "Cancel Create" : "Create New User"}
        </button>
      </div>

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Create New User Form */}
      {isCreating && (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Create New User</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={newUser.name}
                onChange={(e) =>
                  setNewUser({ ...newUser, name: e.target.value })
                }
                disabled={loading}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={newUser.username}
                onChange={(e) =>
                  setNewUser({ ...newUser, username: e.target.value })
                }
                disabled={loading}
                placeholder="Enter username"
              />
              <p className="text-xs text-gray-500 mt-1">
                3-20 characters, alphanumeric with _ or -
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={newUser.password}
                onChange={(e) =>
                  setNewUser({ ...newUser, password: e.target.value })
                }
                disabled={loading}
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2 capitalize"
                value={newUser.role}
                onChange={(e) =>
                  setNewUser({ ...newUser, role: e.target.value })
                }
                disabled={loading}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role} className="capitalize">
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department
              </label>
              <select
                className="w-full border border-gray-300 rounded px-3 py-2"
                value={newUser.department}
                onChange={(e) =>
                  setNewUser({ ...newUser, department: e.target.value })
                }
                disabled={loading}
              >
                <option value="">-- Select Department --</option>
                {departments.map((dept) => (
                  <option key={dept._id} value={dept._id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <div className="flex items-center space-x-2 mt-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={newUser.isActive === true}
                    onChange={() => setNewUser({ ...newUser, isActive: true })}
                    disabled={loading}
                  />
                  <span className="text-green-600">Active</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    className="mr-2"
                    checked={newUser.isActive === false}
                    onChange={() => setNewUser({ ...newUser, isActive: false })}
                    disabled={loading}
                  />
                  <span className="text-red-600">Inactive</span>
                </label>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded disabled:opacity-50"
              onClick={handleCreateUser}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading && usersArray.length === 0 ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading users...</p>
          </div>
        ) : usersArray.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found. {isCreating ? "" : "Create your first user above."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Username
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Department
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Role
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Status
                  </th>
                  <th className="p-4 text-left font-semibold text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {usersArray.map((user) => {
                  const isOwnAccount = isCurrentUser(user._id);
                  const isAdminUser = user.role === "admin";

                  return (
                    <tr
                      key={user._id}
                      className={`border-t hover:bg-gray-50 ${
                        isOwnAccount ? "bg-blue-50" : ""
                      }`}
                    >
                      <td className="p-4">
                        {editingId === user._id ? (
                          <input
                            type="text"
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            disabled={loading || isOwnAccount}
                          />
                        ) : (
                          <span className="font-medium">
                            {user.name || "-"}
                            {isOwnAccount && (
                              <span className="ml-2 text-xs text-blue-600 font-normal">
                                (You)
                              </span>
                            )}
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-gray-600">{user.username}</td>

                      <td className="p-4">
                        {editingId === user._id ? (
                          <select
                            className="w-full border border-gray-300 rounded px-3 py-2"
                            value={formData.department}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                department: e.target.value,
                              })
                            }
                            disabled={loading || isOwnAccount}
                          >
                            <option value="">-- Select Department --</option>
                            {departments.map((dept) => (
                              <option key={dept._id} value={dept._id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span>{user.department?.name || "-"}</span>
                        )}
                      </td>

                      <td className="p-4">
                        {editingId === user._id ? (
                          <select
                            className="w-full border border-gray-300 rounded px-3 py-2 capitalize"
                            value={formData.role}
                            onChange={(e) =>
                              setFormData({ ...formData, role: e.target.value })
                            }
                            disabled={loading || isOwnAccount}
                          >
                            {roleOptions.map((role) => (
                              <option
                                key={role}
                                value={role}
                                className="capitalize"
                              >
                                {role.charAt(0).toUpperCase() + role.slice(1)}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              user.role === "admin"
                                ? "bg-purple-100 text-purple-800"
                                : user.role === "manager"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {user.role || "user"}
                            {isOwnAccount && " (You)"}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {editingId === user._id ? (
                          <div className="flex items-center space-x-4">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                className="mr-2"
                                checked={formData.isActive === true}
                                onChange={() =>
                                  setFormData({ ...formData, isActive: true })
                                }
                                disabled={loading || isOwnAccount}
                              />
                              <span className="text-green-600">Active</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                className="mr-2"
                                checked={formData.isActive === false}
                                onChange={() =>
                                  setFormData({ ...formData, isActive: false })
                                }
                                disabled={loading || isOwnAccount}
                              />
                              <span className="text-red-600">Inactive</span>
                            </label>
                          </div>
                        ) : (
                          <span
                            className={`px-2 py-1 rounded text-sm ${
                              user.isActive !== false
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {user.isActive !== false ? "Active" : "Inactive"}
                          </span>
                        )}
                      </td>

                      <td className="p-4">
                        {editingId === user._id ? (
                          <div className="flex space-x-2">
                            <button
                              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
                              onClick={handleSave}
                              disabled={loading}
                            >
                              {loading ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded disabled:opacity-50"
                              onClick={handleCancel}
                              disabled={loading}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <button
                              className={`px-4 py-2 rounded disabled:opacity-50 ${
                                isOwnAccount
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-blue-600 hover:bg-blue-700 text-white"
                              }`}
                              onClick={() => handleEdit(user)}
                              disabled={loading || isCreating || isOwnAccount}
                              title={
                                isOwnAccount
                                  ? "You cannot edit your own account"
                                  : "Edit user"
                              }
                            >
                              Edit
                            </button>
                            <button
                              className={`px-4 py-2 rounded disabled:opacity-50 ${
                                isOwnAccount || isAdminUser
                                  ? "bg-gray-400 cursor-not-allowed"
                                  : "bg-red-600 hover:bg-red-700 text-white"
                              }`}
                              onClick={() =>
                                handleDelete(user._id, user.username, user.role)
                              }
                              disabled={
                                loading ||
                                isCreating ||
                                isOwnAccount ||
                                isAdminUser
                              }
                              title={
                                isOwnAccount
                                  ? "You cannot delete your own account"
                                  : isAdminUser
                                  ? "Cannot delete admin users"
                                  : "Delete user"
                              }
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Stats */}
      {usersArray.length > 0 && (
        <div className="mt-4 text-sm text-gray-500">
          Showing {usersArray.length} user{usersArray.length !== 1 ? "s" : ""}
          {usersArray.length > 0 && (
            <span className="ml-4">
              Active: {usersArray.filter((u) => u.isActive !== false).length} |
              Inactive: {usersArray.filter((u) => u.isActive === false).length}
            </span>
          )}
        </div>
      )}

      {/* Info note */}
      {currentUserRole === "admin" && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
          <p className="text-blue-700 text-sm">
            💡 <strong>Note:</strong> As an admin, you cannot edit or delete
            your own account or other admin accounts. This is a security measure
            to prevent accidental lockout.
          </p>
        </div>
      )}
    </div>
  );
}
