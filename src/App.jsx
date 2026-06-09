import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, RefreshCcw, Download, Info, Globe, Sparkles, CloudOff, CheckCircle } from 'lucide-react';
import jsPDF from 'jspdf';

// --- Supabase Configuration ---
const SUPABASE_URL = 'https://rhcqnhlrpbmrvjtibpad.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJoY3FuaGxycGJtcnZqdGlicGFkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDk4NDU4OCwiZXhwIjoyMDk2NTYwNTg4fQ.ux2ecObayJTpBf2F3PWLAw9yDjGxEnnLAU7uh2zKyKI';

// --- Workshop Data (Mapped from PurpleBlue House PDF) ---
const QUESTIONS = [
  { id: 'q1', type: 'text', text: "Let's imagine India in 2070. Write one headline you would like to read about India in 2070.", explanation: "Forces us to think about the ultimate end-goal and real-world impact of the initiative." },
  { id: 'q2', type: 'text', text: "Where does NZI sit in this future? What part did it play?", explanation: "Clarifies NZI's specific contribution to that ideal future." },
  { id: 'q3', type: 'text', text: "Write 3 adjectives that describe the brand's essence in the future.", explanation: "Distills the brand's personality into its simplest, most memorable form." },
  { id: 'q4', type: 'text', text: "Meet the Person: Who are we building this for? (Describe their role, city, and what they seek from NZI)", explanation: "Ensures the brand is speaking to a specific, real person rather than a generic crowd." },
  { id: 'q5', type: 'text', text: "Fill in the blank: Without NZI, India would struggle to...", explanation: "Defines the brand's core utility and what is at stake if it fails." },
  { id: 'q6', type: 'text', text: "What are the 5 touchpoints that matter the most for people experiencing NZI?", explanation: "Identifies where the brand actually lives in the real world (website, reports, events, etc)." },
  { id: 'q7', type: 'choice', text: "If NZI were a person, which personality aligns best? (Round 1)", options: ["Mukesh Ambani (Authoritative, strategic)", "Bear Grylls (Adventurous, risk-taking)", "None of the above"], explanation: "Uses familiar personalities to quickly align on complex behavioral traits." },
  { id: 'q8', type: 'choice', text: "If NZI were a person, which personality aligns best? (Round 2)", options: ["Steve Jobs (Innovative, perfectionist)", "Lata Mangeshkar (Pure, emotionally uplifting)", "None of the above"], explanation: "Uses familiar personalities to quickly align on complex behavioral traits." },
  { id: 'q9', type: 'choice', text: "If NZI were a person, which personality aligns best? (Round 3)", options: ["A.P.J. Abdul Kalam (Wise, guiding)", "Sudha Murty (Compassionate, nurturing)", "None of the above"], explanation: "Uses familiar personalities to quickly align on complex behavioral traits." },
  { id: 'q10', type: 'choice', text: "If NZI were a person, which personality aligns best? (Round 4)", options: ["Bhagat Singh (Disruptive, bold)", "Walt Disney (Imaginative, visionary)", "None of the above"], explanation: "Uses familiar personalities to quickly align on complex behavioral traits." },
  { id: 'q11', type: 'choice', text: "If NZI were a person, which personality aligns best? (Round 5)", options: ["Johny Lever (Playful, witty)", "Ratan Tata (Humble, relatable)", "None of the above"], explanation: "Uses familiar personalities to quickly align on complex behavioral traits." },
  { id: 'q12', type: 'choice', text: "Based on the personalities, which primary Brand Archetype should NZI adopt?", options: ["The Ruler (Authority, Legacy)", "The Sage (Knowledge, Strategy)", "The Hero (Courageous, Mission-driven)", "The Outlaw (Disruptive, Bold)"], explanation: "Assigns a globally recognized psychological archetype to guide all future messaging and design." },
  { id: 'q13', type: 'choice', text: "Which SDG area must India prioritise most strongly over the next 50 years?", options: ["Affordable & Clean Energy", "Sustainable Cities & Communities", "Industry, Innovation & Infrastructure", "Climate Action"], explanation: "Connects the brand's mission to actionable, globally recognized sustainability goals." },
  { id: 'q14', type: 'choice', text: "Where does NZI sit on the positioning matrix?", options: ["Legacy & Heritage", "Disruptive Innovation", "Intellectual & Functional Authority", "Cultural Resonance"], explanation: "Plots the brand against competitors to find a unique, ownable white space in the market." },
  { id: 'q15', type: 'text', text: "What are 5 emotions people should instantly recognise and associate with NZI as a brand?", explanation: "Defines the immediate gut-reaction the brand should evoke when encountered." }
];

export default function WebsiteWorkshopApp() {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [animateState, setAnimateState] = useState('enter'); 
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // User Details
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // AI & Cloud States
  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle'); // idle, saving, success, error

  const changeStep = (newStep) => {
    setAnimateState('exit');
    setShowExplanation(false);
    setTimeout(() => {
      setStep(newStep);
      setAnimateState('enter');
      if (newStep > 0 && newStep <= QUESTIONS.length) {
        const q = QUESTIONS[newStep - 1];
        if (q.type === 'text') {
          setInputValue(answers[q.id] || '');
        }
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

  const handleTextSubmit = (questionId) => {
    if (!inputValue.trim()) return;
    setAnswers(prev => ({ ...prev, [questionId]: inputValue }));
    setInputValue('');
    changeStep(step + 1);
  };

  const handleKeyDown = (e, questionId) => {
    if (e.key === 'Enter') {
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
      const qaText = QUESTIONS.map(q => `Q: ${q.text}\nA: ${answers[q.id] || 'Not answered'}`).join('\n\n');
      const systemPrompt = "Act as an expert brand strategist from PurpleBlue House. Provide a concise, 2-paragraph executive summary outlining the brand's future vision, archetype, and positioning strategy based on the user's workshop answers. DO NOT use markdown like asterisks for bolding. Use plain text paragraphs only.";
      const userPrompt = `Workshop Participant: ${userName} (${userEmail})\n\nBased on the following answers from the PurpleBlue House Branding Workshop for 'NetZero India', provide the executive brand summary.\n\nWorkshop Data:\n${qaText}`;
      
      if (!apiKey) {
        generatedText = "API Key not found in environment variables. Based on the selected parameters, the NetZero India platform should prioritize a clear, authoritative architecture that aligns perfectly with the chosen archetype, audience, and functional goals.";
      } else {
        const payload = {
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 500 }
        };

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const data = await response.json();
        if (data.candidates && data.candidates[0]) {
          generatedText = data.candidates[0].content.parts[0].text;
        } else {
          generatedText = "Summary generation completed with default strategic parameters.";
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      generatedText = "An error occurred while generating the AI summary. Please proceed with the manual export.";
    } finally {
      setAiSummary(generatedText);
      setIsGeneratingSummary(false);
      // Fire off to Supabase once AI is done
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
    
    setTimeout(() => {
      try {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'in',
          format: 'letter'
        });

        const margin = 0.75;
        const pageWidth = 8.5;
        const pageHeight = 11;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        const addHeaderFooter = (pageNumber) => {
          pdf.setFontSize(10);
          pdf.setTextColor(80, 80, 80);
          pdf.text('NetZero India | PurpleBlue House Branding Workshop', margin, 0.4);
          pdf.setFontSize(8);
          pdf.text(`Participant: ${userName}`, margin, 0.55);
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.01);
          pdf.line(margin, 0.65, pageWidth - margin, 0.65);
          pdf.text(`Page ${pageNumber}`, pageWidth - margin - 0.3, pageHeight - 0.4);
        };

        pdf.setFont("helvetica");
        addHeaderFooter(1);
        currentY = 1.0;

        pdf.setFontSize(22);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Brand Strategy Blueprint', margin, currentY);
        currentY += 0.4;

        if (aiSummary) {
          pdf.setFontSize(10);
          pdf.setTextColor(0, 100, 0);
          pdf.text('AI EXECUTIVE SUMMARY', margin, currentY);
          currentY += 0.2;
          
          pdf.setFontSize(10);
          pdf.setTextColor(50, 50, 50);
          const splitSummary = pdf.splitTextToSize(aiSummary, contentWidth);
          pdf.text(splitSummary, margin, currentY);
          currentY += (splitSummary.length * 0.2) + 0.3;
        }

        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.02);
        pdf.line(margin, currentY, pageWidth - margin, currentY);
        currentY += 0.4;

        QUESTIONS.forEach((q, idx) => {
          if (currentY > pageHeight - 1.5) {
            pdf.addPage();
            addHeaderFooter(pdf.internal.getNumberOfPages());
            currentY = 1.0;
          }

          pdf.setFontSize(9);
          pdf.setTextColor(120, 120, 120);
          const qText = `PARAMETER ${String(idx + 1).padStart(2, '0')}: ${q.text}`;
          const splitQ = pdf.splitTextToSize(qText, contentWidth);
          pdf.text(splitQ, margin, currentY);
          currentY += (splitQ.length * 0.15) + 0.1;

          pdf.setFontSize(11);
          pdf.setTextColor(0, 0, 0);
          const ansText = answers[q.id] || "—";
          const splitA = pdf.splitTextToSize(ansText, contentWidth - 0.2);
          pdf.text(splitA, margin + 0.2, currentY);
          
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.01);
          pdf.line(margin, currentY - 0.1, margin, currentY + (splitA.length * 0.18));

          currentY += (splitA.length * 0.2) + 0.3;
        });

        pdf.save('NZI_Brand_Blueprint.pdf');
      } catch (err) {
        console.error("PDF Generation failed", err);
      } finally {
        setIsGeneratingPDF(false);
      }
    }, 100); 
  };

  const currentQuestion = step > 0 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : null;

  return (
    <div className="h-screen w-full bg-slate-50 text-black overflow-hidden flex flex-col font-sans selection:bg-blue-900 selection:text-white">
      
      {/* Global CSS for Poppins, Glassmorphism, and Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');
        
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

        .fade-enter { opacity: 0; transform: translateY(15px); }
        .fade-active { opacity: 1; transform: translateY(0); transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1); }
        .fade-exit { opacity: 0; transform: translateY(-15px); transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
        
        .glass-panel {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03), inset 0 0 0 1px rgba(255,255,255,0.8);
        }
        
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
      `}} />
      
      <div className="bg-grid"></div>

      {/* Header - Fixed Top */}
      <header className="w-full px-8 py-5 flex items-center justify-between z-20 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-950 to-emerald-950 flex items-center justify-center shadow-md">
            <Globe className="text-white w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight text-black leading-none">NetZero India</h1>
            <p className="text-[9px] font-medium text-black/50 uppercase tracking-widest mt-0.5">Brand Strategy</p>
          </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col flex-1 overflow-y-auto custom-scroll pb-12">
        <div className={`flex flex-col w-full my-auto transition-all duration-500 ${animateState === 'enter' ? 'fade-enter' : animateState === 'active' ? 'fade-active' : 'fade-exit'}`}>
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="w-full text-center flex flex-col items-center glass-panel p-10 md:p-16 rounded-[2rem]">
              <div className="inline-block border border-black/10 bg-black/5 px-4 py-1.5 mb-6 rounded-full text-[9px] font-semibold tracking-widest uppercase">
                Phase 3: Brand Identity
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-black">
                Brand Strategy Workshop
              </h2>
              <p className="text-xs text-black/60 mb-10 max-w-sm mx-auto leading-relaxed font-normal">
                A 15-step interactive diagnostic to define the precise role, audience, and archetype for the NetZero India identity.
              </p>

              {/* User Details Form */}
              <div className="w-full max-w-sm mx-auto mb-10 space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-semibold text-black/50 uppercase tracking-widest mb-1.5 ml-1">Your Name</label>
                  <input 
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full bg-white/60 border border-white focus:border-blue-900/30 focus:bg-white rounded-2xl text-xs py-3.5 px-5 outline-none transition-all shadow-sm placeholder-black/30 text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-black/50 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-white/60 border border-white focus:border-blue-900/30 focus:bg-white rounded-2xl text-xs py-3.5 px-5 outline-none transition-all shadow-sm placeholder-black/30 text-black font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={() => changeStep(1)}
                disabled={!userName.trim() || !userEmail.includes('@')}
                className="flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-950/95 to-emerald-950/95 backdrop-blur-md border border-white/10 text-white rounded-2xl font-medium text-xs hover:opacity-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed"
              >
                Begin Workshop <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEPS 1-15: QUESTIONS */}
          {currentQuestion && (
            <div className="w-full glass-panel p-8 md:p-12 rounded-[2rem]">
              
              {/* Progress & Tooltip Header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-black/5">
                <span className="font-medium tracking-widest uppercase text-[10px] text-black/40">Step {String(step).padStart(2, '0')} of {QUESTIONS.length}</span>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-widest transition-colors px-3 py-1.5 rounded-full ${showExplanation ? 'bg-black text-white' : 'bg-black/5 text-black/50 hover:bg-black/10'}`}
                >
                  <Info className="w-3 h-3" /> {showExplanation ? 'Close' : 'Why ask this?'}
                </button>
              </div>

              {/* Tooltip Explanation Box */}
              {showExplanation && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed font-medium shadow-inner animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold mr-1">Insight:</span> {currentQuestion.explanation}
                </div>
              )}

              <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-8 leading-snug text-black">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'text' ? (
                <div className="flex flex-col gap-6">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, currentQuestion.id)}
                    placeholder="Type your answer here..."
                    className="w-full bg-white/60 border border-white rounded-2xl text-sm py-4 px-5 focus:border-blue-900/30 focus:bg-white outline-none shadow-sm placeholder-black/20 font-medium transition-all"
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-4">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-[10px] font-semibold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      <ArrowLeft className="mr-2 w-3 h-3" /> Back
                    </button>
                    <button 
                      onClick={() => handleTextSubmit(currentQuestion.id)}
                      disabled={!inputValue.trim()}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-950/95 to-emerald-950/95 text-white border border-white/10 rounded-2xl font-medium text-xs disabled:opacity-30 hover:opacity-100 hover:shadow-md transition-all"
                    >
                      Next <ArrowRight className="ml-2 w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChoice(currentQuestion.id, opt)}
                        className={`text-left p-4 rounded-2xl border font-medium text-xs transition-all duration-200 flex justify-between items-center group
                          ${answers[currentQuestion.id] === opt 
                            ? 'bg-gradient-to-r from-blue-950/95 to-emerald-950/95 border-white/10 text-white shadow-md' 
                            : 'bg-white/60 border-white text-black/70 hover:bg-white hover:shadow-sm'}`}
                      >
                        <span>{opt}</span>
                        {answers[currentQuestion.id] === opt && <Check className="w-4 h-4" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-6 flex justify-start">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-[10px] font-semibold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      <ArrowLeft className="mr-2 w-3 h-3" /> Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 16: SUMMARY / DATA EXPORT */}
          {step === QUESTIONS.length + 1 && (
            <div className="w-full">
              <div className="glass-panel rounded-[2rem] p-8 md:p-12 relative overflow-hidden">
                
                {/* Header for Summary */}
                <div className="mb-6 border-b border-black/5 pb-4 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-black mb-1">Brand Blueprint</h2>
                    <p className="text-[10px] text-black/50 uppercase tracking-widest font-medium">Review & Export Strategy</p>
                  </div>
                  
                  {/* Supabase Sync Status Indicator */}
                  <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-semibold">
                    {syncStatus === 'saving' && <span className="text-black/50 animate-pulse">Syncing...</span>}
                    {syncStatus === 'success' && <><CheckCircle className="w-3 h-3 text-emerald-600" /><span className="text-emerald-600">Saved to Cloud</span></>}
                    {syncStatus === 'error' && <><CloudOff className="w-3 h-3 text-red-500" /><span className="text-red-500">Sync Failed</span></>}
                  </div>
                </div>

                {/* Participant Details Box */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8 bg-white/40 rounded-2xl p-4 border border-white shadow-sm">
                  <div>
                    <div className="text-[9px] font-semibold text-black/40 uppercase tracking-widest mb-0.5">Participant Name</div>
                    <div className="text-xs font-semibold text-black">{userName}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-semibold text-black/40 uppercase tracking-widest mb-0.5">Email Address</div>
                    <div className="text-xs font-semibold text-black">{userEmail}</div>
                  </div>
                </div>

                {/* AI Executive Summary Box */}
                <div className="mb-8 bg-gradient-to-br from-blue-50/80 to-emerald-50/80 border border-blue-900/10 rounded-2xl p-5 relative shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-900" />
                    <h3 className="text-[10px] font-semibold text-blue-900 uppercase tracking-widest">AI Brand Summary</h3>
                  </div>
                  {isGeneratingSummary ? (
                    <div className="flex items-center gap-3 text-xs text-black/50 font-medium py-4">
                      <div className="w-4 h-4 border-2 border-black/20 border-t-blue-900 rounded-full animate-spin"></div>
                      Synthesizing strategic brand architecture...
                    </div>
                  ) : (
                    <div className="text-xs text-black/80 leading-relaxed font-medium space-y-3 whitespace-pre-wrap">
                      {aiSummary}
                    </div>
                  )}
                </div>

                {/* Responses List (Scrollable Area) */}
                <div className="mb-8 max-h-[300px] overflow-y-auto custom-scroll pr-3 space-y-3">
                  <h3 className="text-[10px] font-semibold text-black uppercase tracking-widest mb-3 sticky top-0 bg-white/80 backdrop-blur pt-1 pb-2 z-10">Workshop Data Log</h3>
                  {QUESTIONS.map((q, idx) => (
                    <div key={q.id} className="bg-white/50 rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
                      <div className="text-[9px] font-semibold text-black/40 uppercase tracking-wider mb-1.5 flex gap-2">
                        <span>{String(idx + 1).padStart(2, '0')}.</span>
                        <span>{q.text}</span>
                      </div>
                      <div className="text-xs font-semibold text-black">
                        {answers[q.id] || "—"}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={exportPDF}
                    disabled={isGeneratingPDF || isGeneratingSummary}
                    className="flex-1 flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-950/95 to-emerald-950/95 text-white border border-white/10 rounded-2xl font-medium text-xs hover:opacity-100 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <span className="animate-pulse">Generating PDF...</span>
                    ) : (
                      <><Download className="mr-2 w-4 h-4" /> Export as PDF</>
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setAnswers({});
                      setAiSummary(null);
                      setUserName('');
                      setUserEmail('');
                      setSyncStatus('idle');
                      changeStep(0);
                    }}
                    className="flex-1 flex items-center justify-center px-6 py-3.5 bg-white/60 backdrop-blur-sm border border-white text-black/70 rounded-2xl font-medium text-xs hover:bg-white hover:text-black hover:shadow-sm transition-all duration-300"
                  >
                    <RefreshCcw className="mr-2 w-4 h-4" /> Reset Workshop
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer - Fixed Bottom */}
      <footer className="w-full px-8 py-4 flex items-center justify-center bg-gradient-to-r from-blue-950 to-emerald-950 text-white/80 text-[9px] tracking-[0.2em] uppercase font-semibold z-20 flex-shrink-0">
         PurpleBlue House © 2026 | Brand Strategy Workshop
      </footer>
      
    </div>
  );
}
