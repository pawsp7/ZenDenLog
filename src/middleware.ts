export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/", "/schedule/:path*", "/open/:path*", "/hours/:path*"],
};
