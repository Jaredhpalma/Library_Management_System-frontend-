"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppProvider";

const Navbar = () => {
  const { logout, authToken, user, isLoading } = useAppContext();
  const router = useRouter();

  if (isLoading) {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
        <div className="container">
          <span className="navbar-brand">Loading...</span>
        </div>
      </nav>
    );
  }

  const handleDashboardClick = (e: React.MouseEvent) => {
    if (!authToken) {
      e.preventDefault();
      router.push('/auth');
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link href="/" className="navbar-brand">MyNextApp</Link>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto">
            {authToken ? (
              <>
                {user?.role === 'admin' && (
                  <li className="nav-item">
                    <Link href="/admin/dashboard" className="nav-link">
                      Admin
                    </Link>
                  </li>
                )}
                <li className="nav-item">
                  <Link 
                    href="/dashboard" 
                    className="nav-link"
                    onClick={handleDashboardClick}
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="nav-item">
                  <button 
                    onClick={logout} 
                    className="btn btn-danger ms-2"
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link href="/auth" className="nav-link">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;