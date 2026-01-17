import React, { useState } from 'react';
import { SmartScan } from './components/SmartScan';
import { ResultsCard } from './components/ResultsCard';
import { ChatAssistant } from './components/ChatAssistant';
import { 
  MenopausalStatus, 
  Histology, 
  Myoinvasion, 
  CervicalInvasion, 
  LVSIStatus, 
  PatientData, 
  TumorData,
  ScanResult
} from './types';
import { Engine } from './utils/figoEngine';

const App: React.FC = () => {
  const [patient, setPatient] = useState<PatientData>({ 
    age: 60, 
    bmi: 28, 
    menopausalStatus: MenopausalStatus.POST, 
    comorbidityScore: 0 
  });

  const [tumor, setTumor] = useState<TumorData>({
    histology: Histology.ENDOMETRIOID_LOW_GRADE,
    myoinvasion: Myoinvasion.LESS_50,
    cervicalInvasion: CervicalInvasion.NONE,
    lvsi: LVSIStatus.NONE,
    tumorSizeCm: 3.0,
    erStatusPositive: true,
    adnexalInvolvement: false,
    vaginalInvolvement: false,
    parametrialInvolvement: false,
    peritonealInvolvement: false,
    pelvicNodesPositive: false,
    paraaorticNodesPositive: false,
    bladderBowelMucosa: false,
    distantMetastasis: false,
    peritonealCarcinomatosis: false,
    poleMutation: false,
    mmrDeficient: false,
    p53Abnormal: false
  });

  const mol = Engine.classifyMolecular(tumor);
  const stage = Engine.determineStage(tumor, mol);
  const risk = Engine.getRisk(tumor, stage, mol);
  const treatment = Engine.getTreatment(patient, tumor, stage, risk, mol);

  const handleScanResult = (data: ScanResult) => {
    const newTumor = { ...tumor };
    
    if (data.histology) {
      const h = data.histology.toLowerCase();
      if (h.includes('serous')) newTumor.histology = Histology.SEROUS;
      else if (h.includes('clear')) newTumor.histology = Histology.CLEAR_CELL;
      else if (h.includes('carcino')) newTumor.histology = Histology.CARCINOSARCOMA;
      else if (h.includes('grade 3')) newTumor.histology = Histology.ENDOMETRIOID_HIGH_GRADE;
      else newTumor.histology = Histology.ENDOMETRIOID_LOW_GRADE;
    }

    if (data.myoinvasion) {
      const m = data.myoinvasion.toLowerCase();
      if (m.includes('50') && (m.includes('>') || m.includes('more') || m.includes('deep'))) newTumor.myoinvasion = Myoinvasion.GREATER_EQUAL_50;
      else if (m.includes('none') || m.includes('no')) newTumor.myoinvasion = Myoinvasion.NONE;
      else newTumor.myoinvasion = Myoinvasion.LESS_50;
    }

    if (data.lvsi) {
       const l = data.lvsi.toLowerCase();
       if (l.includes('substantial') || l.includes('extensive')) newTumor.lvsi = LVSIStatus.SUBSTANTIAL;
       else if (l.includes('focal')) newTumor.lvsi = LVSIStatus.FOCAL;
       else newTumor.lvsi = LVSIStatus.NONE;
    }

    if (data.poleMutation !== undefined) newTumor.poleMutation = data.poleMutation;
    if (data.mmrDeficient !== undefined) newTumor.mmrDeficient = data.mmrDeficient;
    if (data.p53Abnormal !== undefined) newTumor.p53Abnormal = data.p53Abnormal;

    setTumor(newTumor);
  };

  const contextSummary = `Patient Age: ${patient.age}, Histology: ${tumor.histology}, Stage: ${stage}, Risk: ${risk}, Molecular: ${mol}`;

  return (
    <div className="min-h-screen bg-[#f0f4f8] text-slate-800 font-sans selection:bg-teal-200 selection:text-teal-900 pb-20 relative overflow-x-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-teal-600 to-transparent -z-20 opacity-10 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none"></div>

      <header className="glass-panel sticky top-4 mx-4 sm:mx-8 rounded-2xl z-40 mb-8 mt-4">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
             <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight text-slate-800">OncoGuide <span className="text-teal-600">AI</span></h1>
               <p className="text-xs text-slate-500 font-medium">Endometrial Cancer Assistant</p>
             </div>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-slate-500 hover:text-teal-600 transition-colors"
          >
            New Case
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <div className="lg:col-span-7 space-y-6">
          
          <SmartScan onScanComplete={handleScanResult} />

          {/* Patient Profile Section */}
          <section className="glass-panel rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center mr-3">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </span>
              Patient Profile
            </h3>
            <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Age</label>
                  <input 
                    type="number" 
                    value={patient.age}
                    onChange={e => setPatient({...patient, age: Number(e.target.value)})}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none transition-shadow"
                  />
               </div>
               <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                  <select
                     value={patient.comorbidityScore}
                     onChange={e => setPatient({...patient, comorbidityScore: Number(e.target.value)})}
                     className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                  >
                     <option value={0}>Fit for Surgery</option>
                     <option value={1}>Medically Unfit</option>
                  </select>
               </div>
            </div>
          </section>

          {/* Tumor Characteristics Section */}
          <section className="glass-panel rounded-3xl p-6 shadow-sm">
             <h3 className="text-lg font-bold text-slate-700 mb-4 flex items-center">
              <span className="w-8 h-8 rounded-lg bg-pink-100 text-pink-600 flex items-center justify-center mr-3">
                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
              </span>
              Tumor Characteristics
            </h3>
            
            <div className="space-y-4">
              <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase">Histology</label>
                 <select 
                   value={tumor.histology}
                   onChange={e => setTumor({...tumor, histology: e.target.value as Histology})}
                   className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 focus:ring-2 focus:ring-teal-500 outline-none"
                 >
                   {Object.values(Histology).map(h => <option key={h} value={h}>{h}</option>)}
                 </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">Myoinvasion</label>
                    <select 
                      value={tumor.myoinvasion}
                      onChange={e => setTumor({...tumor, myoinvasion: e.target.value as Myoinvasion})}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 outline-none"
                    >
                      {Object.values(Myoinvasion).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                 </div>
                 <div>
                    <label className="text-xs font-semibold text-slate-500 uppercase">LVSI</label>
                    <select 
                      value={tumor.lvsi}
                      onChange={e => setTumor({...tumor, lvsi: e.target.value as LVSIStatus})}
                      className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-slate-800 outline-none"
                    >
                      {Object.values(LVSIStatus).map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                 </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Molecular Profile</label>
                <div className="flex gap-2">
                   {[
                     { label: 'POLE', key: 'poleMutation' as const }, 
                     { label: 'MMRd', key: 'mmrDeficient' as const }, 
                     { label: 'p53abn', key: 'p53Abnormal' as const }
                   ].map((m) => (
                     <button
                        key={m.key}
                        onClick={() => setTumor({ ...tumor, [m.key]: !tumor[m.key] })}
                        className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all border
                          ${tumor[m.key] 
                             ? 'bg-slate-800 text-white border-slate-800 shadow-md' 
                             : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                          }
                        `}
                     >
                       {m.label}
                     </button>
                   ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <label className="text-xs font-semibold text-slate-500 uppercase mb-2 block">Spread / Metastasis</label>
                <div className="grid grid-cols-2 gap-2 text-sm">
                   <label className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={tumor.cervicalInvasion === CervicalInvasion.STROMAL}
                          onChange={(e) => {
                             setTumor({...tumor, cervicalInvasion: e.target.checked ? CervicalInvasion.STROMAL : CervicalInvasion.NONE});
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500" 
                        />
                        <span className="text-slate-700">Cervical Stromal</span>
                   </label>
                   {[
                     { label: 'Ovaries/Tubes', key: 'adnexalInvolvement' as const },
                     { label: 'Pelvic Nodes (+)', key: 'pelvicNodesPositive' as const },
                     { label: 'Para-aortic Nodes', key: 'paraaorticNodesPositive' as const },
                   ].map((item) => (
                      <label key={item.label} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-slate-50 transition-colors">
                        <input 
                          type="checkbox" 
                          checked={!!tumor[item.key]}
                          onChange={(e) => {
                             setTumor({...tumor, [item.key]: e.target.checked});
                          }}
                          className="rounded text-teal-600 focus:ring-teal-500" 
                        />
                        <span className="text-slate-700">{item.label}</span>
                      </label>
                   ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="lg:col-span-5 relative">
           <div className="sticky top-28 transition-all duration-500 ease-in-out">
              <ResultsCard 
                stage={stage} 
                risk={risk} 
                mol={mol} 
                treatment={treatment} 
              />
           </div>
        </div>

      </main>

      <ChatAssistant contextSummary={contextSummary} />

    </div>
  );
};

export default App;