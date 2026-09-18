import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      githubId: string;
      login: string;
      image?: string | null;
      name?: string | null;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    login?: string;
  }
}
