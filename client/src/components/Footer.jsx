import { FileDown } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-brand-200 py-12 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex flex-col items-center md:items-start mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded bg-brand-900 flex items-center justify-center">
                <FileDown className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-lg text-brand-900">Chat2PDF</span>
            </div>
            <p className="text-brand-500 text-sm">
              Convert AI conversations into beautiful PDFs.
            </p>
          </div>
          
          <div className="flex space-x-6 text-sm text-brand-500 font-medium">
            <Link to="/about" className="hover:text-brand-900 transition-colors">
              About
            </Link>
            <a href="#" className="hover:text-brand-900 transition-colors">
              Privacy
            </a>
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-brand-900 transition-colors">
              GitHub
            </a>
          </div>
        </div>
        <div className="mt-8 text-center text-xs text-brand-400 border-t border-brand-200 pt-8">
          <p>Built with React & Node.js</p>
        </div>
      </div>
    </footer>
  );
}
