import NextAuth from "next-auth";
import connectDb from "@/app/lib/db";
import User from "@/app/models/user.model";
import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";

const NextAuthFn = NextAuth as unknown as ((config: any) => any);

export const { handlers, signIn, signOut, auth } = NextAuthFn({
  providers: [
    Credentials({
      credentials: {
        email: {
          type: "email",
          label: "Email",
          placeholder: "johndoe@gmail.com",
        },
        password: {
          type: "password",
          label: "Password",
          placeholder: "*****",
        },
      },

      async authorize(credentials: any) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid email or password"); // ✅ FIXED
        }

        await connectDb();

        const user = await User.findOne({ email: credentials.email });

        if (!user) {
          throw new Error("Invalid email or password"); // ✅ FIXED
        }

        const isMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isMatch) {
          throw new Error("Invalid email or password"); // ✅ FIXED
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),

    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],

  callbacks: {
    async signIn({ user, account }: any) {
      try {
        console.log("SignIn callback triggered:", { user, account });

        if (account?.provider === "google") {
          console.log("Processing Google OAuth");
          await connectDb();

          let dbUser = await User.findOne({ email: user.email });
          console.log("Existing user found:", dbUser ? "yes" : "no");

          if (!dbUser) {
            console.log("Creating new user for Google OAuth");
            dbUser = await User.create({
              name: user.name,
              email: user.email,
              password: "oauth_user",
                  role: "admin" // 👈 ADD THIS LINE

            });
            console.log("New user created:", dbUser._id);
          }

          user.id = dbUser._id.toString();
          user.role = dbUser.role;
          console.log("User data set:", { id: user.id, role: user.role });
        }

        console.log("SignIn callback returning true");
        return true;
      } catch (error) {
        console.error("SignIn error:", error);
        return false;
      }
    },

    async jwt({ token, user }: any) {
      if (user) {
        token.name = user.name; // ✅ FIXED
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
      }

      return token;
    },

    async session({ session, token }: any) {
      if (session.user) {
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }

      return session;
    },
  },

  pages: {
    error: "/signin", // optional
  },

  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60,
  },

  secret: process.env.AUTH_SECRET,
});