import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon, BookOpenIcon, UserGroupIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-700 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:60px_60px]"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-primary-600/50 to-primary-700/50"></div>
        <div className="container mx-auto px-4 text-center relative">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight opacity-0 animate-[fadeIn_0.8s_ease-out_forwards]">
              Welcome to Library Management System
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-primary-100 max-w-2xl mx-auto opacity-0 animate-[fadeIn_0.8s_ease-out_0.2s_forwards]">
              A modern solution for managing your library with ease and efficiency
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center opacity-0 animate-[fadeIn_0.8s_ease-out_0.4s_forwards]">
              <Link 
                href="/auth" 
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-lg text-primary-600 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                aria-label="Get started with Library Management System"
              >
                Get Started
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
              <button 
                className="inline-flex items-center px-8 py-4 border-2 border-white text-lg font-medium rounded-lg text-white bg-white/10 cursor-not-allowed opacity-75"
                disabled
                aria-label="Learn more about our features (Coming Soon)"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-900">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300 p-6 rounded-2xl hover:bg-gray-50">
              <div className="bg-primary-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-300">
                <BookOpenIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Fast Performance</h3>
              <p className="text-gray-600 leading-relaxed">Optimized for speed and efficiency with modern technology stack</p>
            </div>

            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300 p-6 rounded-2xl hover:bg-gray-50">
              <div className="bg-primary-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-300">
                <UserGroupIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">User Friendly</h3>
              <p className="text-gray-600 leading-relaxed">Intuitive and easy-to-use design for seamless experience</p>
            </div>

            <div className="text-center group hover:transform hover:-translate-y-2 transition-all duration-300 p-6 rounded-2xl hover:bg-gray-50">
              <div className="bg-primary-100 rounded-2xl w-20 h-20 flex items-center justify-center mx-auto mb-6 group-hover:bg-primary-200 transition-colors duration-300">
                <GlobeAltIcon className="w-10 h-10 text-primary-600" />
              </div>
              <h3 className="text-2xl font-semibold mb-4 text-gray-900">Global Access</h3>
              <p className="text-gray-600 leading-relaxed">Access your library from anywhere, anytime with cloud sync</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">1000+</div>
              <div className="text-gray-600">Books Available</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">24/7</div>
              <div className="text-gray-600">Support Available</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-auto">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-xl font-semibold mb-4">Library Management</h4>
              <p className="text-gray-400">Modern solution for managing your library efficiently</p>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link 
                    href="/about" 
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
                    aria-label="Learn more about us"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/contact" 
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
                    aria-label="Contact us"
                  >
                    Contact
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/privacy" 
                    className="text-gray-400 hover:text-white transition-colors inline-flex items-center"
                    aria-label="Read our privacy policy"
                  >
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xl font-semibold mb-4">Contact Us</h4>
              <p className="text-gray-400">Email: daniel1diaz@gmail.com</p>
              <p className="text-gray-400">Phone: +11111</p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Library Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
