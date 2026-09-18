import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";

export const { handlers, auth } = NextAuth({
  providers: [GitHub],
  callbacks: {
    jwt({ token, profile }) {
      if (profile && "login" in profile) token.login = String(profile.login);
      return token;
    },
    session({ session, token }) {
      if (token.sub && token.login) {
        session.user.githubId = token.sub;
        session.user.login = token.login;
      }
      return session;
    },
  },
});
