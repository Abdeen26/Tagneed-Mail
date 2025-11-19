"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const RegisterPage = () => {
  const router = useRouter();

  const [data, setData] = useState({
    name: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (data.password !== data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Build payload without confirmPassword
    const { confirmPassword, ...payload } = data;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (res.ok) {
        router.push("/auth/login");
      } else {
        setError(response.message || "Registration failed");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSubmit}
        className="bg-background p-6 rounded-lg md:w-[600px] w-[350px] h-fit my-4 shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-4 text-center">Register</h2>

        {error && (
          <p className="text-[#ff0000af] font-semibold text-center my-2 text-sm">
            {error}
          </p>
        )}

        <div className="mb-4">
          <label className="block font-medium text-gray-700">Name</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setData({ ...data, name: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setData({ ...data, username: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700">Password</label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium text-gray-700">
            Password Confirmation
          </label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
            onChange={(e) =>
              setData({ ...data, confirmPassword: e.target.value })
            }
            required
          />
        </div>

        <button
          type="submit"
          className="w-full font-semibold bg-maincolor text-white py-2 px-4 rounded-md shadow-lg hover:scale-[103%] transition"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default RegisterPage;
