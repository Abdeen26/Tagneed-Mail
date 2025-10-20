// components/ProtectedRoute.jsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ProtectedRoute({ children }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      // Redirect to the login page if not authenticated
      router.push("/");
      setTimeout(() => {
        alert("You Are Not Authorized To Do This Action.");
      }, 2000);
    }
  }, [status, router]);

  // Render loading state or nothing until session is checked
  if (status === "loading")
    return (
      <div className="w-full flex items-center justify-center h-full">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );

  // Only render children if the user is authenticated
  return session ? children : null;
}
