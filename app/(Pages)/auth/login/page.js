"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

const LoginPage = () => {
  const router = useRouter();
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await signIn("credentials", {
      ...data,
      redirect: false,
    });

    if (result.error) {
      console.error(result.error);
    } else {
      router.push("/");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-md"
      >
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maincolor focus:border-maincolor sm:text-sm"
            onChange={(e) => setData({ ...data, email: e.target.value })}
            required
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maincolor focus:border-maincolor sm:text-sm"
            onChange={(e) => setData({ ...data, password: e.target.value })}
            required
          />
        </div>
        <button
          type="submit"
          className="w-full bg-maincolor text-white py-2 px-4 rounded-md hover:bg-secondcolor focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maincolor"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
