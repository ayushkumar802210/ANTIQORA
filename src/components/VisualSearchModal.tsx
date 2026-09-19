import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Sparkles, Image as ImageIcon, Eye, FileText, CheckCircle2, AlertCircle, RefreshCw, SwitchCamera, VideoOff } from 'lucide-react';
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
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<{
    description: string;
    detectedObjects: string[];
    extractedText: string;
    diagramExplanation?: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraFileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Stop camera stream when component unmounts or modal closes
  const stopCameraStream = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCameraStream();
      setSelectedImage(null);
      setAnalysisResult(null);
      setCameraError(null);
    }
    return () => {
      stopCameraStream();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const startCamera = async (facing: 'user' | 'environment' = facingMode) => {
    stopCameraStream();
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error("Camera access error:", err);
      const errName = err?.name || '';
      const errMsg = (err?.message || '').toLowerCase();
      if (errName === 'NotAllowedError' || errMsg.includes('dismiss') || errMsg.includes('denied') || errMsg.includes('not allowed')) {
        setCameraError("Camera permission was dismissed or blocked. You can still snap a photo directly using your phone/device camera app below!");
      } else {
        setCameraError(err?.message || "Unable to access live camera stream. You can snap a photo using the device camera button below.");
      }
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      startCamera(nextFacing);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // If front camera, flip horizontally for mirror effect if needed or draw as is
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setSelectedImage(dataUrl);
        setAnalysisResult(null);
        stopCameraStream();
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
        stopCameraStream();
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
        stopCameraStream();
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
    stopCameraStream();
    setSelectedImage(sampleUrl);
    setAnalysisResult(null);
  };

  const handleCloseModal = () => {
    stopCameraStream();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-fadeIn">
      {/* Hidden canvas for taking photo snapshots */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl space-y-6 text-left max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">ANTIQORA Camera & Vision Search</h3>
          </div>
          <button 
            onClick={handleCloseModal} 
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition p-1"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Camera Viewfinder or Upload/Preview Area */}
        {isCameraActive ? (
          <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-cyan-500/50 shadow-lg">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={`w-full max-h-80 object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
            />

            {/* Camera Overlay Controls */}
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-slate-950/90 via-slate-950/50 to-transparent flex items-center justify-between">
              <button
                type="button"
                onClick={toggleCameraFacing}
                className="p-2.5 rounded-full bg-slate-800/80 text-slate-200 hover:bg-slate-700 transition"
                title="Switch Camera (Front/Rear)"
              >
                <SwitchCamera className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                className="px-6 py-2.5 rounded-full bg-gradient-to-r from-cyan-400 to-indigo-500 text-slate-950 font-bold text-sm shadow-lg hover:brightness-110 active:scale-95 transition flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                <span>Capture Photo</span>
              </button>

              <button
                type="button"
                onClick={stopCameraStream}
                className="p-2.5 rounded-full bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 transition"
                title="Stop Camera"
              >
                <VideoOff className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Actions Grid: Live Stream Camera vs System Camera vs Gallery Upload */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => startCamera()}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-indigo-500/10 to-purple-500/10 border border-cyan-500/40 hover:border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold text-xs transition shadow-xs"
              >
                <Camera className="w-4 h-4 text-cyan-500" />
                <span>Live Video Stream</span>
              </button>

              <button
                type="button"
                onClick={() => cameraFileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/40 hover:border-indigo-500 text-indigo-600 dark:text-indigo-400 font-bold text-xs transition shadow-xs"
              >
                <Camera className="w-4 h-4 text-indigo-500" />
                <span>Snap System Photo</span>
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 hover:border-cyan-500/50 text-slate-700 dark:text-slate-300 font-semibold text-xs transition shadow-xs"
              >
                <Upload className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Upload / Gallery</span>
              </button>
            </div>

            {/* Hidden Input 1: System Camera Capture */}
            <input
              type="file"
              ref={cameraFileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              capture="environment"
              className="hidden"
            />

            {/* Hidden Input 2: General File/Gallery Picker */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {cameraError && (
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span className="font-medium">{cameraError}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-rose-500/20">
                  <button
                    type="button"
                    onClick={() => cameraFileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-700 dark:text-rose-300 font-semibold text-xs transition"
                  >
                    Take Photo with Device Camera
                  </button>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition"
                  >
                    Select Existing Photo
                  </button>
                </div>
              </div>
            )}

            {/* Drop Zone & Image Preview Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !selectedImage && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                selectedImage 
                  ? 'border-cyan-500/50 bg-cyan-500/5' 
                  : 'border-slate-300 dark:border-slate-800 hover:border-cyan-500/50 bg-slate-50 dark:bg-slate-950/50'
              }`}
            >
              {selectedImage ? (
                <div className="space-y-3">
                  <img
                    src={selectedImage}
                    alt="Captured photo preview"
                    className="max-h-56 mx-auto rounded-xl object-contain border border-slate-200 dark:border-slate-800 shadow-sm"
                  />
                  <div className="flex items-center justify-center gap-3">
                    <p className="text-xs text-cyan-600 dark:text-cyan-400 font-semibold">
                      Photo Ready for Vision Analysis
                    </p>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedImage(null);
                        setAnalysisResult(null);
                        startCamera();
                      }}
                      className="text-xs underline text-indigo-400 hover:text-indigo-300"
                    >
                      Retake Photo
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 py-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Or drag and drop an image file here to analyze
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Sample Images Quick Pick */}
        {!selectedImage && !isCameraActive && (
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
                placeholder="What would you like ANTIQORA to analyze in this photo?"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleAnalyze}
                disabled={loading}
                className="rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 px-4 py-2 text-xs font-semibold text-slate-950 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 transition whitespace-nowrap shadow-md shadow-cyan-500/20"
              >
                {loading ? 'Analyzing...' : 'Analyze Photo'}
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
                      handleCloseModal();
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

