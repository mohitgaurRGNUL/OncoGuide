import React, { useState } from 'react';
import { RiskGroup, TreatmentPlan } from '../types';
import { explainRiskAssessment } from '../services/geminiService';

interface ResultsCardProps {
  stage: string;
  risk: RiskGroup;
  mol: string;
  treatment: TreatmentPlan;
}

export const ResultsCard: React.FC<ResultsCardProps> = ({ stage, risk, mol, treatment }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleExplain = async () => {
    if (explanation) {
      speak(explanation);
      return;
    }
    if (!process.env.API_KEY) {
      alert("Please set the API_KEY to use AI features.");
      return;
    }

    setLoading(true);
    const text = await explainRiskAssessment(stage, risk, treatment.surgery.concat(treatment.adjuvant));
    setExplanation(text);
    setLoading(false);
    speak(text);
  };

  const speak = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const riskColors: Record<string, string> = {
    [RiskGroup.LOW]: 'text-emerald-500 bg-emerald-500',
    [RiskGroup.INTERMEDIATE]: 'text-yellow-500 bg-yellow-400',
    [RiskGroup.HIGH_INTERMEDIATE]: 'text-orange-500 bg-orange-500',
    [RiskGroup.HIGH]: 'text-red-600 bg-red-600',
    [RiskGroup.UNCERTAIN]: 'text-slate-500 bg-slate-500',
    [RiskGroup.ADVANCED_METASTATIC]: 'text-red-700 bg-red-700',
  };

  const currentRiskColor = riskColors[risk] || riskColors[RiskGroup.UNCERTAIN];
  const [textColor, bgColor] = currentRiskColor.split(' ');

  return (
    <div className="glass-panel rounded-3xl p-1 shadow-2xl overflow-hidden relative">
      <div className="bg-slate-900/90 p-6 rounded-t-[20px] text-white relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold tracking-tight">Assessment</h2>
          <div className="flex items-center space-x-2 text-sm text-slate-300 mt-1">
             <span className="opacity-75">FIGO 2023 Guidelines</span>
          </div>
        </div>
        <div className="absolute right-0 top-0 h-full w-48 bg-gradient-to-l from-teal-500/30 to-transparent pointer-events-none"></div>
      </div>

      <div className="p-6 space-y-6 bg-white/40">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-white/60 rounded-xl border border-white/50">
             <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Stage</p>
             <p className="text-2xl font-bold text-slate-800">{stage}</p>
          </div>
          <div className="p-3 bg-white/60 rounded-xl border border-white/50">
             <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold">Molecular</p>
             <p className="text-sm font-bold text-slate-800 mt-1">{mol}</p>
          </div>
        </div>

        <div className="space-y-2">
            <div className="flex justify-between items-end">
                <span className="text-sm font-semibold text-slate-600">Risk Profile</span>
                <span className={`text-sm font-bold ${textColor}`}>{risk}</span>
            </div>
            <div className="h-3 w-full bg-slate-200/50 rounded-full overflow-hidden flex shadow-inner">
                 <div className={`h-full transition-all duration-1000 ease-out ${bgColor}`} style={{ width: '100%' }}></div>
            </div>
        </div>

        <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl p-4 border border-indigo-100 relative">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2">
              <span className="text-indigo-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/></svg>
              </span>
              <h3 className="font-semibold text-indigo-900 text-sm">Dr. AI Insight (Gemini 3 Pro)</h3>
            </div>
            {!isSpeaking ? (
                <button 
                onClick={handleExplain}
                disabled={loading}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-full transition-colors flex items-center"
                >
                {loading ? 'Thinking...' : 'Interpret Results'}
                </button>
            ) : (
                <button 
                onClick={stopSpeaking}
                className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-full transition-colors flex items-center animate-pulse"
                >
                Stop Audio
                </button>
            )}
          </div>
          
          {explanation && (
            <div className="mt-3 text-indigo-800 text-sm leading-relaxed animate-fade-in">
              "{explanation}"
            </div>
          )}
        </div>

        <div className="space-y-4">
            <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Surgical Plan</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                    {treatment.surgery.map((item, i) => (
                        <li key={i} className="flex items-start">
                            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-teal-500 rounded-full flex-shrink-0"></span>
                            {item}
                        </li>
                    ))}
                </ul>
            </div>
             <div className="space-y-2 pt-2 border-t border-slate-200/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase">Adjuvant Therapy</h4>
                <ul className="text-sm text-slate-700 space-y-2">
                    {treatment.adjuvant.length > 0 ? treatment.adjuvant.map((item, i) => (
                        <li key={i} className="flex items-start">
                            <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-purple-500 rounded-full flex-shrink-0"></span>
                            {item}
                        </li>
                    )) : <li className="text-slate-400 italic text-sm">No adjuvant therapy required.</li>}
                </ul>
            </div>
        </div>

      </div>
    </div>
  );
};