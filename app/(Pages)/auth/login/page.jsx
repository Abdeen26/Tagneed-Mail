"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { BiShow } from "react-icons/bi";
import Switch from "react-switch";

const LoginPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Handle specific error messages
        if (result.error.includes("inactive")) {
          setError("Account is inactive. Please contact your administrator.");
        } else if (result.error.includes("Invalid")) {
          setError("Invalid username or password");
        } else {
          setError("Login failed. Please try again.");
        }
        setLoading(false);
        return;
      }

      // If login successful
      setLoading(false);

      // Handle stay logged in option
      if (stayLoggedIn) {
        // Update session cookie max age (NextAuth handles this through session.maxAge)
        // You can also set a custom cookie
        document.cookie = `next-auth.session-token=; Max-Age=2592000; Path=/`; // 30 days
      }

      // Redirect to home
      router.push("/");
      router.refresh(); // Refresh to get updated session
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  // Check if user is already logged in
  useEffect(() => {
    if (session && status === "authenticated") {
      // Also check if session user is active (extra safety)
      if (session.user?.isActive === false) {
        // Force logout if user somehow has inactive session
        signIn("credentials", { redirect: false, callbackUrl: "/login" });
        return;
      }
      router.push("/");
    }
  }, [session, status, router]);

  // Add a useEffect to handle URL error parameters (from NextAuth)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const errorParam = urlParams.get("error");

    if (errorParam) {
      switch (errorParam) {
        case "CredentialsSignin":
          setError("Invalid username or password");
          break;
        case "inactive":
          setError("Account is inactive. Please contact administrator.");
          break;
        default:
          setError("Login failed. Please try again.");
      }
    }
  }, []);

  return (
    <div className="flex justify-center items-center ">
      <form
        onSubmit={handleSubmit}
        className="bg-background p-6 rounded-lg md:w-[600px] w-[350px] h-fit my-4 max-md:self-center shadow-2xl"
      >
        <h2 className="text-3xl font-bold mb-4 text-center">Login</h2>
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Username</label>
          <input
            type="text"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maincolor focus:border-maincolor sm:text-sm"
            onChange={(e) => setUsername(e.target.value)}
            disabled={loading}
            placeholder="Enter your username..."
            required
            autoComplete="username"
          />
        </div>
        <div className="mb-4">
          <label className="block font-medium text-gray-700">Password</label>
          <div className="flex items-center relative">
            <input
              type={`${showPassword ? "text" : "password"}`}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maincolor focus:border-maincolor sm:text-sm"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              placeholder="Enter your password..."
              required
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute right-3 mt-1 text-maincolor hover:cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
              disabled={loading}
            >
              <BiShow size={20} />
            </button>
          </div>
        </div>
        {/* Keep Me Logged In */}
        <div className="flex items-center my-2 gap-2 relative font-medium">
          <Switch
            onChange={() => setStayLoggedIn(!stayLoggedIn)}
            checked={stayLoggedIn}
            className="mr-2"
            handleDiameter={20}
            width={40}
            height={20}
            onColor="#485f32"
            offColor="#94a3b8"
            disabled={loading}
          />
          <label htmlFor="stayLoggedIn" className="text-sm">
            Keep me logged in
          </label>
        </div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 font-medium text-center text-sm">
              {error}
            </p>
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-semibold bg-maincolor hover:scale-[103%] transition duration-300 hover:drop-shadow-md shadow-lg text-white py-2 px-4 rounded-md hover:bg-secondcolor focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maincolor disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Logging in...
            </div>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
