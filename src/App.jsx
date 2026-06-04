import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, Check, RefreshCcw, Download, Globe, Info, Loader2 } from 'lucide-react';

// --- Website UI/UX Strategy Workshop Data ---
const QUESTIONS = [
  { 
    id: 'q1', type: 'choice', text: "What is the primary function of the new NZI website?", 
    options: ["Public Awareness & Storytelling", "Dense Policy & Academic Hub", "Interactive Data Dashboard", "Action & Community Engagement"],
    why: "This dictates the core architecture. A storytelling site needs large visuals and scroll-based narratives, whereas an academic hub requires robust search, categorization, and text-heavy layouts."
  },
  { 
    id: 'q2', type: 'choice', text: "Who is the primary user persona visiting the site?", 
    options: ["Government Policymakers", "Academic Researchers", "Corporate Leaders", "The General Public"],
    why: "Understanding the primary audience determines the reading level, the terminology used, and the complexity of the navigation."
  },
  { 
    id: 'q3', type: 'choice', text: "Which visual aesthetic best aligns with NZI's digital future?", 
    options: ["Minimalist & Data-Driven (Lots of white space)", "Earthy & Organic (Nature tones, textures)", "Bold & Brutalist (High contrast, large typography)", "High-Tech & Futuristic (Dark modes, neon accents)"],
    why: "This sets the fundamental art direction for UI components, color palettes, and spacing, ensuring the brand's emotion matches its visual output."
  },
  { 
    id: 'q4', type: 'choice', text: "How should we present complex climate and policy data?", 
    options: ["Interactive, clickable dashboards", "Simple, scannable infographics", "Downloadable PDF reports", "Long-form academic articles"],
    why: "Data visualization requires specific technical investments. Knowing this upfront decides whether we need charting libraries, illustrators, or simply a good document management system."
  },
  { 
    id: 'q5', type: 'choice', text: "What is the most critical element on the homepage?", 
    options: ["A powerful hero video or image", "Live progress trackers / statistics", "Latest research and publications", "Clear 'Take Action' pathways"],
    why: "The homepage hero section gets 80% of a user's attention. This choice defines the first 3 seconds of the user experience and what we prioritize loading first."
  },
  { 
    id: 'q6', type: 'choice', text: "What is the preferred style of photography and imagery?", 
    options: ["Real people and grassroots communities", "High-tech infrastructure and clean energy", "Abstract data visualizations", "Vast natural landscapes"],
    why: "Photography defines the 'soul' of the site. It tells us whether we need to schedule field photoshoots or rely on technical renderings and data art."
  },
  { 
    id: 'q7', type: 'choice', text: "How should the website's tone of voice read?", 
    options: ["Academic, formal, and authoritative", "Urgent, direct, and action-oriented", "Inspiring, visionary, and hopeful", "Accessible, simple, and conversational"],
    why: "This directly impacts the UX copywriting. Buttons, headings, and error messages will all be adapted to match this specific tone."
  },
  { 
    id: 'q8', type: 'choice', text: "What is the primary Call-To-Action (CTA) for visitors?", 
    options: ["Read our latest policy brief", "Join the NetZero network/newsletter", "Explore the data portal", "Contact us for partnerships"],
    why: "Every website needs a funnel. Knowing the primary CTA ensures we design pathways that guide users toward this specific action from every page."
  },
  { 
    id: 'q9', type: 'choice', text: "How should the website navigation be structured?", 
    options: ["Traditional top menu (Simple, visible)", "Mega-menu (Detailed, categorised dropdowns)", "Hidden hamburger menu (Clean, app-like)", "Sticky sidebar (Always accessible)"],
    why: "Navigation is the skeleton of UX. A mega-menu suggests high content volume, while a hamburger menu suggests a mobile-first, minimalist approach."
  },
  { 
    id: 'q10', type: 'choice', text: "What is our approach to device optimization?", 
    options: ["Mobile-first (For public accessibility)", "Desktop-first (For complex data reading)", "Equally balanced across all devices"],
    why: "While everything will be responsive, deciding the 'first' priority determines where we spend the most time perfecting micro-interactions and layouts."
  },
  { 
    id: 'q11', type: 'choice', text: "How should we highlight NZI's partnerships and legacy?", 
    options: ["A dedicated 'History & Partners' page", "A scrolling logo ticker on the homepage", "Integrated into case studies and stories", "Minimal focus; keep it about the future"],
    why: "This determines how much space is allocated to institutional credibility versus forward-looking actions and future projects."
  },
  { 
    id: 'q12', type: 'choice', text: "What interactive features are necessary for engagement?", 
    options: ["Carbon calculators or assessment tools", "Interactive maps of India's progress", "Discussion forums or comment sections", "No interactions; purely informational"],
    why: "Interactive features require backend development and databases. This helps scope the technical complexity of the website build."
  },
  { 
    id: 'q13', type: 'choice', text: "What is the priority for website performance?", 
    options: ["Ultra-fast loading (Low bandwidth optimized)", "High-end animations (Premium experience)", "Strict accessibility compliance (Screen readers)"],
    why: "We cannot have ultra-heavy 3D animations and ultra-fast low-bandwidth loading simultaneously. This sets the technical constraints for the developers."
  },
  { 
    id: 'q14', type: 'choice', text: "How frequently will the website content be updated?", 
    options: ["Daily (News, live stats)", "Weekly (Blogs, articles)", "Monthly (New reports, case studies)", "Rarely (Static informational brochure)"],
    why: "This dictates the choice of Content Management System (CMS). Daily updates require a highly flexible CMS, while rare updates might allow for a faster, static site."
  },
  { 
    id: 'q15', type: 'text', text: "In one sentence, what exactly should a user feel or remember right after closing the website?",
    why: "This is the ultimate benchmark for success. All design, copy, and structural decisions will be measured against whether they evoke this specific feeling."
  }
];

export default function WebsiteWorkshopApp() {
  const [step, setStep] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [inputValue, setInputValue] = useState('');
  const [animateState, setAnimateState] = useState('enter'); 
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const changeStep = (newStep) => {
    setAnimateState('exit');
    setShowExplanation(false); // Reset explanation on step change
    setTimeout(() => {
      setStep(newStep);
      setAnimateState('enter');
      if (newStep > 0 && newStep <= QUESTIONS.length) {
        const q = QUESTIONS[newStep - 1];
        if (q.type === 'text') {
          setInputValue(answers[q.id] || '');
        }
      }
    }, 300);
  };

  useEffect(() => {
    if (animateState === 'enter') {
      const timer = setTimeout(() => setAnimateState('active'), 50);
      return () => clearTimeout(timer);
    }
  }, [animateState, step]);

  const generatePDF = async () => {
    setIsGeneratingPDF(true);
    
    // Dynamically load html2pdf.js
    if (!window.html2pdf) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js";
      document.body.appendChild(script);
      await new Promise(resolve => script.onload = resolve);
    }

    // Target our dedicated, clean print container instead of the UI view
    const element = document.getElementById('print-container');
    
    const opt = {
      margin:       [0.8, 0.5, 0.8, 0.5], // [Top, Left, Bottom, Right] in inches
      filename:     'NetZero_Website_Blueprint.pdf',
      image:        { type: 'jpeg', quality: 1 },
      html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', letterRendering: true },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' },
      pagebreak:    { mode: 'avoid-all', inside: 'avoid' } // Prevent breaking inside items
    };

    window.html2pdf()
      .set(opt)
      .from(element)
      .toPdf()
      .get('pdf')
      .then(function (pdf) {
        // Inject Custom Headers and Footers on every page
        const totalPages = pdf.internal.getNumberOfPages();
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();

        for (let i = 1; i <= totalPages; i++) {
          pdf.setPage(i);

          // Custom Header
          pdf.setFontSize(10);
          pdf.setTextColor(80, 80, 80);
          pdf.text('NetZero India | Website Architecture Blueprint', 0.5, 0.4);
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.01);
          pdf.line(0.5, 0.48, pageWidth - 0.5, 0.48);

          // Custom Footer
          pdf.line(0.5, pageHeight - 0.48, pageWidth - 0.5, pageHeight - 0.48);
          pdf.setFontSize(8);
          pdf.setTextColor(120, 120, 120);
          pdf.text('Prepared by PurpleBlue House', 0.5, pageHeight - 0.35);
          pdf.text(`Page ${i} of ${totalPages}`, pageWidth - 0.9, pageHeight - 0.35);
        }
      })
      .save()
      .then(() => {
        setIsGeneratingPDF(false);
      });
  };

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

  const currentQuestion = step > 0 && step <= QUESTIONS.length ? QUESTIONS[step - 1] : null;

  return (
    <div className="min-h-screen w-full flex flex-col relative overflow-hidden bg-slate-50 text-black selection:bg-emerald-950 selection:text-white" style={{ fontFamily: "'Poppins', sans-serif" }}>
      
      {/* Google Font Import & Animated Grid Style */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600&display=swap');
        
        .animated-bg-grid {
          position: fixed;
          inset: -100%;
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
          transform-origin: center;
          animation: slideGrid 30s linear infinite;
          z-index: 0;
          pointer-events: none;
        }
        @keyframes slideGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(40px, 40px); }
        }
        
        /* Smooth Fade Transitions */
        .fade-enter { opacity: 0; transform: translateY(10px); }
        .fade-active { opacity: 1; transform: translateY(0); transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
        .fade-exit { opacity: 0; transform: translateY(-10px); transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1); }

        /* Glassmorphism Utilities */
        .glass-panel {
          background: rgba(255, 255, 255, 0.45);
          backdrop-filter: blur(24px) saturate(150%);
          -webkit-backdrop-filter: blur(24px) saturate(150%);
          border: 1px solid rgba(255, 255, 255, 0.7);
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.6);
        }
      `}} />
      
      <div className="animated-bg-grid"></div>

      {/* HEADER */}
      <header className="relative z-20 w-full px-6 py-4 flex justify-between items-center glass-panel sticky top-0 border-b border-white/50">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-950/90 to-emerald-950/90 backdrop-blur-md border border-white/20 text-white p-2 rounded-xl shadow-sm">
            <Globe size={18} />
          </div>
          <div>
            <h1 className="font-semibold text-sm tracking-wide leading-tight">NetZero India</h1>
            <p className="text-[10px] text-black/50 font-medium uppercase tracking-widest">Website Strategy UI/UX</p>
          </div>
        </div>
        
        {step > 0 && step <= QUESTIONS.length && (
          <div className="flex items-center gap-4">
            <div className="hidden md:block w-32 h-1.5 bg-black/5 rounded-full overflow-hidden inset-shadow-sm">
              <div 
                className="h-full bg-gradient-to-r from-blue-950 to-emerald-950 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${(step / QUESTIONS.length) * 100}%` }}
              />
            </div>
            <span className="font-medium text-xs text-black/50 bg-black/5 px-3 py-1 rounded-full border border-black/5">
              {String(step).padStart(2, '0')} / {QUESTIONS.length}
            </span>
          </div>
        )}
      </header>

      {/* MAIN WORKSPACE */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center w-full max-w-3xl mx-auto px-6 py-12">
        <div className={`w-full transition-all duration-500 ${animateState === 'enter' ? 'fade-enter' : animateState === 'active' ? 'fade-active' : 'fade-exit'}`}>
          
          {/* STEP 0: INTRO */}
          {step === 0 && (
            <div className="w-full text-center flex flex-col items-center glass-panel p-10 md:p-16 rounded-3xl">
              <div className="inline-block border border-black/10 bg-black/5 px-4 py-1.5 mb-6 rounded-full text-[10px] font-semibold tracking-widest uppercase">
                Phase 4: Digital Experience
              </div>
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4 text-black">
                Website Architecture Workshop
              </h1>
              <p className="text-sm text-black/60 mb-10 max-w-md mx-auto leading-relaxed font-light">
                A 15-step interactive diagnostic to define the precise user experience, content strategy, and visual aesthetic for the new NetZero India digital platform.
              </p>
              <button 
                onClick={() => changeStep(1)}
                className="flex items-center justify-center px-8 py-3.5 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 backdrop-blur-md border border-white/10 text-white rounded-2xl font-medium text-sm hover:opacity-100 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
              >
                Begin UI/UX Diagnostic
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEPS 1-15: QUESTIONS */}
          {currentQuestion && (
            <div className="w-full glass-panel p-8 md:p-12 rounded-3xl">
              
              <div className="flex items-start justify-between gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-medium tracking-tight leading-relaxed text-black">
                  {currentQuestion.text}
                </h2>
                <button 
                  onClick={() => setShowExplanation(!showExplanation)}
                  className={`mt-1 flex-shrink-0 p-2 rounded-full transition-all ${showExplanation ? 'bg-gradient-to-br from-blue-950/90 to-emerald-950/90 backdrop-blur-md border border-white/10 text-white shadow-md' : 'bg-black/5 text-black/40 hover:bg-black/10 hover:text-black'}`}
                  title="Why are we asking this?"
                >
                  <Info size={18} />
                </button>
              </div>

              {/* Tooltip / Explanation Box */}
              <div className={`overflow-hidden transition-all duration-300 ease-in-out ${showExplanation ? 'max-h-40 opacity-100 mb-8' : 'max-h-0 opacity-0 mb-0'}`}>
                <div className="p-4 bg-[#f8f9fa] border border-black/5 rounded-2xl text-xs text-black/70 leading-relaxed font-light">
                  <span className="font-semibold text-black mb-1 block flex items-center gap-1.5">
                    <Info size={12} /> Strategic Rationale:
                  </span>
                  {currentQuestion.why}
                </div>
              </div>

              {currentQuestion.type === 'text' ? (
                <div className="flex flex-col gap-6">
                  <input 
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, currentQuestion.id)}
                    placeholder="Type your perspective here..."
                    className="w-full bg-black/5 border border-transparent focus:border-black/20 focus:bg-white rounded-2xl text-base py-4 px-5 placeholder-black/30 outline-none transition-all"
                    autoFocus
                  />
                  <div className="flex justify-between items-center mt-6">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-xs font-semibold text-black/50 hover:text-black transition-colors px-4 py-2"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Back
                    </button>
                    <button 
                      onClick={() => handleTextSubmit(currentQuestion.id)}
                      disabled={!inputValue.trim()}
                      className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-950/90 to-emerald-950/90 backdrop-blur-md border border-white/10 text-white rounded-2xl font-medium text-sm disabled:opacity-30 hover:opacity-100 hover:shadow-lg transition-all"
                    >
                      Continue <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {currentQuestion.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleChoice(currentQuestion.id, opt)}
                        className={`text-left p-5 rounded-2xl border text-sm font-medium transition-all duration-300 flex justify-between items-center group
                          ${answers[currentQuestion.id] === opt 
                            ? 'bg-gradient-to-r from-blue-950/90 to-emerald-950/90 backdrop-blur-md text-white border-white/20 shadow-lg' 
                            : 'bg-white/40 border-white/60 text-black/70 hover:bg-white/80 hover:border-white/80 hover:text-black hover:shadow-sm'}`}
                      >
                        <span className="pr-4 leading-relaxed">{opt}</span>
                        {answers[currentQuestion.id] === opt && <Check className="w-4 h-4 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                  <div className="mt-8 flex justify-start">
                    <button 
                      onClick={() => changeStep(step - 1)}
                      className="flex items-center text-xs font-semibold text-black/50 hover:text-black transition-colors px-2 py-2"
                    >
                      <ArrowLeft className="mr-2 w-4 h-4" /> Go Back
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 16: SUMMARY / DATA EXPORT */}
          {step === QUESTIONS.length + 1 && (
            <div className="w-full pb-10">
              
              {/* HIDDEN PRINT CONTAINER FOR FLAWLESS PDF GENERATION */}
              <div className="absolute top-0 left-0 -z-50 opacity-0 pointer-events-none">
                <div id="print-container" className="w-[800px] bg-white p-8 text-black" style={{ fontFamily: "'Poppins', sans-serif" }}>
                  <div className="mb-8 border-b-2 border-black pb-4">
                    <h1 className="text-3xl font-bold mb-1 text-black">Website Architecture Blueprint</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">NetZero India Foundation x PurpleBlue House</p>
                  </div>

                  <div className="space-y-6">
                    {QUESTIONS.map((q, idx) => (
                      <div key={q.id} className="break-inside-avoid pb-4 border-b border-gray-200">
                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">
                          Parameter {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="font-bold text-sm text-gray-700 mb-2 leading-relaxed">
                          {q.text}
                        </div>
                        <div className="font-bold text-base text-black">
                          {answers[q.id] || "—"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-panel p-8 md:p-12 rounded-3xl mb-8 relative">
                
                {/* On-Screen UI View */}
                <div id="pdf-report-content" className="bg-white/50 backdrop-blur-md rounded-2xl p-6 md:p-8 mb-8 border border-white/80 shadow-sm relative text-left">
                  
                  <div className="mb-6 border-b border-black/10 pb-4">
                    <h2 className="text-2xl font-semibold tracking-tight text-black">Workshop Summary</h2>
                    <p className="text-xs text-black/50 mt-1 font-medium">Review your strategic parameters before exporting.</p>
                  </div>

                  {/* Scrollable Summary List */}
                  <div className="space-y-6 mb-8 max-h-[45vh] overflow-y-auto pr-4">
                    {QUESTIONS.map((q, idx) => (
                      <div key={q.id} className="pb-4 border-b border-black/5 last:border-0">
                        <div className="text-[10px] font-semibold text-black/40 uppercase tracking-wider mb-1">
                          Parameter {String(idx + 1).padStart(2, '0')}
                        </div>
                        <div className="text-sm font-medium text-black/70 mb-2 leading-relaxed">
                          {q.text}
                        </div>
                        <div className="text-base font-semibold text-black">
                          {answers[q.id] || <span className="text-black/30 italic">Not answered</span>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-black/10">
                    <button 
                      onClick={generatePDF}
                      disabled={isGeneratingPDF}
                      className="flex-1 flex items-center justify-center px-6 py-3.5 bg-gradient-to-br from-blue-950/90 to-emerald-950/90 backdrop-blur-md border border-white/20 text-white rounded-2xl font-medium text-sm hover:opacity-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-70"
                    >
                      {isGeneratingPDF ? (
                        <><Loader2 className="mr-2 w-4 h-4 animate-spin" /> Generating PDF...</>
                      ) : (
                        <><Download className="mr-2 w-4 h-4" /> Export as PDF</>
                      )}
                    </button>
                    <button 
                      onClick={() => {
                        setAnswers({});
                        changeStep(0);
                      }}
                      className="flex-1 flex items-center justify-center px-6 py-3.5 bg-white/60 backdrop-blur-sm border border-white/80 text-black rounded-2xl font-medium text-sm hover:bg-white hover:shadow-sm transition-all duration-300"
                    >
                      <RefreshCcw className="mr-2 w-4 h-4" /> Reset Workshop
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 w-full bg-gradient-to-r from-blue-950/95 to-emerald-950/95 backdrop-blur-xl text-white p-6 flex flex-col items-center justify-center border-t border-white/10">
        <p className="text-xs font-light tracking-wide opacity-80">
          Prepared for NetZero India Foundation by PurpleBlue House
        </p>
        <p className="text-[10px] font-medium tracking-widest uppercase opacity-40 mt-1">
          Website Strategy & Experience Mapping • 2026
        </p>
      </footer>
    </div>
  );
}
