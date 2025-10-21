"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { BiShow } from "react-icons/bi";
import Switch from "react-switch";

const LoginPage = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  // const [data, setData] = useState({
  //   email: "",
  //   password: "",
  // });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      user,
      password,
      redirect: false,
      stayLoggedIn, // This will be passed
    });

    if (!result.error) {
      setLoading(false);
      // If the user chooses to stay logged in, extend session duration
      if (stayLoggedIn) {
        document.cookie = `next-auth.session-token; Max-Age=${
          30 * 24 * 60 * 60
        }; Path=/`; // Example to extend cookie for 30 days
      }

      router.push("/");
    } else {
      setLoading(false);
      setError(result.error);
    }
  };

  useEffect(() => {
    if (session && status === "authenticated") {
      router.push("/");
    }
  }, [session, status]);

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
            type="tex"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-maincolor focus:border-maincolor sm:text-sm"
            onChange={(e) => setUser(e.target.value)}
            disabled={loading}
            placeholder="Enter your username..."
            required
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
            />
            <button
              type="button"
              className="absolute right-3 mt-1 text-maincolor hover:cursor-pointer"
              onClick={() => setShowPassword((prev) => !prev)}
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
          />
          <label htmlFor="stayLoggedIn" className="text-sm">
            Keep me logged in
          </label>
        </div>
        {/* Error Message */}
        {error && (
          <p className="text-[#ff0000af] font-semibold text-center my-2 text-sm">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="w-full font-semibold bg-maincolor hover:scale-[103%] transition duration-300 hover:drop-shadow-md shadow-lg text-white py-2 px-4 rounded-md hover:bg-secondcolor focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-maincolor"
        >
          {loading ? "Please wait.." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
