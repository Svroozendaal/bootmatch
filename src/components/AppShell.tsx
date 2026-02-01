import Head from "next/head";
import Link from "next/link";
import { ReactNode } from "react";
import Logo from "./Logo";

type AppShellProps = {
  children: ReactNode;
  title?: string;
};

export default function AppShell({ children, title }: AppShellProps) {
  const fullTitle = title ? `${title} | BootMatch` : "BootMatch";

  return (
    <div className="app-shell">
      <Head>
        <title>{fullTitle}</title>
        <meta
          name="description"
          content="Find your perfect ski boot replacement."
        />
      </Head>
      <header className="app-nav">
        <Link href="/" className="logo-link" aria-label="BootMatch home">
          <Logo />
        </Link>
        <nav className="nav-links">
          <Link href="/admin" className="nav-link">
            Admin
          </Link>
        </nav>
      </header>
      <main className="app-main">{children}</main>
    </div>
  );
}
