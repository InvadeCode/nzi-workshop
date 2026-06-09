import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, RefreshCcw, Download, Info, CheckCircle, Maximize2 } from 'lucide-react';

// --- Supabase Configuration ---
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = import.meta.env?.VITE_SUPABASE_SERVICE_KEY;

// --- Workshop Data (Mapped from NetZero x PurpleBlue House Presentation) ---
const QUESTIONS = [
  { 
    id: 'q1', 
    type: 'text', 
    text: "Let's imagine India in 2070. Write one headline you would like to read about India.", 
    explanation: "Forces visionary thinking. A great institution must clearly articulate the future it is trying to build."
  },
  { 
    id: 'q2', 
    type: 'text', 
    text: "When NZI achieves what it sets out to, how do you describe NZI's part? Without NZI, India would struggle to...", 
    explanation: "Defines the core problem statement and the unique value proposition of the institution."
  },
  { 
    id: 'q3', 
    type: 'ranking', 
    text: "Select exactly 3 adjectives that describe the brand's essence.", 
    options: ["Authoritative", "Strategic", "Innovative", "Disruptive", "Compassionate", "Humble", "Wise", "Visionary"],
    explanation: "Distills the brand personality down to its most potent, recognizable traits."
  },
  { 
    id: 'q4', 
    type: 'choice', 
    text: "Who are we primarily building this for? Select the target persona.", 
    options: ["Undergraduate Aspirant (17-20 yrs)", "Post-Graduate Aspirant (22-26 yrs)", "Subject Matter Expert / Policy Advisor"],
    explanation: "Identifies the core audience. The language, tone, and design of the website must directly appeal to this persona."
  },
  { 
    id: 'q5', 
    type: 'choice', 
    text: "What story are we currently telling (intentionally or not)?", 
    options: ["A traditional academic institution", "A government-affiliated think tank", "A fragmented, multi-disciplinary lab", "A modern, future-focused strategy hub"],
    explanation: "Audits current brand perception to understand the gap between 'where we are' and 'where we need to be'."
  },
  { 
    id: 'q6', 
    type: 'choice', 
    text: "Where does NZI meet its audience? Select the primary brand touchpoint.", 
    options: ["Academic Journals & Policy Briefs", "The Main Website & Digital Portal", "High-level Government Summits", "University Campus & Physical Events"],
    explanation: "Maps the customer journey. If the website is the primary touchpoint, it requires the most investment in UX/UI."
  },
  { 
    id: 'q7', 
    type: 'choice', 
    text: "This or That: Mukesh Ambani (Authoritative/Strategic) OR Bear Grylls (Adventurous/Risk-taking)?", 
    options: ["Mukesh Ambani", "Bear Grylls", "None of the above"],
    explanation: "Forces a choice between distinct leadership styles to refine the brand's voice."
  },
  { 
    id: 'q8', 
    type: 'choice', 
    text: "This or That: Steve Jobs (Innovative/Perfectionist) OR Lata Mangeshkar (Pure/Uplifting)?", 
    options: ["Steve Jobs", "Lata Mangeshkar", "None of the above"],
    explanation: "Forces a choice between technological innovation and emotional resonance."
  },
  { 
    id: 'q9', 
    type: 'choice', 
    text: "This or That: A.P.J. Abdul Kalam (Wise/Guiding) OR Sudha Murty (Compassionate/Nurturing)?", 
    options: ["A.P.J. Abdul Kalam", "Sudha Murty", "None of the above"],
    explanation: "Forces a choice between intellectual leadership and empathetic caregiving."
  },
  { 
    id: 'q10', 
    type: 'choice', 
    text: "This or That: Johny Lever (Playful/Witty) OR Ratan Tata (Humble/Grounded)?", 
    options: ["Johny Lever", "Ratan Tata", "None of the above"],
    explanation: "Checks the brand's level of formality and approachability."
  },
  { 
    id: 'q11', 
    type: 'choice', 
    text: "This or That: Bhagat Singh (Disruptive/Bold) OR Walt Disney (Imaginative/Visionary)?", 
    options: ["Bhagat Singh", "Walt Disney", "None of the above"],
    explanation: "Checks the brand's appetite for challenging the status quo vs. dreaming of new futures."
  },
  { 
    id: 'q12', 
    type: 'choice', 
    text: "Based on previous answers, which Brand Archetype best fits NZI?", 
    options: ["Ruler (Authority/Legacy)", "Hero (Courageous/Mission-driven)", "Sage (Knowledge/Strategy)", "Outlaw (Disruptive/Bold)"],
    explanation: "The ultimate brand classification. This dictates typography, colors, imagery, and copywriting tone."
  },
  { 
    id: 'q13', 
    type: 'ranking', 
    text: "What 3 Sustainable Development Goals (SDGs) should India prioritise by 2070?", 
    options: ["Affordable & Clean Energy", "Sustainable Cities", "Industry & Innovation", "Climate Action", "Quality Education", "Decent Work & Growth"],
    explanation: "Connects the brand's mission to actionable, globally recognized goals."
  },
  { 
    id: 'q14', 
    type: 'choice', 
    text: "Landscape Mapping: Where does BDU sit on the spectrum?", 
    options: ["Legacy/Heritage (e.g., Oxford)", "Intellectual Authority (e.g., NUS)", "Disruptive Innovation (e.g., MIT Media Lab)", "Cultural Resonance (e.g., King's College)"],
    explanation: "Positions the brand against competitors to find 'white space' in the market."
  },
  { 
    id: 'q15', 
    type: 'text', 
    text: "Final Question: What are 5 emotions people should instantly recognise and associate with the brand?", 
    explanation: "Provides the creative team with the emotional brief for all future design and copy."
  }
];

export default function WebsiteWorkshopApp() {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [rankingState, setRankingState] = useState([]);
  const [animateState, setAnimateState] = useState('enter'); 
  const [showExplanation, setShowExplanation] = useState(false);
  
  // Cloud & AI States
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, saving, success, error

  // User Details
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  const changeStep = (newStep) => {
    setAnimateState('exit');
    setShowExplanation(false);
    setTimeout(() => {
      setStep(newStep);
      setAnimateState('enter');
      // Reset inputs/ranking state when moving
      if (newStep > 0 && newStep <= QUESTIONS.length) {
        const q = QUESTIONS[newStep - 1];
        if (q.type === 'text') setInputValue(answers[q.id] || '');
        if (q.type === 'ranking') setRankingState(answers[q.id] || []);
      }
    }, 400); 
  };

  useEffect(() => {
    if (animateState === 'enter') {
      const timer = setTimeout(() => setAnimateState('active'), 50);
      return () => clearTimeout(timer);
    }
  }, [animateState, step]);

  const handleChoice = (questionId, option) => {
    setAnswers(prev => ({ ...prev, [questionId]: option }));
    changeStep(step + 1);
  };

  const handleRankingChoice = (questionId, option) => {
    setRankingState(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option); // Deselect
      }
      if (prev.length < 3) {
        return [...prev, option]; // Select
      }
      return prev;
    });
  };

  const submitRanking = (questionId) => {
    if (rankingState.length === 3) {
      setAnswers(prev => ({ ...prev, [questionId]: rankingState }));
      changeStep(step + 1);
    }
  };

  const handleTextSubmit = (questionId) => {
    if (!inputValue.trim()) return;
    setAnswers(prev => ({ ...prev, [questionId]: inputValue }));
    setInputValue('');
    changeStep(step + 1);
  };

  const handleKeyDown = (e, questionId) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      handleTextSubmit(questionId);
    }
  };

  const saveToSupabase = async (finalSummary) => {
    setSyncStatus('saving');
    try {
      const payload = {
        user_name: userName,
        user_email: userEmail,
        answers: answers,
        ai_summary: finalSummary
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/workshop_responses`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Supabase Error: ${response.status} - ${errorText}`);
      }
      
      setSyncStatus('success');
    } catch (error) {
      console.error("Supabase Save Error:", error);
      setSyncStatus('error');
    }
  };

  const generateAISummary = async () => {
    setIsGeneratingSummary(true);
    let generatedText = "";
    try {
      const apiKey = import.meta.env?.VITE_GEMINI_API_KEY || "";
      
      const qaText = QUESTIONS.map(q => {
        let ans = answers[q.id] || 'Not answered';
        if (Array.isArray(ans)) ans = `1st: ${ans[0]}, 2nd: ${ans[1]}, 3rd: ${ans[2]}`;
        return `Q: ${q.text}\nA: ${ans}`;
      }).join('\n\n');

      const systemPrompt = `Act as an expert digital strategist and UX architect. Analyze the provided user answers from a strategic branding workshop. Provide a comprehensive, detailed 3-paragraph executive summary outlining the recommended website architecture, user experience journey, and visual direction (archetype, tone, aesthetics). DO NOT use markdown like asterisks for bolding. Use plain text paragraphs only. Ensure the output is substantial and detailed.`;
      const userPrompt = `Workshop Participant: ${userName} (${userEmail})\n\nBased on the following answers from the 'NetZero India x PurpleBlue House' branding workshop, provide a detailed executive strategy summary.\n\nWorkshop Data:\n${qaText}`;
      
      if (!apiKey) {
        generatedText = "API Key not found. Please ensure VITE_GEMINI_API_KEY is set in your environment variables to generate the deep AI strategy analysis.";
      } else {
        const payload = {
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
          generationConfig: { 
            temperature: 0.7, 
            maxOutputTokens: 1000 // CRITICAL FIX: Increased token limit significantly to prevent cutoff
          } 
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
          generatedText = data.candidates[0].content.parts[0].text;
        } else {
          generatedText = "Analysis generation failed. Check API limits or configuration.";
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      generatedText = "An error occurred while generating the AI strategy brief.";
    } finally {
      setAiSummary(generatedText);
      setIsGeneratingSummary(false);
      saveToSupabase(generatedText);
    }
  };

  useEffect(() => {
    if (step === QUESTIONS.length + 1 && !aiSummary && !isGeneratingSummary) {
      generateAISummary();
    }
  }, [step]);

  const exportPDF = () => {
    setIsGeneratingPDF(true);
    const element = document.getElementById('print-container');
    
    // Temporarily make the hidden container visible for html2pdf
    element.classList.remove('opacity-0', '-z-50', 'pointer-events-none');
    element.classList.add('z-50', 'opacity-100');

    const generate = () => {
      window.html2pdf().set({
        margin: 0.5,
        filename: 'NZI_Brand_Strategy_Blueprint.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, letterRendering: true },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      }).from(element).save().then(() => {
        setIsGeneratingPDF(false);
        // Hide container again
        element.classList.add('opacity-0', '-z-50', 'pointer-events-none');
        element.classList.remove('z-50', 'opacity-100');
      });
    };

    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
      script.onload = generate;
      document.head.appendChild(script);
    } else {
      generate();
    }
  };

  const currentQuestion = step > 0 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : null;

  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 overflow-hidden flex flex-col font-sans selection:bg-blue-950 selection:text-white relative">
      
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Poppins', sans-serif; }

        .bg-grid {
          position: absolute;
          inset: -100%;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
          z-index: 0;
          pointer-events: none;
        }

        .fade-enter { opacity: 0; transform: translateY(15px) scale(0.98); }
        .fade-active { opacity: 1; transform: translateY(0) scale(1); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-exit { opacity: 0; transform: translateY(-15px) scale(0.98); transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255,255,255,0.8);
        }

        .custom-scroll::-webkit-scrollbar { width: 6px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 10px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.25); }
      `}} />
      
      <div className="bg-grid"></div>

      {/* Header - Fixed Top */}
      <header className="w-full px-8 py-5 flex items-center justify-between z-20 flex-shrink-0 bg-white/50 backdrop-blur-sm border-b border-black/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-950 to-emerald-950 flex items-center justify-center shadow-md border border-white/20">
            <span className="text-white font-bold text-sm tracking-tighter">NZ</span>
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-900 leading-none">NetZero India</h1>
            <p className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Brand Strategy Workshop</p>
          </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 flex flex-col flex-1 overflow-y-auto custom-scroll pb-12">
        <div className={`flex flex-col w-full my-auto transition-all duration-500 ${animateState === 'enter' ? 'fade-enter' : animateState === 'active' ? 'fade-active' : 'fade-exit'}`}>
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="w-full text-center flex flex-col items-center glass-panel p-10 md:p-16 rounded-3xl mt-8">
              <div className="inline-block border border-black/10 bg-black/5 px-4 py-1.5 mb-6 rounded-full text-[10px] font-bold tracking-widest uppercase text-slate-600">
                Phase 1: Brand Identity & Positioning
              </div>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-slate-900">
                Brand Architecture Workshop
              </h2>
              <p className="text-sm text-slate-600 mb-10 max-w-lg mx-auto leading-relaxed font-medium">
                A 15-step interactive diagnostic based on the PurpleBlue House framework to define the precise stakeholders, brand archetypes, and communication strategy for the new NetZero India platform.
              </p>

              {/* User Details Form */}
              <div className="w-full max-w-sm mx-auto mb-10 space-y-5 text-left">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Participant Name</label>
                  <input 
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/60 border border-white focus:border-blue-900/30 focus:bg-white rounded-2xl text-sm py-4 px-5 outline-none transition-all shadow-sm placeholder-slate-400 text-slate-900 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-white/60 border border-white focus:border-blue-900/30 focus:bg-white rounded-2xl text-sm py-4 px-5 outline-none transition-all shadow-sm placeholder-slate-400 text-slate-900 font-semibold"
                  />
                </div>
              </div>

              <button 
                onClick={() => changeStep(1)}
                disabled={!userName.trim() || !userEmail.includes('@')}
                className="flex items-center justify-center px-8 py-4 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 backdrop-blur-md border border-white/10 text-white rounded-2xl font-semibold text-sm hover:opacity-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed"
              >
                Begin Strategy Diagnostic <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEPS 1-15: QUESTIONS */}
          {currentQuestion && (
            <div className="w-full glass-panel p-8 md:p-12 rounded-3xl mt-8">
              
              {/* Progress & Tooltip Header */}
              <div className="flex justify-between items-center mb-10 pb-5 border-b border-slate-200">
                <span className="font-bold tracking-widest uppercase text-[10px] text-slate-400">Step {String(step).padStart(2, '0')} of {QUESTIONS.length}</span>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors px-4 py-2 rounded-full ${showExplanation ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  <Info className="w-3 h-3" /> {showExplanation ? 'Close Insight' : 'Why ask this?'}
                </button>
              </div>

              {/* Tooltip Explanation Box */}
              {showExplanation && (
                <div className="mb-8 p-5 bg-blue-50/80 border border-blue-100 rounded-2xl text-xs text-blue-900 leading-relaxed font-medium shadow-inner animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold mr-2 text-[10px] uppercase tracking-widest bg-blue-900/10 px-2 py-1 rounded">Strategy Insight</span> 
                  {currentQuestion.explanation}
                </div>
              )}

              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-10 leading-snug text-slate-900">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'text' && (
                <div className="flex flex-col gap-6">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, currentQuestion.id)}
                    placeholder="Type your response..."
                    className="w-full bg-white/80 border border-white rounded-2xl text-base py-5 px-6 focus:border-blue-900/30 focus:bg-white outline-none shadow-sm placeholder-slate-300 font-semibold transition-all"
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="mr-2 w-3.5 h-3.5" /> Back
                    </button>
                    <button 
                      onClick={() => handleTextSubmit(currentQuestion.id)}
                      disabled={!inputValue.trim()}
                      className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 text-white border border-white/10 rounded-2xl font-semibold text-xs disabled:opacity-30 hover:opacity-100 hover:shadow-md transition-all"
                    >
                      Finalize Entry <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'choice' && (
                <div className="flex flex-col gap-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChoice(currentQuestion.id, opt)}
                        className={`text-left p-5 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 flex justify-between items-center group
                          ${answers[currentQuestion.id] === opt 
                            ? 'bg-gradient-to-r from-blue-950/90 to-emerald-950/90 border-transparent text-white shadow-md' 
                            : 'bg-white/60 border-white text-slate-600 hover:bg-white hover:border-blue-900/20 hover:shadow-sm'}`}
                      >
                        <span>{opt}</span>
                        {answers[currentQuestion.id] === opt && <Check className="w-4 h-4 text-emerald-400" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-start">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="mr-2 w-3.5 h-3.5" /> Back
                    </button>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'ranking' && (
                <div className="flex flex-col gap-5">
                  <p className="text-xs text-slate-500 font-semibold mb-2 bg-slate-100 inline-block px-3 py-1.5 rounded-lg w-max">
                    Select exactly 3 options in order of priority (1st, 2nd, 3rd).
                  </p>
                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((opt, idx) => {
                      const rankIndex = rankingState.indexOf(opt);
                      const isSelected = rankIndex !== -1;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleRankingChoice(currentQuestion.id, opt)}
                          className={`text-left p-4 rounded-2xl border-2 font-semibold text-sm transition-all duration-200 flex items-center group
                            ${isSelected
                              ? 'bg-gradient-to-r from-blue-950/90 to-emerald-950/90 border-transparent text-white shadow-md' 
                              : 'bg-white/60 border-white text-slate-600 hover:bg-white hover:border-blue-900/20 hover:shadow-sm'}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-4 text-[10px] font-bold transition-all ${isSelected ? 'bg-white text-blue-950 shadow-sm' : 'bg-slate-200 text-slate-400'}`}>
                            {isSelected ? rankIndex + 1 : ''}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-8">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="mr-2 w-3.5 h-3.5" /> Back
                    </button>
                    <button 
                      onClick={() => submitRanking(currentQuestion.id)}
                      disabled={rankingState.length !== 3}
                      className="flex items-center px-8 py-4 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 text-white border border-white/10 rounded-2xl font-semibold text-xs disabled:opacity-30 hover:opacity-100 hover:shadow-md transition-all"
                    >
                      Confirm Priority <ArrowRight className="ml-2 w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 16: SUMMARY / DATA EXPORT */}
          {step === QUESTIONS.length + 1 && (
            <div className="w-full pb-10">
              <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden mt-8">
                
                {/* Header for Summary */}
                <div className="mb-8 border-b border-slate-200 pb-6 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
                  <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">Architecture Blueprint</h2>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Review & Export Strategy</p>
                  </div>
                  
                  {/* Supabase Sync Status Indicator */}
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest font-bold bg-slate-100 px-3 py-1.5 rounded-full">
                    {syncStatus === 'saving' && <span className="text-slate-500 animate-pulse flex items-center gap-1.5"><RefreshCcw className="w-3 h-3 animate-spin"/> Syncing...</span>}
                    {syncStatus === 'success' && <><CheckCircle className="w-3 h-3 text-emerald-600" /><span className="text-emerald-700">Saved to Cloud</span></>}
                    {syncStatus === 'error' && <span className="text-red-600">Sync Failed</span>}
                  </div>
                </div>

                {/* Participant Details Box */}
                <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 bg-white/50 rounded-2xl p-5 border border-white shadow-sm">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Participant Name</div>
                    <div className="text-sm font-bold text-slate-900">{userName}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">Email Address</div>
                    <div className="text-sm font-bold text-slate-900">{userEmail}</div>
                  </div>
                </div>

                {/* AI UX Strategy Summary Box */}
                <div className="mb-10 bg-gradient-to-br from-blue-50/80 to-emerald-50/80 border border-blue-900/10 rounded-2xl p-6 md:p-8 relative shadow-inner">
                  <div className="flex items-center gap-2 mb-4 border-b border-blue-900/10 pb-3">
                    <span className="text-blue-900 font-bold text-[10px] uppercase tracking-widest bg-white/60 px-3 py-1 rounded-full border border-white flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                      AI Strategy Analysis
                    </span>
                  </div>
                  
                  {isGeneratingSummary ? (
                    <div className="flex flex-col gap-4 py-4">
                       <div className="flex items-center gap-3 text-xs text-blue-900/60 font-semibold">
                        <RefreshCcw className="w-4 h-4 animate-spin" />
                        Synthesizing deep strategy brief...
                      </div>
                      <div className="space-y-3 opacity-40">
                         <div className="h-2.5 bg-blue-900/20 rounded-full w-full animate-pulse"></div>
                         <div className="h-2.5 bg-blue-900/20 rounded-full w-5/6 animate-pulse"></div>
                         <div className="h-2.5 bg-blue-900/20 rounded-full w-4/6 animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-800 leading-loose font-medium space-y-5 whitespace-pre-wrap">
                      {aiSummary}
                    </div>
                  )}
                </div>

                {/* Scrollable Answers List */}
                <div className="mb-10">
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Diagnostic Data Log</h3>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto custom-scroll pr-4 space-y-3 border border-slate-200/50 p-4 rounded-2xl bg-white/30">
                    {QUESTIONS.map((q, idx) => {
                      let ansText = answers[q.id] || "—";
                      if (Array.isArray(ansText)) {
                        ansText = `1st: ${ansText[0]} | 2nd: ${ansText[1]} | 3rd: ${ansText[2]}`;
                      }

                      return (
                        <div key={q.id} className="bg-white/80 rounded-xl p-4 border border-white shadow-sm">
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex gap-2">
                            <span>{String(idx + 1).padStart(2, '0')}.</span>
                            <span>{q.text}</span>
                          </div>
                          <div className="text-sm font-semibold text-slate-900">
                            {ansText}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
                  <button 
                    onClick={exportPDF}
                    disabled={isGeneratingPDF || isGeneratingSummary}
                    className="flex-1 flex items-center justify-center px-6 py-4 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 text-white border border-white/10 rounded-2xl font-semibold text-xs hover:opacity-100 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <span className="animate-pulse flex items-center gap-2"><RefreshCcw className="w-4 h-4 animate-spin"/> Generating Brief...</span>
                    ) : (
                      <><Download className="mr-2 w-4 h-4" /> Export Blueprint PDF</>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setAnswers({});
                      setRankingState([]);
                      setAiSummary(null);
                      setUserName('');
                      setUserEmail('');
                      setSyncStatus('idle');
                      changeStep(0);
                    }}
                    className="flex-1 flex items-center justify-center px-6 py-4 bg-white/60 backdrop-blur-sm border border-slate-200 text-slate-700 rounded-2xl font-semibold text-xs hover:bg-white hover:text-slate-900 hover:shadow-sm transition-all duration-300"
                  >
                    <RefreshCcw className="mr-2 w-4 h-4" /> Restart Diagnostic
                  </button>
                </div>
              </div>

              {/* HIDDEN PRINT CONTAINER FOR FLAWLESS PDF GENERATION */}
              <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <div id="print-container" className="w-[800px] bg-white p-10 text-slate-900" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <div className="mb-10 border-b-2 border-slate-900 pb-6">
                    <h1 className="text-4xl font-bold mb-3 text-slate-900 tracking-tight">Brand Architecture Blueprint</h1>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-6">NetZero India Foundation x PurpleBlue House</p>
                    <div className="flex gap-10 text-sm bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div><span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Participant</span> <span className="font-bold text-base">{userName}</span></div>
                      <div><span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Email</span> <span className="font-bold text-base">{userEmail}</span></div>
                    </div>
                  </div>

                  {aiSummary && (
                    <div className="mb-12">
                      <h2 className="text-lg font-bold uppercase tracking-widest text-blue-900 mb-4 border-b border-blue-100 pb-2">AI Strategy Analysis</h2>
                      <div className="text-sm text-slate-700 leading-loose font-medium whitespace-pre-wrap bg-blue-50/50 p-6 rounded-2xl border border-blue-100/50">
                        {aiSummary}
                      </div>
                    </div>
                  )}

                  <div>
                    <h2 className="text-lg font-bold uppercase tracking-widest text-slate-900 mb-6 border-b border-slate-200 pb-2">Diagnostic Data Log</h2>
                    <div className="space-y-6">
                      {QUESTIONS.map((q, idx) => {
                        let ansText = answers[q.id] || "—";
                        if (Array.isArray(ansText)) {
                          ansText = `1st Priority: ${ansText[0]}\n2nd Priority: ${ansText[1]}\n3rd Priority: ${ansText[2]}`;
                        }

                        return (
                          <div key={q.id} className="pb-6 border-b border-slate-100 last:border-0">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex gap-2">
                              <span>{String(idx + 1).padStart(2, '0')}.</span>
                              <span>{q.text}</span>
                            </div>
                            <div className="text-base font-bold text-slate-900 whitespace-pre-line">
                              {ansText}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer - Fixed Bottom */}
      <footer className="w-full px-8 py-5 flex items-center justify-center bg-gradient-to-r from-blue-950 to-emerald-950 text-white/80 text-[9px] tracking-[0.2em] uppercase font-bold z-20 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
         NetZero India Foundation © 2026 | PurpleBlue House Brand Diagnostic
      </footer>
      
    </div>
  );
}
