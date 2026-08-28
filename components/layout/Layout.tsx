import type { ReactNode } from "react";
import { useRouter } from "next/router";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

interface LayoutProps {
  children: ReactNode;
}

const FULL_BLEED_ROUTES = [
  "/movie/[...params]",
  "/tv/[...params]",
  "/profiles",
  "/login",
  "/register",
];

export function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const isFullBleed =
    FULL_BLEED_ROUTES.includes(router.pathname) || router.pathname.startsWith("/profiles");

  if (isFullBleed) {
    return <main className="flex-1">{children}</main>;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}