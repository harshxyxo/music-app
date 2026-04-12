import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID || "mock-client-id",
      clientSecret: process.env.GOOGLE_SECRET || "mock-client-secret",
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET || "groovra-super-secret-key-12345",
});

export { handler as GET, handler as POST };
