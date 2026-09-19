import React, { useState, useRef } from 'react';
import { Camera, Upload, X, Sparkles, Image as ImageIcon, Eye, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { analyzeImage } from '../services/api';

interface VisualSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchWithVisual: (description: string) => void;
}

export const VisualSearchModal: React.FC<VisualSearchModalProps> = ({
  isOpen,
  onClose,
  onSearchWithVisual
}) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('Explain this image, identify key objects, and extract any visible text.');
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    description: string;
    detectedObjects: string[];
    extractedText: string;
    diagramExplanation?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedImage) return;
    setLoading(true);
    try {
      const result = await analyzeImage(selectedImage, prompt);
      setAnalysisResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSample = (sampleUrl: string) => {
    setSelectedImage(sampleUrl);
    setAnalysisResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ANTIQORA Visual Search & Vision Engine</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
            selectedImage 
              ? 'border-cyan-500/50 bg-cyan-500/5' 
              : 'border-slate-300 dark:border-slate-800 hover:border-cyan-500/50 bg-slate-50 dark:bg-slate-950/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {selectedImage ? (
            <div className="space-y-3">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="max-h-56 mx-auto rounded-xl object-contain border border-slate-200 dark:border-slate-800 shadow-sm"
              />
              <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                Click or drop another visual to replace
              </p>
            </div>
          ) : (
            <div className="space-y-3 py-4">
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                  Drag and drop an image or click to browse
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports technical schematics, historical photographs, charts, diagrams, and text OCR
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sample Images Quick Pick */}
        {!selectedImage && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Or test with a sample visual:</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleSelectSample("https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=600&q=80")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs hover:border-cyan-500 transition"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">Quantum Processor</span>
                <span className="text-[10px] text-slate-500">Hardware diagram</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample("https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs hover:border-cyan-500 transition"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">Solar Microgrid</span>
                <span className="text-[10px] text-slate-500">Energy topology</span>
              </button>
              <button
                type="button"
                onClick={() => handleSelectSample("https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80")}
                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left text-xs hover:border-cyan-500 transition"
              >
                <span className="font-semibold text-slate-800 dark:text-slate-200 block truncate">Cyber Cityscape</span>
                <span className="text-[10px] text-slate-500">Urban architecture</span>
              </button>
            </div>
          </div>
        )}

        {/* Vision Analysis Action */}
        {selectedImage && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like ANTIQORA to analyze in this image?"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-slate-950 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition whitespace-nowrap shadow-md shadow-cyan-500/20"
              >
                {loading ? 'Analyzing...' : 'Analyze Visual'}
              </button>
            </div>

            {/* Analysis Output */}
            {analysisResult && (
              <div className="rounded-2xl bg-slate-50 dark:bg-slate-950/60 p-4 border border-cyan-500/20 space-y-3 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-bold text-cyan-600 dark:text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Visual Analysis Insights</span>
                  </span>
                  <button
                    onClick={() => {
                      onSearchWithVisual(analysisResult.description.slice(0, 40));
                      onClose();
                    }}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-semibold"
                  >
                    Search full platform for this topic →
                  </button>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {analysisResult.description}
                </p>

                {analysisResult.detectedObjects && analysisResult.detectedObjects.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Detected Components:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.detectedObjects.map((obj, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 text-[10px] font-medium border border-cyan-500/20">
                          {obj}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {analysisResult.extractedText && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Extracted Text / OCR:</span>
                    <p className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-800 dark:text-slate-300">
                      {analysisResult.extractedText}
                    </p>
                  </div>
                )}

                {analysisResult.diagramExplanation && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">Diagram & Architecture Breakdown:</span>
                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                      {analysisResult.diagramExplanation}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
