"use client";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-content">
        <h1>My Site</h1>
        <ul>
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          <li><a href="/academy">Academy</a></li>
        </ul>
      </div>
    </nav>
  );
}
