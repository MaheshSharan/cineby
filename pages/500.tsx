import Link from "next/link";
import type { NextPage } from "next";

const ServerErrorPage: NextPage = () => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-black leading-none text-primary">500</p>
      <h1 className="mt-4 text-2xl font-semibold uppercase tracking-[0.05em]">
        Something went wrong
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        An unexpected error occurred while loading this page. Please try again later.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-8 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/80"
      >
        Go back home
      </Link>
    </div>
  );
};

export default ServerErrorPage;
