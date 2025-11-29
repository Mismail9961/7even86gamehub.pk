import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials");
        }

        await connectDB();
        const user = await User.findOne({ email: credentials.email });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isCorrectPassword = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isCorrectPassword) {
          throw new Error("Invalid credentials");
        }

        return {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.imageUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        await connectDB();
        
        let existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          // Create new user for Google sign-in
          const { nanoid } = await import("nanoid");
          existingUser = await User.create({
            _id: nanoid(),
            email: user.email,
            name: user.name || profile?.name,
            imageUrl: user.image || "",
            googleId: account.providerAccountId,
            provider: "google",
            emailVerified: true,
          });
        }
        
        // Update user object with role from database
        user.role = existingUser.role;
        user.id = existingUser._id;
      }
      return true;
    },
    async jwt({ token, user, trigger, session }) {
      // Initial sign in
      if (user) {
        token.role = user.role || "customer";
        token.id = user.id;
      }
      
      // If session update is triggered, fetch fresh user data
      if (trigger === "update") {
        await connectDB();
        const dbUser = await User.findOne({ email: token.email });
        if (dbUser) {
          token.role = dbUser.role;
          token.name = dbUser.name;
          token.picture = dbUser.imageUrl;
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        // Fetch fresh user data from database to ensure role is always up to date
        try {
          await connectDB();
          const dbUser = await User.findOne({ email: token.email });
          
          if (dbUser) {
            session.user.id = dbUser._id;
            session.user.role = dbUser.role;
            session.user.name = dbUser.name;
            session.user.image = dbUser.imageUrl;
          } else {
            // Fallback to token data if user not found
            session.user.role = token.role || "customer";
            session.user.id = token.id;
          }
        } catch (error) {
          console.error("Session callback error:", error);
          session.user.role = token.role || "customer";
          session.user.id = token.id;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
