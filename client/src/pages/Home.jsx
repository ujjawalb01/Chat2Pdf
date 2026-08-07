import { useState } from 'react';
import URLInput from '../components/URLInput';
import { getDownloadUrl, getPreviewUrl } from '../services/api';
import { FileText, Download, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';

export default function Home() {
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  const [resultData, setResultData] = useState(null);

  const handleProcessingStart = () => {
    setStatus('loading');
    setErrorMessage('');
  };

  const handleProcessingSuccess = (data) => {
    setStatus('success');
    setResultData(data);
  };

  const handleProcessingError = (errorMsg) => {
    setStatus('error');
    setErrorMessage(errorMsg);
  };

  const handleReset = () => {
    setStatus('idle');
    setResultData(null);
    setErrorMessage('');
  };

  const handlePreview = () => {
    if (resultData?.id) {
      window.open(getPreviewUrl(resultData.id), '_blank');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center pt-24 pb-16 px-4">
      {/* Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 mb-12">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-brand-900">
          Turn AI Conversations Into <br className="hidden md:block"/>
          Professional PDFs
        </h1>
        <p className="text-lg md:text-xl text-brand-600 max-w-2xl mx-auto leading-relaxed">
          Paste a shared conversation link from your favorite AI assistant and export the entire conversation as a clean, elegantly formatted document.
        </p>
        
        <div className="flex flex-wrap justify-center gap-3 mt-8">
          {['ChatGPT', 'Claude', 'Gemini', 'DeepSeek'].map((platform) => (
            <div key={platform} className="px-4 py-1.5 rounded-full surface-panel text-sm text-brand-700 font-medium">
              {platform}
            </div>
          ))}
        </div>
      </div>

      {status === 'idle' && (
        <URLInput 
          onProcessingStart={handleProcessingStart}
          onProcessingSuccess={handleProcessingSuccess}
          onProcessingError={handleProcessingError}
        />
      )}

      {status === 'loading' && (
        <div className="w-full max-w-2xl mx-auto mt-12 surface-panel p-12 rounded-2xl flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="relative mb-8">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-900 rounded-full animate-spin"></div>
          </div>
          <h3 className="text-xl font-semibold text-brand-900 mb-2">Generating Document...</h3>
          <p className="text-brand-500 max-w-sm">
            This takes a few seconds as we securely extract and format your conversation.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="w-full max-w-2xl mx-auto mt-12 surface-panel p-8 rounded-2xl border-l-4 border-l-red-500 text-center animate-in fade-in slide-in-from-bottom-4">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-6 h-6" /> 
          </div>
          <h3 className="text-xl font-semibold text-brand-900 mb-3">Extraction Failed</h3>
          <p className="text-brand-600 mb-8 max-w-md mx-auto">{errorMessage}</p>
          <button 
            onClick={handleReset}
            className="flex items-center justify-center gap-2 mx-auto px-6 py-2.5 surface-panel hover:bg-brand-50 text-brand-900 rounded-lg transition-colors font-medium shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      )}

      {status === 'success' && resultData && (
        <div className="w-full max-w-2xl mx-auto mt-12 surface-panel p-8 rounded-2xl border-t-4 border-t-green-500 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold text-brand-900 mb-1">PDF Generated Successfully</h3>
            <p className="text-brand-500 text-sm">
              Your document is ready to download or preview.
            </p>
          </div>

          <div className="bg-brand-50 rounded-xl p-5 mb-8 flex flex-col md:flex-row items-center justify-between border border-brand-200">
            <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-auto">
              <div className="w-12 h-12 rounded-lg bg-white border border-brand-200 flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-brand-700" />
              </div>
              <div className="text-left overflow-hidden">
                <h4 className="font-semibold text-brand-900 max-w-[200px] sm:max-w-[300px] truncate" title={resultData.title}>
                  {resultData.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-brand-500 mt-1 font-medium">
                  <span className="bg-brand-200 text-brand-800 px-2 py-0.5 rounded uppercase tracking-wider">{resultData.platform}</span>
                  <span>•</span>
                  <span>{resultData.messageCount} messages</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
              <button
                onClick={handlePreview}
                title="Preview PDF"
                className="flex-1 md:flex-none px-5 py-2.5 bg-white border border-brand-200 hover:bg-brand-50 hover:-translate-y-0.5 hover:shadow-md text-brand-900 rounded-lg text-sm font-medium transition-all cursor-pointer shadow-sm"
              >
                Preview
              </button>
              <a
                href={getDownloadUrl(resultData.id, resultData.title)}
                download
                title="Download PDF"
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-900 hover:bg-black hover:-translate-y-0.5 hover:shadow-md text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
            </div>
          </div>

          <div className="flex justify-center">
            <button 
              onClick={handleReset}
              className="text-brand-500 hover:text-brand-900 text-sm font-medium transition-colors"
            >
              Generate Another PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
