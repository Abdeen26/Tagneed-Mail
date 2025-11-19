"use client";

import { useEffect, useState } from "react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", department: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch users
  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      setDepartments(data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const handleEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      department: user.department?._id || "",
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", department: "" });
    setError("");
  };

  const handleSave = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: formData.name,
          department: formData.department || null,
        }),
      });

      if (res.ok) {
        await fetchUsers();
        handleCancel();
      } else {
        const { message } = await res.json();
        setError(message || "Failed to update user.");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Users</h1>

      {error && <p className="text-red-500 font-semibold mb-4">{error}</p>}

      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Username</th>
            <th className="border border-gray-300 p-2">Department</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="hover:bg-gray-50">
              {/* Name */}
              <td className="border border-gray-300 p-2">
                {editingId === user._id ? (
                  <input
                    type="text"
                    className="border p-1 w-full"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                ) : (
                  user.name
                )}
              </td>

              {/* Username (read-only) */}
              <td className="border border-gray-300 p-2">{user.username}</td>

              {/* Department dropdown */}
              <td className="border border-gray-300 p-2">
                {editingId === user._id ? (
                  <select
                    className="border p-1 w-full"
                    value={formData.department}
                    onChange={(e) =>
                      setFormData({ ...formData, department: e.target.value })
                    }
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  user.department?.name || "-"
                )}
              </td>

              {/* Actions */}
              <td className="border border-gray-300 p-2 flex gap-2">
                {editingId === user._id ? (
                  <>
                    <button
                      className="bg-green-500 text-white px-3 py-1 rounded"
                      onClick={handleSave}
                      disabled={loading}
                    >
                      Save
                    </button>
                    <button
                      className="bg-gray-300 px-3 py-1 rounded"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                    onClick={() => handleEdit(user)}
                  >
                    Edit
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
