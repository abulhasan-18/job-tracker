import Link from "next/link";

export default function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-content">
        <Link href="/" className="nav-logo">
          <div className="brand-mark">JT</div>
          <div className="nav-title">Job Tracker</div>
        </Link>

        <div className="nav-menu">
          <Link href="/" className="nav-link">
            Dashboard
          </Link>
          <Link href="/view-all" className="nav-link">
            View All
          </Link>
          <Link href="/create" className="nav-link nav-link--primary">
            + New Application
          </Link>
        </div>
      </div>
    </nav>
  );
}
