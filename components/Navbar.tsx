"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAppContext } from "@/context/AppProvider";
import { useState, useCallback } from "react";

const Navbar = () => {
  const { logout, authToken, user, isLoading } = useAppContext();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = useCallback(async () => {
    try {
      await logout();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout]);

  const handleDashboardClick = useCallback((e: React.MouseEvent) => {
    if (!authToken) {
      e.preventDefault();
      router.push('/auth');
    }
  }, [authToken, router]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  if (isLoading) {
    return (
      <nav className="bg-primary-600 text-white shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
           
            <div className="animate-pulse h-4 w-24 bg-primary-500 rounded"></div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-primary-600 text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link 
            href="/" 
            className="text-xl font-bold hover:text-primary-200 transition-colors"
            aria-label="Home"
          >
            Library System
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {authToken ? (
              <>
                {user?.role === 'admin' && (
                  <Link 
                    href="/dashboard" 
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                    onClick={handleDashboardClick}
                    aria-label="Dashboard"
                  >
                    Dashboard
                  </Link>
                )}
                <button 
                  onClick={handleLogout} 
                  className="ml-4 px-4 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-colors"
                  aria-label="Logout"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link 
                href="/auth" 
                className="px-3 py-2 rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
                aria-label="Login"
              >
                Login
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-md hover:bg-primary-700 transition-colors"
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              <svg 
                className="h-6 w-6" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
                aria-hidden="true"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div 
            className="md:hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="mobile-menu-button"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {authToken ? (
                <>
                  {user?.role === 'admin' && (
                    <Link 
                      href="/dashboard" 
                      className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors"
                      onClick={() => setIsMobileMenuOpen(false)}
                      role="menuitem"
                      aria-label="Dashboard"
                    >
                      Dashboard
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 hover:bg-red-700 transition-colors"
                    role="menuitem"
                    aria-label="Logout"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link 
                  href="/auth" 
                  className="block px-3 py-2 rounded-md text-base font-medium hover:bg-primary-700 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                  role="menuitem"
                  aria-label="Login"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;