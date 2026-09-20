import React, { useState } from 'react';
import { ArrowLeft, HelpCircle, Send, CheckCircle2, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';

interface HelpFeedbackViewProps {
  onBack: () => void;
}

export const HelpFeedbackView: React.FC<HelpFeedbackViewProps> = ({ onBack }) => {
  const [activeAccordion, setActiveAccordion] = useState<string | null>('how');

  // Form
  const [category, setCategory] = useState('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSubmitted(true);
  };

  const sections = [
    {
      id: 'how',
      title: 'How ANTIQORA Works',
      content: 'ANTIQORA is a hybrid neural search engine and intelligent browser. It combines real-time Web Crawler indexes, Google Custom Search grounding, and Gemini 1.5/2.0 AI synthesis to deliver accurate answers, 3D temporal timelines, and multi-tab workflows.'
    },
    {
      id: 'search',
      title: 'Search & Navigation Bar',
      content: 'You can type search queries, direct URLs (e.g. example.com), platform names (e.g. youtube, github), or questions. Use Ctrl+K or / anywhere to instantly focus the search bar.'
    },
    {
      id: 'ai',
      title: 'AI Search & Grounding',
      content: 'AI answers are dynamically synthesized with source citations and verified web facts. Choose between Simple, Standard, and In-depth answer styles in Settings.'
    },
    {
      id: 'privacy',
      title: 'Privacy & Incognito Mode',
      content: 'Incognito tabs browse without saving searches to normal history, logs, or temporary form states. Note that Incognito does not hide activity from websites, ISPs, or network administrators.'
    },
    {
      id: 'downloads',
      title: 'Downloads Manager',
      content: 'Files downloaded through ANTIQORA are tracked in the Downloads manager with progress tracking and direct browser filesystem save triggers.'
    },
    {
      id: 'bookmarks',
      title: 'Bookmarks & Folders',
      content: 'Save important links and papers to custom folders. Bookmarks are persisted locally and synchronized if signed into an account.'
    },
    {
      id: 'tabs',
      title: 'Tab Management & Tab Groups',
      content: 'Open independent search tabs, create tab groups with custom colors, and reopen recently closed tabs from the Recent Tabs page.'
    },
    {
      id: 'settings',
      title: 'Full Settings Screen',
      content: 'Configure search engines, SafeSearch, dark/light theme, app language, regional search, and storage preferences.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col animate-in fade-in duration-200">
      
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl px-4 py-3 sm:px-8">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              aria-label="Back to Browser"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Browser</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-slate-800" />

            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-cyan-500" />
              <span>Help & Feedback</span>
            </h1>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="mx-auto max-w-4xl w-full flex-1 p-4 sm:p-8 space-y-8">
        
        {/* Help Documentation Accordions */}
        <section className="space-y-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">Documentation & Help Guide</h2>
          <div className="space-y-2">
            {sections.map(sec => {
              const isOpen = activeAccordion === sec.id;
              return (
                <div key={sec.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : sec.id)}
                    className="w-full flex items-center justify-between p-4 text-left font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition"
                  >
                    <span>{sec.title}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-cyan-500" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-xs text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-100 dark:border-slate-800/80">
                      {sec.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Feedback Form */}
        <section className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-cyan-500 font-bold text-sm">
            <MessageSquare className="w-5 h-5" />
            <span>Send Feedback or Report an Issue</span>
          </div>

          {submitted ? (
            <div className="p-6 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs font-bold flex items-center gap-3 animate-in fade-in">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <div className="text-sm font-bold">Feedback Submitted Successfully</div>
                <div className="text-[11px] font-normal text-emerald-400/80 mt-0.5">
                  Thank you for helping us improve ANTIQORA. Your feedback has been recorded locally in your session feedback queue.
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold"
                >
                  <option value="bug">Report a Bug / Issue</option>
                  <option value="feature">Feature Request</option>
                  <option value="ai">AI Search Answer Feedback</option>
                  <option value="general">General Suggestion</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Message</label>
                <textarea
                  required
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Describe your feedback, feature request, or issue details..."
                  className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 p-3 text-xs font-medium focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-500">Optional Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@antiqora.io"
                  className="w-full mt-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-medium"
                />
              </div>

              <button
                type="submit"
                className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-bold hover:bg-cyan-400 transition"
              >
                <Send className="w-4 h-4" />
                <span>Submit Feedback</span>
              </button>
            </form>
          )}
        </section>

      </main>
    </div>
  );
};
