import { FileDown, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const links = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
  ];

  return (
    <nav className="border-b border-brand-200 bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-brand-900 flex items-center justify-center shadow-sm">
                <FileDown className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight text-brand-900">Chat2PDF</span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-8">
              {links.map((link) => (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`${
                    location.pathname === link.path
                      ? 'text-brand-900 font-medium'
                      : 'text-brand-500 hover:text-brand-900'
                  } transition-colors px-3 py-2 rounded-md text-sm`}
                >
                  {link.name}
                </Link>
              ))}
              <a
                href="https://github.com/ujjawalb01"
                target="_blank"
                rel="noreferrer"
                className="text-brand-500 hover:text-brand-900 transition-colors px-3 py-2 text-sm"
              >
                GitHub
              </a>
              <Link
                to="/"
                className="bg-brand-900 hover:bg-black text-white px-4 py-2 rounded-md text-sm font-medium transition-all shadow-sm"
              >
                Generate PDF
              </Link>
            </div>
          </div>
          
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-brand-500 hover:text-brand-900 focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-200 shadow-sm">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {links.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="text-brand-600 hover:text-brand-900 hover:bg-brand-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <a
              href="https://github.com/ujjawalb01"
              target="_blank"
              rel="noreferrer"
              className="text-brand-600 hover:text-brand-900 hover:bg-brand-50 block px-3 py-2 rounded-md text-base font-medium transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      )}
    </nav>
  );
}
