import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth } = NextAuth({
  // The app runs behind Vercel's proxy, so the public host must be trusted
  // when Auth.js validates the OAuth callback URL.
  trustHost: true,
  providers: [GitHub],
  callbacks: {
    jwt({ token, profile }) {
      if (profile && "login" in profile) token.login = String(profile.login);
      return token;
    },
    session({ session, token }) {
      if (token.sub && typeof token.login === "string" && token.login) {
        session.user.githubId = token.sub;
        session.user.login = String(token.login);
      }
      return session;
    },
  },
});
