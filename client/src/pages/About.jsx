import { FileDown, ShieldCheck, Zap, Globe } from 'lucide-react';

export default function About() {
  const features = [
    {
      icon: <Globe className="w-6 h-6 text-brand-900" />,
      title: 'Universal Support',
      description: 'Works with public share links from ChatGPT, Claude, Gemini, and DeepSeek.'
    },
    {
      icon: <Zap className="w-6 h-6 text-brand-900" />,
      title: 'Fast Generation',
      description: 'Extracts messages, renders markdown, and generates your PDF in seconds.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-brand-900" />,
      title: 'Privacy First',
      description: 'We do not permanently store your conversations. Generated PDFs are deleted automatically.'
    }
  ];

  return (
    <div className="pt-24 pb-16 px-4 max-w-4xl mx-auto">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-brand-900 mb-4">About Chat2PDF</h1>
        <p className="text-brand-500 text-lg max-w-2xl mx-auto leading-relaxed">
          The easiest way to export and preserve your AI conversations offline in a professional format.
        </p>
      </div>

      <div className="surface-panel p-8 md:p-12 rounded-2xl mb-12 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-brand-900">
          <div className="w-10 h-10 rounded bg-brand-100 flex items-center justify-center">
            <FileDown className="w-5 h-5 text-brand-900" />
          </div>
          How It Works
        </h2>
        <div className="space-y-4 text-brand-600 leading-relaxed">
          <p>
            Chat2PDF is a clean, open-source tool designed to help developers, researchers, and writers save valuable AI interactions. 
            Instead of dealing with messy screenshots or copy-pasting raw text, you can instantly convert any public AI conversation into a beautifully formatted document.
          </p>
          <p>
            Our secure extraction engine visits the public share link you provide, parses the conversation structure, identifies user and assistant messages, and perfectly renders any markdown, tables, or code blocks.
          </p>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 p-5 rounded-xl mt-6 text-sm">
            <strong className="block mb-1 font-semibold text-amber-900">Important Limitation:</strong> 
            We can only access conversations that are shared publicly. Private conversations requiring account login cannot be accessed for security and privacy reasons.
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {features.map((feature, idx) => (
          <div key={idx} className="surface-panel p-6 rounded-xl text-center md:text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-5 mx-auto md:mx-0">
              {feature.icon}
            </div>
            <h3 className="text-lg font-bold text-brand-900 mb-2">{feature.title}</h3>
            <p className="text-brand-500 text-sm leading-relaxed">{feature.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
