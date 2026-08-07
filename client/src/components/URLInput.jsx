import { useState } from 'react';
import { Link2, FileDown, AlertCircle } from 'lucide-react';
import { generatePDF } from '../services/api';

export default function URLInput({ onProcessingStart, onProcessingSuccess, onProcessingError }) {
  const [url, setUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');
  const [detectedPlatform, setDetectedPlatform] = useState('');

  const handleUrlChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    setLocalError('');
    
    // Simple frontend detection for UI feedback
    if (val.includes('chatgpt.com') || val.includes('chat.openai.com')) {
      setDetectedPlatform('ChatGPT');
    } else if (val.includes('claude.ai')) {
      setDetectedPlatform('Claude');
    } else if (val.includes('gemini.google.com')) {
      setDetectedPlatform('Gemini');
    } else if (val.includes('chat.deepseek.com')) {
      setDetectedPlatform('DeepSeek');
    } else {
      setDetectedPlatform('');
    }
  };

  const validateUrl = (urlToTest) => {
    try {
      const parsed = new URL(urlToTest);
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return 'Please enter a valid HTTP or HTTPS URL.';
      }
      return null;
    } catch {
      return 'Please enter a valid URL.';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setLocalError('Please enter a conversation link.');
      return;
    }

    const validationError = validateUrl(url);
    if (validationError) {
      setLocalError(validationError);
      return;
    }

    setIsSubmitting(true);
    onProcessingStart();

    try {
      const data = await generatePDF(url);
      if (data.success) {
        onProcessingSuccess(data.data);
      }
    } catch (err) {
      onProcessingError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto mt-12 px-4">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex flex-col sm:flex-row items-center surface-panel rounded-xl p-2 gap-3 transition-shadow duration-300 focus-within:ring-2 focus-within:ring-brand-900 focus-within:border-brand-900">
          <div className="relative flex-grow w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-brand-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-12 pr-4 py-4 bg-transparent border-0 text-brand-900 placeholder-brand-400 focus:ring-0 focus:outline-none sm:text-lg"
              placeholder="Paste a public link to your AI conversation..."
              value={url}
              onChange={handleUrlChange}
              disabled={isSubmitting}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            title="Generate PDF"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-900 hover:bg-black hover:-translate-y-0.5 hover:shadow-md text-white font-medium px-8 py-4 rounded-lg transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed shadow-sm"
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <FileDown className="w-5 h-5" />
            )}
            <span>Generate PDF</span>
          </button>
        </div>
      </form>
      
      <div className="mt-4 h-8 flex items-center justify-between px-2">
        {localError ? (
          <div className="flex items-center text-red-600 text-sm animate-in fade-in slide-in-from-top-2">
            <AlertCircle className="w-4 h-4 mr-2" />
            {localError}
          </div>
        ) : detectedPlatform ? (
          <div className="flex items-center text-brand-600 text-sm animate-in fade-in slide-in-from-bottom-2">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.4)]"></span>
            Recognized platform: <span className="font-semibold ml-1">{detectedPlatform}</span>
          </div>
        ) : (
          <div className="text-brand-500 text-sm">
            Make sure the conversation is shared publicly before pasting.
          </div>
        )}
      </div>
    </div>
  );
}
