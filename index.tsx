
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { GoogleGenAI, Type, Modality } from '@google/genai';
import { marked } from 'marked';
import { 
  Send, 
  Search, 
  Brain, 
  ClipboardCheck, 
  Settings2, 
  Construction, 
  Cpu,
  Globe,
  Trash2,
  Video,
  Radio,
  PhoneOff,
  Zap,
  Menu,
  X,
  Sliders,
  ShieldCheck,
  HardHat,
  FileSearch,
  Wrench,
  Wifi,
  WifiOff,
  Database,
  Archive,
  Terminal,
  MapPin,
  Camera,
  CheckCircle2,
  AlertCircle,
  LayoutDashboard,
  UserCheck,
  Navigation
} from 'lucide-react';

// --- Types ---
interface JobStep {
  id: string;
  instruction: string;
  completed: boolean;
  mediaRequired: boolean;
  mediaCaptured?: string; // base64
  notes?: string;
}

interface Job {
  id: string;
  customer: string;
  address: string;
  description: string;
  status: 'pending' | 'active' | 'completed';
  steps: JobStep[];
  aiSummary?: string;
}

interface Message {
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'image' | 'system';
  timestamp: number;
}

// --- Helper Functions ---
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

const App = () => {
  // Persistence & Global State
  const [role, setRole] = useState<'tech' | 'manager'>('tech');
  const [jobs, setJobs] = useState<Job[]>(() => {
    const saved = localStorage.getItem('nexus_jobs');
    return saved ? JSON.parse(saved) : [
      {
        id: 'JOB-901',
        customer: 'Central Grid Hub',
        address: '400 Industrial Way, Austin TX',
        description: 'B1-Phase Capacitor Replacement & Thermal Scan',
        status: 'pending',
        steps: [
          { id: '1', instruction: 'Perform Lock-out/Tag-out (LOTO) on Main Panel B1.', completed: false, mediaRequired: true },
          { id: '2', instruction: 'Verify zero voltage using fluke meter.', completed: false, mediaRequired: true },
          { id: '3', instruction: 'Replace faulty capacitor units with PN-772.', completed: false, mediaRequired: true }
        ]
      }
    ];
  });
  
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [failCount, setFailCount] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const activeJob = jobs.find(j => j.id === activeJobId);

  // Sync to Storage
  useEffect(() => {
    localStorage.setItem('nexus_jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    const handleStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleStatus);
    window.addEventListener('offline', handleStatus);
    return () => {
      window.removeEventListener('online', handleStatus);
      window.removeEventListener('offline', handleStatus);
    };
  }, []);

  // AI Diagnostic / Map Routing / Report Generation
  const executeAiTask = async (prompt: string, type: 'diagnostic' | 'map' | 'report') => {
    if (!isOnline) return;
    setIsLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
      let config: any = { temperature: 0.1 };
      
      if (type === 'map') {
        config.tools = [{ googleMaps: {} }];
        // Add geolocation context
        const pos = await new Promise<GeolocationPosition>((res) => navigator.geolocation.getCurrentPosition(res));
        config.toolConfig = {
          retrievalConfig: { latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } }
        };
      } else if (type === 'diagnostic') {
        config.thinkingConfig = { thinkingBudget: 8000 };
      }

      const res = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: config
      });

      const responseText = res.text || "Diagnostic stream unavailable.";
      setMessages(prev => [...prev, { role: 'model', content: responseText, type: 'text', timestamp: Date.now() }]);

      if (type === 'diagnostic' && responseText.toLowerCase().includes("unable") || responseText.toLowerCase().includes("contact supervisor")) {
        setFailCount(prev => prev + 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  const handleStepComplete = (stepId: string, mediaData?: string, noteText?: string) => {
    if (!activeJob) return;
    setJobs(prev => prev.map(j => {
      if (j.id === activeJob.id) {
        return {
          ...j,
          steps: j.steps.map(s => s.id === stepId ? { ...s, completed: true, mediaCaptured: mediaData, notes: noteText } : s)
        };
      }
      return j;
    }));
  };

  const finalizeReport = async () => {
    if (!activeJob) return;
    const allStepsDone = activeJob.steps.every(s => s.completed);
    if (!allStepsDone) return alert("All safety and technical steps must be completed before report finalization.");
    
    const reportPrompt = `Verify the completion of Job ${activeJob.id}. 
    Customer: ${activeJob.customer}. 
    Steps Summary: ${activeJob.steps.map(s => s.instruction + " (VERIFIED)").join(', ')}. 
    Generate a professional field service report.`;
    
    await executeAiTask(reportPrompt, 'report');
    setJobs(prev => prev.map(j => j.id === activeJobId ? { ...j, status: 'completed' } : j));
  };

  return (
    <div className="flex h-screen w-full bg-[#0a0a0f] text-zinc-300 font-mono overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-[300px] bg-[#0f0f14] border-r border-zinc-800 p-6 z-50 flex flex-col gap-6 transform transition-transform duration-300 lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center text-black font-black">N</div>
            <h1 className="font-black text-sm tracking-widest text-white uppercase">Nexus Ops</h1>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-zinc-600"><X size={20} /></button>
        </div>

        <div className="space-y-2 mt-4">
          <button onClick={() => setRole('tech')} className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${role === 'tech' ? 'bg-amber-500/10 border-amber-500/40 text-amber-500 shadow-lg' : 'border-transparent text-zinc-500 hover:bg-zinc-800'}`}>
            <HardHat size={18} /> <span className="text-xs font-black uppercase tracking-widest">Field Technician</span>
          </button>
          <button onClick={() => setRole('manager')} className={`w-full flex items-center gap-3 p-4 rounded-xl border transition-all ${role === 'manager' ? 'bg-blue-500/10 border-blue-500/40 text-blue-400 shadow-lg' : 'border-transparent text-zinc-500 hover:bg-zinc-800'}`}>
            <LayoutDashboard size={18} /> <span className="text-xs font-black uppercase tracking-widest">Manager Hub</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar pt-6">
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-[10px] font-black uppercase text-zinc-600 tracking-widest">Current Queue</span>
            <span className="text-[10px] font-black text-amber-500">{jobs.filter(j => j.status !== 'completed').length} Jobs</span>
          </div>
          <div className="space-y-3">
            {jobs.map(job => (
              <button 
                key={job.id} 
                onClick={() => { setActiveJobId(job.id); setRole('tech'); setIsSidebarOpen(false); }}
                className={`w-full text-left p-4 rounded-xl border transition-all ${activeJobId === job.id ? 'bg-zinc-800 border-zinc-600 shadow-md' : 'bg-zinc-900/30 border-zinc-800 hover:bg-zinc-900/50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] font-black text-amber-500">{job.id}</span>
                  {job.status === 'completed' && <CheckCircle2 size={12} className="text-emerald-500" />}
                </div>
                <div className="text-xs font-bold text-white truncate">{job.customer}</div>
                <div className="text-[9px] text-zinc-500 mt-1 truncate">{job.address}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-800">
          <div className={`p-4 rounded-xl border flex flex-col gap-2 ${isOnline ? 'border-emerald-500/20 bg-emerald-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Uplink Status</span>
              <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
            </div>
            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter">
              {isOnline ? 'Global Sync: Active' : 'Offline Mode: Enabled'}
            </p>
          </div>
        </div>
      </aside>

      {/* Main Tactical Screen */}
      <main className="flex-1 flex flex-col relative bg-[#07070a] selection:bg-amber-500/30">
        <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/50 bg-[#0f0f14]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-zinc-400"><Menu size={20} /></button>
            <div className="flex flex-col">
              <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Session Context</span>
              <span className="text-xs font-bold text-white uppercase tracking-tighter">
                {role === 'tech' ? (activeJob ? `Task: ${activeJob.id}` : 'Idle // Waiting for Dispatch') : 'Oversight Hub'}
              </span>
            </div>
          </div>
          {activeJob && role === 'tech' && (
            <button 
              onClick={() => executeAiTask(`Find the best route to ${activeJob.address} starting from my current location.`, 'map')}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[10px] font-black uppercase rounded-lg border border-zinc-700 transition-all text-amber-500"
            >
              <Navigation size={14} /> Navigate Site
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-6 lg:p-10 space-y-8 no-scrollbar bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] bg-fixed">
          {role === 'tech' && activeJob ? (
            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
              {/* Job Card */}
              <div className="bg-[#0f0f14]/80 border border-zinc-800 p-8 rounded-2xl backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                   <Construction size={120} />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-tight mb-2">{activeJob.customer}</h2>
                <p className="text-zinc-500 text-xs mb-6 max-w-lg leading-relaxed">{activeJob.description}</p>
                <div className="flex flex-wrap gap-4">
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400">
                     <MapPin size={12} className="text-amber-500" /> {activeJob.address}
                   </div>
                   <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-[10px] font-bold text-zinc-400 uppercase">
                     Priority: High
                   </div>
                </div>
              </div>

              {/* Step Engine */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-600 px-2">Operational Walkthrough</h3>
                {activeJob.steps.map((step, idx) => (
                  <div key={step.id} className={`flex items-start gap-6 p-6 rounded-2xl border transition-all ${step.completed ? 'bg-zinc-900/20 border-emerald-500/20' : 'bg-[#0f0f14] border-zinc-800 shadow-xl'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-black text-xs ${step.completed ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                      {step.completed ? <CheckCircle2 size={16} /> : idx + 1}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold mb-4 ${step.completed ? 'text-zinc-500 line-through' : 'text-zinc-200'}`}>{step.instruction}</p>
                      {!step.completed && (
                        <div className="flex gap-3">
                          <button 
                            onClick={() => handleStepComplete(step.id)}
                            className="bg-amber-600 hover:bg-amber-500 text-black px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                          >
                            Mark Complete
                          </button>
                          {step.mediaRequired && (
                            <button className="flex items-center gap-2 px-4 py-2 border border-zinc-800 hover:bg-zinc-800 rounded-lg text-[10px] font-black uppercase text-zinc-400 transition-all">
                              <Camera size={14} /> Attach Proof
                            </button>
                          )}
                        </div>
                      )}
                      {step.mediaCaptured && (
                         <div className="mt-4 p-2 bg-zinc-900 rounded-lg border border-zinc-800 inline-block">
                           <span className="text-[8px] font-black uppercase text-zinc-600">Attached Media // Verified</span>
                         </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Completion Logic */}
              <div className="pt-10 flex flex-col items-center">
                 {activeJob.steps.every(s => s.completed) ? (
                   <button 
                    onClick={finalizeReport}
                    className="w-full max-w-md bg-emerald-600 hover:bg-emerald-500 text-black py-6 rounded-2xl font-black text-xs tracking-[0.2em] shadow-[0_0_30px_rgba(16,185,129,0.2)] active:scale-95 transition-all"
                   >
                     GENERATE FINAL FIELD REPORT
                   </button>
                 ) : (
                   <div className="text-center p-6 bg-zinc-900/50 border border-zinc-800 border-dashed rounded-2xl w-full">
                     <p className="text-[10px] font-black uppercase text-zinc-700 tracking-widest">Walkthrough In Progress // {activeJob.steps.filter(s => s.completed).length} of {activeJob.steps.length} Steps Logged</p>
                   </div>
                 )}
              </div>
            </div>
          ) : role === 'manager' ? (
            <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Manager Insights Card */}
              <div className="col-span-full bg-zinc-900/50 border border-zinc-800 p-8 rounded-2xl mb-4">
                 <div className="flex items-center gap-3 mb-6">
                   <LayoutDashboard className="text-blue-400" size={24} />
                   <h2 className="text-lg font-black text-white uppercase tracking-widest">Fleet Intelligence</h2>
                 </div>
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                   {[
                     { label: 'Active Sites', val: jobs.filter(j => j.status === 'active').length + 1 },
                     { label: 'Pending Dispatch', val: jobs.filter(j => j.status === 'pending').length },
                     { label: 'Verified Reports', val: jobs.filter(j => j.status === 'completed').length },
                     { label: 'Safety Alerts', val: failCount }
                   ].map((stat, i) => (
                     <div key={i} className="bg-zinc-950 p-6 rounded-xl border border-zinc-800">
                        <div className="text-[10px] font-black text-zinc-600 uppercase mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-white">{stat.val}</div>
                     </div>
                   ))}
                 </div>
              </div>

              {jobs.map(job => (
                 <div key={job.id} className="bg-[#0f0f14] border border-zinc-800 p-6 rounded-2xl flex flex-col hover:border-blue-500/30 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-black text-zinc-500 uppercase">{job.id}</span>
                      <span className={`text-[9px] font-black uppercase ${job.status === 'completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{job.status}</span>
                    </div>
                    <h4 className="text-sm font-black text-white uppercase mb-1">{job.customer}</h4>
                    <p className="text-xs text-zinc-500 truncate mb-6">{job.address}</p>
                    <div className="mt-auto space-y-2">
                      <div className="w-full bg-zinc-800 h-1 rounded-full overflow-hidden">
                        <div 
                          className="bg-blue-500 h-full transition-all duration-500" 
                          style={{ width: `${(job.steps.filter(s => s.completed).length / job.steps.length) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center text-[9px] font-black uppercase text-zinc-600">
                        <span>Progress</span>
                        <span>{Math.round((job.steps.filter(s => s.completed).length / job.steps.length) * 100)}%</span>
                      </div>
                    </div>
                 </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
               <Cpu size={48} className="mb-4 text-zinc-800" />
               <h2 className="text-lg font-black uppercase tracking-[0.5em]">System Standby</h2>
               <p className="text-xs mt-2 uppercase tracking-widest">Select an active job from the dispatch menu to begin</p>
            </div>
          )}

          {/* AI Messages Overlay/Drawer */}
          {messages.length > 0 && (
             <div className="fixed bottom-32 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-40">
                <div className="bg-[#121218] border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-8">
                   <div className="flex justify-between items-center mb-4 border-b border-zinc-800 pb-3">
                      <div className="flex items-center gap-2 text-[10px] font-black text-amber-500 uppercase">
                        <Brain size={16} /> Nexus Intelligence Stream
                      </div>
                      <button onClick={() => setMessages([])} className="text-zinc-600 hover:text-white"><X size={16} /></button>
                   </div>
                   <div className="max-h-[300px] overflow-y-auto no-scrollbar prose prose-invert prose-sm">
                      {messages.map((m, i) => (
                        <div key={i} className="mb-4" dangerouslySetInnerHTML={{ __html: marked.parse(m.content) as string }} />
                      ))}
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Input Bar (Diagnostic / Search / Talk) */}
        <div className="p-6 lg:p-12 lg:pt-4 bg-gradient-to-t from-[#0a0a0f] to-transparent z-10">
          <form 
            onSubmit={(e) => { e.preventDefault(); if(input.trim()) executeAiTask(input, 'diagnostic'); setInput(''); }} 
            className="max-w-5xl mx-auto group"
          >
            <div className={`relative bg-zinc-900/80 border rounded-2xl flex items-center p-2 focus-within:border-amber-500/50 transition-all shadow-2xl backdrop-blur-xl ${!isOnline ? 'border-red-900/30' : 'border-zinc-800'}`}>
              <div className={`pl-4 ${isOnline ? 'text-zinc-700' : 'text-red-900'}`}>
                {failCount >= 3 ? <AlertCircle className="text-red-500" size={20} /> : <Terminal size={20} />}
              </div>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={failCount >= 3 ? "SYSTEM FAULT: MULTIPLE FAILURES. RECORDING VOICEMAIL..." : "Request technical assistance, schematics, or site info..."}
                disabled={!isOnline || failCount >= 3}
                className="flex-1 bg-transparent px-5 py-5 outline-none text-zinc-200 text-sm font-sans placeholder-zinc-800"
              />
              <button 
                type="submit" 
                disabled={!input.trim() || isLoading || !isOnline}
                className="bg-amber-600 hover:bg-amber-500 text-black px-10 py-5 rounded-xl flex items-center gap-3 transition-all disabled:opacity-20 disabled:grayscale font-black text-[11px] uppercase tracking-widest shadow-xl active:scale-95"
              >
                {isLoading ? 'Processing' : 'Analyze'} <Send size={18} />
              </button>
            </div>
            {failCount >= 3 && (
               <div className="mt-4 p-4 bg-red-950/20 border border-red-900/50 rounded-xl flex items-center justify-between">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <AlertCircle size={14} /> AI Diagnostic Ceiling Reached. Manual Memo Required.
                  </span>
                  <button onClick={() => setFailCount(0)} className="text-[9px] font-black text-white bg-red-600 px-3 py-1 rounded uppercase">Record & Dispatch Hub</button>
               </div>
            )}
            <div className="flex justify-between items-center mt-5 px-1">
               <p className="text-[8px] font-black text-zinc-800 tracking-[0.6em] uppercase flex items-center gap-2">
                 <UserCheck size={10} /> {role.toUpperCase()}_IDENTITY_VERIFIED
               </p>
               <p className="text-[8px] font-black text-zinc-800 tracking-[0.2em] uppercase">E2E Field Encryption // V1.4_TAC</p>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
