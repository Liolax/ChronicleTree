import { Link } from 'react-router-dom';

export default function NavBar() {
  return (
    <header className="bg-app-container shadow-md flex items-center justify-between px-6 py-4 sticky top-0 z-50">
      <Link to="/" className="text-2xl font-bold text-app-primary">
        ChronicleTree
      </Link>
      <nav className="hidden md:flex items-center space-x-6">
        <Link to="/" className="text-app-primary hover:text-link-hover">Tree</Link>
        <Link to="/profile/1" className="text-app-primary hover:text-link-hover">Profile</Link>
        <Link to="/settings" className="text-app-primary hover:text-link-hover">Settings</Link>
      </nav>
    </header>
  );
}
