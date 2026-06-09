import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, RefreshCcw, Download, Info, Globe, Sparkles, CloudOff, CheckCircle } from 'lucide-react';

// --- Supabase Configuration ---
const SUPABASE_URL = import.meta.env?.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = import.meta.env?.VITE_SUPABASE_SERVICE_KEY;

// --- Website Strategy Workshop Data ---
const QUESTIONS = [
  { 
    id: 'q1', 
    type: 'choice', 
    text: "Who is the absolute primary audience this website must convert or engage?", 
    options: ["Policymakers & Government Officials", "Corporate Sustainability Leaders", "Academic Researchers & Think Tanks", "The General Public / Grassroots"],
    explanation: "Forces priority. A website designed for policymakers requires deep data architecture; one for the public needs emotional storytelling."
  },
  { 
    id: 'q2', 
    type: 'choice', 
    text: "What is the single most critical action a user should take on the homepage?", 
    options: ["Download a strategic report / framework", "Sign up for community updates", "Explore an interactive data dashboard", "Contact the team for collaboration"],
    explanation: "Defines the primary User Journey (UX). The 'Hero' section of the site will be engineered entirely around driving this one specific action."
  },
  { 
    id: 'q3', 
    type: 'choice', 
    text: "Which of these best describes the desired visual aesthetic (UI)?", 
    options: ["Corporate & Authoritative (Navy blues, structured grids)", "Academic & Data-Driven (Minimalist, heavy white space)", "Vibrant & Community-Focused (Warm colors, illustrations)", "High-Tech & Futuristic (Dark mode, neon accents)"],
    explanation: "Aligns the visual design language with the brand's archetype to ensure the site 'looks' like how the organization behaves."
  },
  { 
    id: 'q4', 
    type: 'choice', 
    text: "How should complex data and reports be presented?", 
    options: ["Downloadable PDF reports only", "Interactive, filterable web dashboards", "Simplified infographics and summaries", "Dense, academic-style long-form articles"],
    explanation: "Data architecture is critical for a NetZero initiative. This defines the backend requirements and front-end data visualization strategy."
  },
  { 
    id: 'q5', 
    type: 'choice', 
    text: "What is the primary tone of voice for the website copy?", 
    options: ["Urgent & Action-Oriented (The Hero)", "Wise, Objective & Educational (The Sage)", "Authoritative & Directing (The Ruler)", "Inspiring & Visionary (The Creator)"],
    explanation: "Copywriting dictates how the brand sounds. This ensures consistency across all headlines, buttons, and about pages."
  },
  { 
    id: 'q6', 
    type: 'ranking', 
    text: "Rank these 3 website goals in order of importance (Select 1st, 2nd, 3rd).", 
    options: ["Establishing Global Credibility", "Driving Local Community Action", "Showcasing Technical Innovation"],
    explanation: "When resources are limited, ranking forces leadership to decide what the website must accomplish first before anything else."
  },
  { 
    id: 'q7', 
    type: 'choice', 
    text: "How should the 'About Us' section be structured?", 
    options: ["Focus on the founding legacy and history", "Focus on the team's academic/technical credentials", "Focus on the future vision and roadmap to 2070", "Focus on community impact and stories"],
    explanation: "Determines how trust is built. Do we build trust through past achievements, current expertise, or future vision?"
  },
  { 
    id: 'q8', 
    type: 'choice', 
    text: "What type of imagery should dominate the website?", 
    options: ["Real people and community action shots", "High-tech clean energy infrastructure", "Abstract, clean data visualizations", "Premium, corporate leadership environments"],
    explanation: "Photography and imagery create the immediate emotional connection. This dictates the art direction for the entire digital platform."
  },
  { 
    id: 'q9', 
    type: 'choice', 
    text: "How frequently will the website content be updated?", 
    options: ["Rarely (Static brochure site)", "Monthly (New reports and major updates)", "Weekly (Active blog and newsroom)", "Daily (Live data feeds and community tracking)"],
    explanation: "Critical for Content Management System (CMS) selection. A static site requires a different backend than a daily newsroom."
  },
  { 
    id: 'q10', 
    type: 'choice', 
    text: "What is the primary technical requirement for the platform?", 
    options: ["Extreme mobile responsiveness (Grassroots)", "High security and data privacy (Corporate)", "Flawless accessibility for all users (Government)", "High-speed rendering of complex 3D/Data (Tech)"],
    explanation: "Defines the core development focus. Guides the engineering team on where to spend their technical optimization budget."
  },
  { 
    id: 'q11', 
    type: 'text', 
    text: "In one sentence, what is the core message the website must communicate within the first 3 seconds of a user landing?", 
    explanation: "The 'Blink Test'. This forces the distillation of the entire brand strategy into a single, punchy Hero Headline."
  }
];

export default function WebsiteWorkshopApp() {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [rankingState, setRankingState] = useState([]); // For ranking questions
  const [animateState, setAnimateState] = useState('enter'); 
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  
  // User Details
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');

  // AI & Cloud States
  const [aiSummary, setAiSummary] = useState(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');

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
      
      // Format answers for AI
      const qaText = QUESTIONS.map(q => {
        let ans = answers[q.id] || 'Not answered';
        if (Array.isArray(ans)) {
          ans = `1st: ${ans[0]}, 2nd: ${ans[1]}, 3rd: ${ans[2]}`;
        }
        return `Q: ${q.text}\nA: ${ans}`;
      }).join('\n\n');

      const systemPrompt = `You are a world-class Digital Strategist and UX/UI Architect at a top-tier agency. 
      Your task is to analyze the user's answers from a website strategy workshop for 'NetZero India' and output a concrete, highly actionable 3-paragraph Website Architecture Brief.
      
      Paragraph 1: User Experience (UX) & Core Architecture. Define the primary user journey, the hierarchy of information based on their priorities, and the backend/CMS requirements implied by their update frequency.
      Paragraph 2: User Interface (UI) & Visual Aesthetic. Dictate the specific art direction, color palette tone, typography vibe, and imagery style based on their selections.
      Paragraph 3: Content Strategy & Tone. Summarize how the copywriting should sound, how data should be visualized, and how the 'About' narrative should build trust.
      
      DO NOT use markdown (no asterisks, no hash symbols). Use professional, agency-level plain text. Be definitive and concrete—do not say "consider doing X", say "The architecture will prioritize X".`;
      
      const userPrompt = `Workshop Participant: ${userName} (${userEmail})\n\nWorkshop Data:\n${qaText}`;
      
      if (!apiKey) {
        generatedText = "API Key not found. Please add your VITE_GEMINI_API_KEY to generate the deep AI UX analysis.";
      } else {
        const payload = {
          contents: [{ parts: [{ text: systemPrompt + "\n\n" + userPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 }
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
          generatedText = "Analysis generation failed. Check API limits.";
        }
      }
    } catch (error) {
      console.error("AI Generation Error:", error);
      generatedText = "An error occurred while generating the AI architecture brief.";
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
    
    const generate = () => {
      try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF({ orientation: 'portrait', unit: 'in', format: 'letter' });
        const margin = 0.75;
        const pageWidth = 8.5;
        const pageHeight = 11;
        const contentWidth = pageWidth - (margin * 2);
        let currentY = margin;

        const addHeaderFooter = (pageNumber) => {
          pdf.setFontSize(10);
          pdf.setTextColor(80, 80, 80);
          pdf.text('NetZero India | Website Architecture Blueprint', margin, 0.4);
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
        pdf.text('Digital Architecture Brief', margin, currentY);
        currentY += 0.4;

        if (aiSummary) {
          pdf.setFontSize(10);
          pdf.setTextColor(0, 100, 0);
          pdf.text('AI UX/UI STRATEGY ANALYSIS', margin, currentY);
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
          
          let ansText = answers[q.id] || "—";
          if (Array.isArray(ansText)) {
            ansText = `1st: ${ansText[0]}\n2nd: ${ansText[1]}\n3rd: ${ansText[2]}`;
          }

          const splitA = pdf.splitTextToSize(ansText, contentWidth - 0.2);
          pdf.text(splitA, margin + 0.2, currentY);
          
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.01);
          pdf.line(margin, currentY - 0.1, margin, currentY + (splitA.length * 0.18));

          currentY += (splitA.length * 0.2) + 0.3;
        });

        pdf.save('NZI_Website_Architecture_Brief.pdf');
      } catch (err) {
        console.error("PDF Generation failed", err);
      } finally {
        setIsGeneratingPDF(false);
      }
    };

    if (!window.jspdf) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = generate;
      document.head.appendChild(script);
    } else {
      generate();
    }
  };

  const currentQuestion = step > 0 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : null;

  return (
    <div className="h-screen w-full bg-slate-50 text-black overflow-hidden flex flex-col font-sans selection:bg-blue-950 selection:text-white relative">
      
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
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border: 1px solid rgba(255, 255, 255, 1);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.05), inset 0 0 0 1px rgba(255,255,255,0.8);
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
            <p className="text-[9px] font-medium text-black/50 uppercase tracking-widest mt-0.5">Website Strategy UI/UX</p>
          </div>
        </div>
      </header>

      {/* Main Content Area - Scrollable */}
      <div className="relative z-10 w-full max-w-3xl mx-auto px-6 flex flex-col flex-1 overflow-y-auto custom-scroll pb-12">
        <div className={`flex flex-col w-full my-auto transition-all duration-500 ${animateState === 'enter' ? 'fade-enter' : animateState === 'active' ? 'fade-active' : 'fade-exit'}`}>
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="w-full text-center flex flex-col items-center glass-panel p-10 md:p-16 rounded-3xl">
              <div className="inline-block border border-black/10 bg-black/5 px-4 py-1.5 mb-6 rounded-full text-[10px] font-semibold tracking-widest uppercase">
                Phase 4: Digital Experience
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-black">
                Website Architecture Workshop
              </h2>
              <p className="text-sm text-black/60 mb-10 max-w-md mx-auto leading-relaxed font-normal">
                A 11-step interactive diagnostic to define the precise user experience, content strategy, and visual aesthetic for the new NetZero India digital platform.
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
                    className="w-full bg-white/60 border border-white focus:border-blue-900/30 focus:bg-white rounded-2xl text-sm py-3.5 px-5 outline-none transition-all shadow-sm placeholder-black/30 text-black font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-black/50 uppercase tracking-widest mb-1.5 ml-1">Email Address</label>
                  <input 
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-white/60 border border-white focus:border-blue-900/30 focus:bg-white rounded-2xl text-sm py-3.5 px-5 outline-none transition-all shadow-sm placeholder-black/30 text-black font-medium"
                  />
                </div>
              </div>

              <button 
                onClick={() => changeStep(1)}
                disabled={!userName.trim() || !userEmail.includes('@')}
                className="flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 backdrop-blur-md border border-white/10 text-white rounded-2xl font-medium text-sm hover:opacity-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none disabled:cursor-not-allowed"
              >
                Begin UI/UX Diagnostic <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEPS 1-11: QUESTIONS */}
          {currentQuestion && (
            <div className="w-full glass-panel p-8 md:p-12 rounded-3xl">
              
              {/* Progress & Tooltip Header */}
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-black/5">
                <span className="font-medium tracking-widest uppercase text-[10px] text-black/40">Step {String(step).padStart(2, '0')} of {QUESTIONS.length}</span>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest transition-colors px-3 py-1.5 rounded-full ${showExplanation ? 'bg-black text-white' : 'bg-black/5 text-black/50 hover:bg-black/10'}`}
                >
                  <Info className="w-3 h-3" /> {showExplanation ? 'Close' : 'Why ask this?'}
                </button>
              </div>

              {/* Tooltip Explanation Box */}
              {showExplanation && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 leading-relaxed font-medium shadow-inner animate-in fade-in slide-in-from-top-2">
                  <span className="font-bold mr-1">Architecture Insight:</span> {currentQuestion.explanation}
                </div>
              )}

              <h2 className="text-xl md:text-2xl font-semibold tracking-tight mb-8 leading-snug text-black">
                {currentQuestion.text}
              </h2>

              {currentQuestion.type === 'text' && (
                <div className="flex flex-col gap-6">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, currentQuestion.id)}
                    placeholder="Type your core message..."
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
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 text-white border border-white/10 rounded-2xl font-medium text-xs disabled:opacity-30 hover:opacity-100 hover:shadow-md transition-all"
                    >
                      Finalize Strategy <ArrowRight className="ml-2 w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}

              {currentQuestion.type === 'choice' && (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChoice(currentQuestion.id, opt)}
                        className={`text-left p-4 rounded-2xl border font-medium text-xs transition-all duration-200 flex justify-between items-center group
                          ${answers[currentQuestion.id] === opt 
                            ? 'bg-gradient-to-r from-blue-950/90 to-emerald-950/90 border-white/10 text-white shadow-md' 
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

              {currentQuestion.type === 'ranking' && (
                <div className="flex flex-col gap-4">
                  <p className="text-xs text-black/50 font-medium mb-2">Select exactly 3 options in order of priority (1st, 2nd, 3rd).</p>
                  <div className="grid grid-cols-1 gap-3">
                    {currentQuestion.options.map((opt, idx) => {
                      const rankIndex = rankingState.indexOf(opt);
                      const isSelected = rankIndex !== -1;
                      return (
                        <button
                          key={idx}
                          onClick={() => handleRankingChoice(currentQuestion.id, opt)}
                          className={`text-left p-4 rounded-2xl border font-medium text-xs transition-all duration-200 flex items-center group
                            ${isSelected
                              ? 'bg-gradient-to-r from-blue-950/90 to-emerald-950/90 border-white/10 text-white shadow-md' 
                              : 'bg-white/60 border-white text-black/70 hover:bg-white hover:shadow-sm'}`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-[10px] font-bold border transition-all ${isSelected ? 'bg-white text-blue-950 border-white' : 'bg-transparent border-black/20 text-black/30'}`}>
                            {isSelected ? rankIndex + 1 : ''}
                          </div>
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-[10px] font-semibold uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      <ArrowLeft className="mr-2 w-3 h-3" /> Back
                    </button>
                    <button 
                      onClick={() => submitRanking(currentQuestion.id)}
                      disabled={rankingState.length !== 3}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 text-white border border-white/10 rounded-2xl font-medium text-xs disabled:opacity-30 hover:opacity-100 hover:shadow-md transition-all"
                    >
                      Next <ArrowRight className="ml-2 w-3 h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 12: SUMMARY / DATA EXPORT */}
          {step === QUESTIONS.length + 1 && (
            <div className="w-full">
              <div className="glass-panel rounded-3xl p-8 md:p-12 relative overflow-hidden">
                
                {/* Header for Summary */}
                <div className="mb-6 border-b border-black/5 pb-4 flex justify-between items-end">
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-black mb-1">Architecture Blueprint</h2>
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

                {/* AI UX Strategy Summary Box */}
                <div className="mb-8 bg-gradient-to-br from-blue-50/80 to-emerald-50/80 border border-blue-900/10 rounded-2xl p-5 relative shadow-inner">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-blue-900" />
                    <h3 className="text-[10px] font-semibold text-blue-900 uppercase tracking-widest">AI UX/UI Strategy Analysis</h3>
                  </div>
                  {isGeneratingSummary ? (
                    <div className="flex flex-col gap-3">
                       <div className="flex items-center gap-3 text-xs text-black/50 font-medium py-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-blue-900 rounded-full animate-spin"></div>
                        Synthesizing website architecture & user journey...
                      </div>
                      <div className="space-y-2 opacity-40">
                         <div className="h-2 bg-blue-900/20 rounded w-full animate-pulse"></div>
                         <div className="h-2 bg-blue-900/20 rounded w-5/6 animate-pulse"></div>
                         <div className="h-2 bg-blue-900/20 rounded w-4/6 animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-black/80 leading-relaxed font-medium space-y-4 whitespace-pre-wrap">
                      {aiSummary}
                    </div>
                  )}
                </div>

                {/* Responses List (Scrollable Area) */}
                <div className="mb-8 max-h-[300px] overflow-y-auto custom-scroll pr-3 space-y-3">
                  <h3 className="text-[10px] font-semibold text-black uppercase tracking-widest mb-3 sticky top-0 bg-white/80 backdrop-blur pt-1 pb-2 z-10">Diagnostic Data Log</h3>
                  {QUESTIONS.map((q, idx) => {
                    let ansText = answers[q.id] || "—";
                    if (Array.isArray(ansText)) {
                      ansText = `1st: ${ansText[0]} | 2nd: ${ansText[1]} | 3rd: ${ansText[2]}`;
                    }

                    return (
                      <div key={q.id} className="bg-white/50 rounded-xl p-4 border border-white shadow-sm hover:shadow-md transition-shadow">
                        <div className="text-[9px] font-semibold text-black/40 uppercase tracking-wider mb-1.5 flex gap-2">
                          <span>{String(idx + 1).padStart(2, '0')}.</span>
                          <span>{q.text}</span>
                        </div>
                        <div className="text-xs font-semibold text-black">
                          {ansText}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button 
                    onClick={exportPDF}
                    disabled={isGeneratingPDF || isGeneratingSummary}
                    className="flex-1 flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 text-white border border-white/10 rounded-2xl font-medium text-xs hover:opacity-100 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                  >
                    {isGeneratingPDF ? (
                      <span className="animate-pulse">Generating Brief...</span>
                    ) : (
                      <><Download className="mr-2 w-4 h-4" /> Export Architecture Brief</>
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
                    className="flex-1 flex items-center justify-center px-6 py-3.5 bg-white/60 backdrop-blur-sm border border-white text-black/70 rounded-2xl font-medium text-xs hover:bg-white hover:text-black hover:shadow-sm transition-all duration-300"
                  >
                    <RefreshCcw className="mr-2 w-4 h-4" /> Restart Diagnostic
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer - Fixed Bottom */}
      <footer className="w-full px-8 py-4 flex items-center justify-center bg-gradient-to-r from-blue-950 to-emerald-950 text-white/80 text-[9px] tracking-[0.2em] uppercase font-semibold z-20 flex-shrink-0 shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
         NetZero India Foundation © 2026 | Website Strategy & Architecture Diagnostic
      </footer>
      
    </div>
  );
}
