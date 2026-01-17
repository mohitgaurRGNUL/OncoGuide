import React, { useState, useRef } from 'react';
import { ScanResult } from '../types';
import { scanMedicalReport } from '../services/geminiService';

interface SmartScanProps {
  onScanComplete: (data: ScanResult) => void;
}

export const SmartScan: React.FC<SmartScanProps> = ({ onScanComplete }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (!file) return;

    if (!process.env.API_KEY) {
      alert("API Key is missing. Please set REACT_APP_API_KEY or process.env.API_KEY.");
      return;
    }

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      // Strip data:image... prefix
      const base64String = reader.result?.toString().replace(/^data:image\/\w+;base64,/, '');
      if (base64String) {
        try {
          const data = await scanMedicalReport(base64String);
          onScanComplete(data);
        } catch (error) {
          alert("Could not analyze image. Ensure your API Key is valid and the photo is clear.");
        } finally {
          setIsScanning(false);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const onDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div 
      className={`relative rounded-2xl border-2 border-dashed transition-all duration-300 overflow-hidden group
        ${dragActive ? 'border-teal-400 bg-teal-50' : 'border-slate-300 hover:border-teal-300 bg-white/50'}
      `}
      onDragEnter={onDrag} 
      onDragLeave={onDrag} 
      onDragOver={onDrag} 
      onDrop={onDrop}
    >
      <input 
        ref={inputRef}
        type="file" 
        className="hidden" 
        accept="image/*"
        onChange={(e) => e.target.files && handleFile(e.target.files[0])}
      />

      <div className="p-8 flex flex-col items-center justify-center text-center cursor-pointer" onClick={() => inputRef.current?.click()}>
        {isScanning ? (
          <div className="flex flex-col items-center animate-pulse">
            <div className="w-12 h-12 rounded-full border-4 border-teal-500 border-t-transparent animate-spin mb-4"></div>
            <p className="text-teal-700 font-semibold">Gemini 3 is analyzing...</p>
            <p className="text-xs text-teal-500">Extracting histology & markers</p>
          </div>
        ) : (
          <>
            <div className={`w-12 h-12 mb-3 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 transition-transform duration-300 ${dragActive ? 'scale-110' : 'group-hover:scale-110'}`}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-700">Smart Scan Report</h3>
            <p className="text-sm text-slate-500 mt-1">Drop a photo of your pathology report here</p>
            <p className="text-xs text-teal-600 font-medium mt-2">Powered by Gemini 3 Flash</p>
          </>
        )}
      </div>
      
      <div className="absolute top-0 left-0 -z-10 w-full h-full bg-gradient-to-br from-teal-50/50 to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
    </div>
  );
};