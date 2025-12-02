import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import dbConnect from "@/lib/db";
import User from "@/lib/models/User";
import bcrypt from "bcryptjs";

const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          console.log("🔐 Attempting login for user:", credentials.username);

          if (!credentials?.username || !credentials?.password) {
            console.log("❌ Missing credentials");
            throw new Error("Username and password are required");
          }

          await dbConnect();
          console.log("✅ Database connected");

          // Find user by username (case-insensitive since your model has lowercase: true)
          const user = await User.findOne({
            username: credentials.username.toLowerCase(),
          }).lean();

          if (!user) {
            console.log("❌ User not found:", credentials.username);
            throw new Error("Invalid username or password");
          }

          console.log(
            "👤 User found:",
            user.username,
            "Active:",
            user.isActive
          );

          // Check if user is active
          if (user.isActive === false) {
            console.log("❌ User is inactive:", user.username);
            throw new Error(
              "Account is inactive. Please contact administrator."
            );
          }

          // Check password
          console.log("🔑 Verifying password...");
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log("❌ Invalid password for user:", user.username);
            throw new Error("Invalid username or password");
          }

          console.log("✅ Login successful for user:", user.username);

          // Return user object without password
          return {
            id: user._id.toString(),
            name: user.name,
            username: user.username,
            role: user.role,
            department: user.department,
            isActive: user.isActive,
          };
        } catch (error) {
          console.error("❌ Authorization error:", error.message);
          throw error;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.role = user.role;
        token.department = user.department;
        token.isActive = user.isActive;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.username = token.username;
        session.user.role = token.role;
        session.user.department = token.department;
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours default
  },
  debug: process.env.NODE_ENV === "development",
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
