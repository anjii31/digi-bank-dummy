import React, { useEffect, useState, useRef } from 'react';
import { sendMessageToVertexAI } from '../services/vertexAIChatService';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Bar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import CountUp from 'react-countup';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import investmentPlannerPrompt from '../llm_promts/investment_planner_prompt.txt'; // Will use dynamic import
import investmentPlannerSample from '../llm_promts/investment_planner_sample_response.json'; // Will use dynamic import
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useLanguage } from '../contexts/LanguageContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const durations = [1, 3, 5];
const risks = ['Low', 'Medium', 'High'];

function parseSteps(text) {
  if (!text) return [];
  const lines = text.split('\n').filter(line => line.trim() !== '');
  return lines.filter(line => /^(\s*[-*]\s+|\s*\d+\.\s+)/.test(line));
}

function extractNumbersFromText(text) {
  // Try to extract numbers for charting (e.g., year and amount)
  const regex = /(\d+)\s*(?:year|month|yr|mo)[^\d]*([\d,]+(?:\.\d+)?)/gi;
  const data = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    data.push({ label: `${match[1]} year`, value: parseFloat(match[2].replace(/,/g, '')) });
  }
  return data;
}

function extractTableFromText(text) {
  // Look for markdown or simple tables in the AI's answer
  const lines = text.split('\n').map(l => l.trim());
  const tableLines = lines.filter(line => line.includes('|'));
  if (tableLines.length < 2) return null;
  const headers = tableLines[0].split('|').map(h => h.trim()).filter(Boolean);
  const rows = tableLines.slice(1).map(line => line.split('|').map(cell => cell.trim()).filter(Boolean));
  return { headers, rows };
}

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

// Helper to pick an icon based on keywords
function getStepIcon(step) {
  const s = step.toLowerCase();
  if (s.includes('invest')) return 'fas fa-chart-line';
  if (s.includes('save')) return 'fas fa-piggy-bank';
  if (s.includes('gain') || s.includes('profit') || s.includes('return')) return 'fas fa-coins';
  if (s.includes('plan') || s.includes('goal')) return 'fas fa-bullseye';
  if (s.includes('bank')) return 'fas fa-university';
  if (s.includes('insurance')) return 'fas fa-shield-alt';
  if (s.includes('total') || s.includes('maturity')) return 'fas fa-trophy';
  return 'fas fa-check-circle';
}

// Helper to extract a purpose phrase
// function extractPurpose(step) {
//   // Look for 'to ...', 'for ...', or 'in order to ...'
//   const match = step.match(/\b(to|for|in order to) ([^.]+)[.]/i);
//   return match ? match[2].trim() : null;
// }

// Helper to extract a title and description from a step
function parseStepTitleAndDesc(step) {
  // Use the first sentence as title, rest as description
  const [title, ...descParts] = step.replace(/^\s*[-*]\s+|^\s*\d+\.\s+/, '').split('. ');
  return {
    title: title ? title.trim() : '',
    desc: descParts.join('. ').trim(),
  };
}

// Helper to pick a color for each step
function getStepColor(idx) {
  const colors = ['#007bff', '#28a745', '#fd7e14', '#6f42c1', '#20c997', '#ffc107'];
  return colors[idx % colors.length];
}

// Helper to check if a line is redundant user info
function isRedundantInfo(line) {
  const lower = line.toLowerCase();
  return (
    lower.includes('your age is') ||
    lower.includes('you are') ||
    lower.includes('user type') ||
    lower.includes('state:') ||
    lower.includes('gender:') ||
    lower.includes('bpl') ||
    lower.includes('income') && lower.includes('monthly') ||
    lower.includes('savings') && lower.includes('monthly')
  );
}

// Helper to extract calculation data from a line for fallback table
function parseInvestmentSummary(line) {
  // Try to extract: investment type, amount invested, maturity per month, maturity in one year
  // Example: 'Invest ₹5000 in mutual funds for 1 year. You will gain ₹600 per month and ₹7200 in one year.'
  const typeMatch = line.match(/in ([a-zA-Z ]+)/i);
  const amountMatch = line.match(/invest(ed)?[^₹]*₹([\d,]+)/i);
  const maturityMonthMatch = line.match(/₹([\d,]+)[^\d]*per month/i);
  const maturityYearMatch = line.match(/₹([\d,]+)[^\d]*in (?:one|1) year/i) || line.match(/₹([\d,]+)[^\d]*per year/i);
  const overallReturnsMatch = line.match(/₹([\d,]+)[^\d]*overall returns/i);
  return {
    type: typeMatch ? typeMatch[1].trim() : '',
    amount: amountMatch ? `₹${amountMatch[2]}` : '',
    maturityMonth: maturityMonthMatch ? `₹${maturityMonthMatch[1]}` : '',
    maturityYear: maturityYearMatch ? `₹${maturityYearMatch[1]}` : '',
    overallReturns: overallReturnsMatch ? `₹${overallReturnsMatch[1]}` : '',
  };
}

// Helper to extract all calculation lines from the AI response
function extractCalculationLines(text) {
  if (!text) return [];
  const lines = text.split('\n').map(l => l.trim());
  // Consider a line a calculation if it contains ₹, %, year, month, or numbers
  return lines.filter(line => /₹|%|\d+\s*(year|month|yr|mo|per|in)/i.test(line));
}

// Helper to determine if a step refers to an investment option
function isInvestmentStep(title, desc) {
  const keywords = [
    'fund', 'deposit', 'sip', 'equity', 'debt', 'mutual', 'fixed', 'recurring', 'account', 'scheme',
    'rd', 'fd', 'ppf', 'lic', 'nps', 'bond', 'ulip', 'elss', 'pension', 'insurance', 'gold', 'stock', 'share', 'mf', 'post office', 'sukanya', 'ssy', 'kisan', 'chit', 'loan', 'savings', 'investment'
  ];
  const text = (title + ' ' + (desc || '')).toLowerCase();
  return keywords.some(word => text.includes(word));
}

// Helper to highlight investment keywords in a string
function highlightInvestmentKeywords(text) {
  if (!text) return '';
  const keywords = [
    'RD', 'FD', 'PPF', 'SIP', 'LIC', 'NPS', 'Bond', 'ULIP', 'ELSS', 'Pension', 'Insurance', 'Gold', 'Stock', 'Share', 'MF', 'Post Office', 'Sukanya', 'SSY', 'Kisan', 'Chit', 'Loan', 'Savings', 'Investment',
    'Fund', 'Deposit', 'Equity', 'Debt', 'Mutual', 'Fixed', 'Recurring', 'Account', 'Scheme'
  ];
  const regex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'gi');
  return text.replace(regex, match => `<span style="color:#007bff;font-weight:bold;">${match}</span>`);
}

const InvestmentPlanner = () => {
  const { currentUser } = useAuth();
  const { language } = useLanguage();
  const [profile, setProfile] = useState(null);
  const [income, setIncome] = useState('');
  const [savings, setSavings] = useState('');
  const [duration, setDuration] = useState(1);
  const [risk, setRisk] = useState('Medium');
  const [aiResponse, setAiResponse] = useState('');
  const [aiSteps, setAiSteps] = useState([]);
  const [chartData, setChartData] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [summaryNumbers, setSummaryNumbers] = useState([]);
  const [labelDid, setLabelDid] = useState(false);
  const [hasGeneratedPlan, setHasGeneratedPlan] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      try {
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfile(data);
          if (data.income) setIncome(data.income);
          if (data.savings) setSavings(data.savings);
        }
      } catch (err) {
        setError('Could not fetch profile.');
      }
    };
    fetchProfile();
  }, [currentUser]);

  const handleGetPlan = async () => {
    setLoading(true);
    setError('');
    setAiResponse('');
    setAiSteps([]);
    setChartData(null);
    setTableData(null);
    setSummaryNumbers([]);
    setHasGeneratedPlan(true);
    try {
      let message = `Here are my details: `;
      if (profile?.state) message += `State: ${profile.state}. `;
      if (profile?.userType) message += `User type: ${profile.userType}. `;
      if (profile?.age) message += `Age: ${profile.age}. `;
      if (profile?.gender) message += `Gender: ${profile.gender}. `;
      if (profile?.goals) message += `Financial goals: ${profile.goals}. `;
      if (profile?.bplCategory) message += `BPL category: ${profile.bplCategory}. `;
      message += `My average monthly income is ${income}. `;
      message += `My average monthly savings is ${savings}. `;
      message += `I want to invest for ${duration} year(s) at ${risk} risk. `;
      message += 'Break my savings and give me a step by step calculations on how much money should I invest and where should I invest for an year and how much total will i gain on maturity. Only output the required sections and table columns as specified above. Do NOT include disclaimers, legal notes, or extra explanations.';
      if(language === 'hi') {
        message += 'response in' + "Hindi";
      }
      if(language === 'mr') {
        message += 'response in' + "Marathi";
      }
      const aiText = await sendMessageToVertexAI(message, language);
      const answer = typeof aiText === 'string' ? aiText : aiText.text;
      setAiResponse(answer);
      setAiSteps(parseSteps(answer));
      const chartPoints = extractNumbersFromText(answer);
      if (chartPoints.length > 0) {
        // Set total invested to monthly savings multiplied by 12 (for a year)
        const totalInvested = (Number(savings) || 0) * 12;
        // Try to extract maturity value from the last 2-3 steps in the step-by-step plan
        let maturityValue = 0;
        if (aiSteps.length > 0) {
          const maturityKeywords = /returns|return|gain|estimated gains|maturity/i;
          const lastSteps = aiSteps.slice(-3);
          for (let step of lastSteps) {
            if (maturityKeywords.test(step) && /₹[\d,]+/.test(step)) {
              const match = step.match(/₹[\d,]+/);
              if (match) {
                maturityValue = Number(match[0].replace(/[^\d.]/g, ''));
                break;
              }
            }
          }
        }
        // Fallback to 30% extra of total invested
        if (!maturityValue) {
          maturityValue = totalInvested * 1.3;
        }
        setChartData({
          labels: chartPoints.map(d => d.label),
          datasets: [
            {
              label: 'Projected Value',
              data: chartPoints.map(d => d.value),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
            },
          ],
        });
        setSummaryNumbers([
          { label: 'Total Invested', value: totalInvested, icon: 'fas fa-wallet', color: '#007bff' },
          { label: 'Maturity Value', value: maturityValue, icon: 'fas fa-coins', color: '#28a745' },
        ]);
      }
      const table = extractTableFromText(answer);
      if (table) setTableData(table);
    } catch (err) {
      setError('Error fetching investment plan.');
    }
    setLoading(false);
  };

  const handleRegeneratePlan = async () => {
    setLabelDid(true);
    await handleGetPlan();
  };

  // PDF download handler
  const handleDownloadPDF = async () => {
    const input = document.getElementById('investment-planner-pdf-content');
    if (!input) return;
    const canvas = await html2canvas(input, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pageWidth;
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('investment-planner.pdf');
  };

  const translations = {
    en: {
      downloadPdf: 'Download as PDF',
      planner: 'Investment Planner',
      monthlyIncome: 'Monthly Income',
      monthlySavings: 'Monthly Savings',
      duration: 'Investment Duration (years)',
      risk: 'Risk Level',
      generating: 'Generating...',
      getPlan: 'Get Plan',
      error: 'Error fetching investment plan.',
      totalInvested: 'Total Invested',
      maturityValue: 'Maturity Value',
      personalizedPlan: 'Your Personalized Investment Plan',
      stepByStep: 'Step-by-Step Plan',
      calculationsTable: 'Calculations Table',
      projectedGrowth: 'Projected Growth',
      didNotLike: 'Did not like your personalized plan? No worries!',
      clickToGenerate: 'Click here to generate new plan',
      investmentType: 'Investment Type',
      amountInvested: 'Amount Invested',
      maturityPerMonth: 'Maturity Amount per Month',
      maturityOneYear: 'Maturity Amount in One Year',
      overallReturns: 'Overall Returns',
      year: 'Year',
      value: 'Value (₹)',
    },
    hi: {
      downloadPdf: 'PDF के रूप में डाउनलोड करें',
      planner: 'निवेश योजनाकार',
      monthlyIncome: 'मासिक आय',
      monthlySavings: 'मासिक बचत',
      duration: 'निवेश अवधि (वर्ष)',
      risk: 'जोखिम स्तर',
      generating: 'जनरेट हो रहा है...',
      getPlan: 'योजना प्राप्त करें',
      error: 'निवेश योजना प्राप्त करने में त्रुटि।',
      totalInvested: 'कुल निवेश',
      maturityValue: 'परिपक्वता राशि',
      personalizedPlan: 'आपकी व्यक्तिगत निवेश योजना',
      stepByStep: 'चरण-दर-चरण योजना',
      calculationsTable: 'गणना तालिका',
      projectedGrowth: 'अनुमानित वृद्धि',
      didNotLike: 'क्या आपको आपकी व्यक्तिगत योजना पसंद नहीं आई? कोई बात नहीं!',
      clickToGenerate: 'नई योजना जनरेट करने के लिए यहां क्लिक करें',
      investmentType: 'निवेश प्रकार',
      amountInvested: 'निवेश की गई राशि',
      maturityPerMonth: 'प्रति माह परिपक्वता राशि',
      maturityOneYear: 'एक वर्ष में परिपक्वता राशि',
      overallReturns: 'कुल रिटर्न',
      year: 'वर्ष',
      value: 'मूल्य (₹)',
    },
    mr: {
      downloadPdf: 'PDF म्हणून डाउनलोड करा',
      planner: 'गुंतवणूक नियोजक',
      monthlyIncome: 'मासिक उत्पन्न',
      monthlySavings: 'मासिक बचत',
      duration: 'गुंतवणूक कालावधी (वर्षे)',
      risk: 'जोखीम स्तर',
      generating: 'निर्मिती होत आहे...',
      getPlan: 'योजना मिळवा',
      error: 'गुंतवणूक योजना मिळवताना त्रुटी.',
      totalInvested: 'एकूण गुंतवणूक',
      maturityValue: 'परिपक्वता मूल्य',
      personalizedPlan: 'तुमची वैयक्तिकृत गुंतवणूक योजना',
      stepByStep: 'पायरी-दर-पायरी योजना',
      calculationsTable: 'गणना तक्ता',
      projectedGrowth: 'अनुमानित वाढ',
      didNotLike: 'तुम्हाला तुमची वैयक्तिकृत योजना आवडली नाही? काही हरकत नाही!',
      clickToGenerate: 'नवीन योजना तयार करण्यासाठी येथे क्लिक करा',
      investmentType: 'गुंतवणूक प्रकार',
      amountInvested: 'गुंतवलेली रक्कम',
      maturityPerMonth: 'प्रति महिना परिपक्वता रक्कम',
      maturityOneYear: 'एका वर्षात परिपक्वता रक्कम',
      overallReturns: 'एकूण परतावा',
      year: 'वर्ष',
      value: 'मूल्य (₹)',
    }
  };
  const t = translations[language] || translations.en;

  return (
    <div style={{ position: 'relative', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      {/* Fullscreen background image and overlay */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 0,
        background: `linear-gradient(rgba(246,248,250,0.7), rgba(246,248,250,0.7)), url('https://images.unsplash.com/photo-1556740772-1a741367b93e?auto=format&fit=crop&w=1500&q=80') center/cover no-repeat fixed`,
        backdropFilter: 'blur(2px)',
        WebkitBackdropFilter: 'blur(2px)'
      }} />
      {/* Main content */}
      <div className="container py-5" style={{ maxWidth: 700, position: 'relative', zIndex: 1 }}>
        <motion.div className="card border-0 shadow-sm mb-4" initial="hidden" animate="visible" variants={fadeIn}>
          <div className="card-body position-relative">
            {/* Download PDF Button */}
            <button
              className="btn btn-outline-secondary position-absolute"
              style={{ top: 16, right: 16, zIndex: 2 }}
              onClick={handleDownloadPDF}
            >
              <i className="fas fa-download me-2"></i>{t.downloadPdf}
            </button>
            <div id="investment-planner-pdf-content">
              <h2 className="fw-bold text-primary mb-4"><i className="fas fa-chart-line me-2"></i>{t.planner}</h2>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">{t.monthlyIncome}</label>
                  <input type="number" className="form-control" value={income} onChange={e => setIncome(e.target.value)} min="0" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t.monthlySavings}</label>
                  <input type="number" className="form-control" value={savings} onChange={e => setSavings(e.target.value)} min="0" />
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t.duration}</label>
                  <select className="form-select" value={duration} onChange={e => setDuration(Number(e.target.value))}>
                    {durations.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">{t.risk}</label>
                  <select className="form-select" value={risk} onChange={e => setRisk(e.target.value)}>
                    {risks.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <motion.button className="btn btn-primary mb-3" onClick={handleGetPlan} disabled={loading} whileTap={{ scale: 0.95 }}>
                {loading ? t.generating : t.getPlan}
              </motion.button>
              {error && <div className="alert alert-danger mt-3">{t.error}</div>}
              {/* Animated Summary Cards */}
              {summaryNumbers.length > 0 && (
                <div className="row mb-4">
                  {summaryNumbers.map((item, idx) => (
                    <motion.div className="col-md-6 mb-3" key={idx} initial="hidden" animate="visible" variants={fadeIn} transition={{ delay: 0.1 * idx }}>
                      <div className="card border-0 shadow-sm h-100 text-center" style={{ background: '#f8f9fa' }}>
                        <div className="card-body">
                          <i className={`${item.icon} fa-2x mb-2`} style={{ color: item.color }}></i>
                          <h6 className="fw-bold mb-1">{item.label}</h6>
                          <CountUp end={item.value} duration={1.2} separator="," prefix="₹" className="fs-4 fw-bold text-dark" />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              {/* AI Summary Card */}
              {aiResponse && (
                <motion.div className="card border-0 shadow-sm mb-4" initial="hidden" animate="visible" variants={fadeIn}>
                  <div className="card-body">
                    <h5 className="fw-bold text-success mb-3"><i className="fas fa-lightbulb me-2"></i>{t.personalizedPlan}</h5>
                    {/* Show the first non-redundant line as summary */}
                    <div style={{ whiteSpace: 'pre-line', textAlign: 'left' }}>
                      {aiResponse.split('\n').find(line => line.trim() && !isRedundantInfo(line))}
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Steps Timeline - Redesigned */}
              {aiSteps.length > 0 && (
                <motion.div className="mb-4" initial="hidden" animate="visible" variants={fadeIn}>
                  <h6 className="fw-bold text-primary mb-3">{t.stepByStep}</h6>
                  <div className="position-relative" style={{ paddingLeft: 36, minHeight: 60 }}>
                    {/* Vertical line */}
                    <div style={{
                      position: 'absolute',
                      left: 18,
                      top: 0,
                      bottom: 0,
                      width: 4,
                      background: 'linear-gradient(180deg, #007bff 0%, #20c997 100%)',
                      borderRadius: 2,
                      zIndex: 0,
                    }}></div>
                    <div className="d-flex flex-column gap-4">
                      {(() => {
                        let stepCount = 1;
                        return aiSteps
                          .filter(step => !isRedundantInfo(step) && !step.toLowerCase().includes('disclaimer'))
                          .map((step, idx) => {
                            const icon = getStepIcon(step);
                            const { title, desc } = parseStepTitleAndDesc(step);
                            const color = getStepColor(idx);
                            const showStep = isInvestmentStep(title, desc);
                            const stepLabel = showStep ? `Step ${stepCount++}` : null;
                            return (
                              <motion.div
                                key={idx}
                                initial="hidden"
                                animate="visible"
                                variants={fadeIn}
                                transition={{ delay: 0.09 * idx }}
                                className="d-flex align-items-start position-relative"
                              >
                                {/* Icon node */}
                                <div style={{
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  background: color,
                                  color: 'white',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 20,
                                  fontWeight: 700,
                                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                                  zIndex: 2,
                                  marginRight: 18,
                                  flexShrink: 0,
                                }}>
                                  <i className={icon}></i>
                                </div>
                                {/* Step content */}
                                <div style={{ background: '#f8f9fa', borderRadius: 12, padding: '16px 20px', flex: 1, boxShadow: '0 2px 8px rgba(0,123,255,0.06)' }}>
                                  <div className="d-flex align-items-center mb-1">
                                    {/* Show Step X label only for investment option steps, with correct numbering */}
                                    {showStep && (
                                      <span style={{ color, fontWeight: 700, fontSize: 17, marginRight: 10 }}>{stepLabel}</span>
                                    )}
                                    <span style={{ fontWeight: 600, fontSize: 17 }} dangerouslySetInnerHTML={{ __html: highlightInvestmentKeywords(title) }} />
                                  </div>
                                  {desc && <div style={{ color: '#555', fontSize: 15, marginTop: 2 }} dangerouslySetInnerHTML={{ __html: highlightInvestmentKeywords(desc) }} />}
                                </div>
                              </motion.div>
                            );
                          });
                      })()}
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Calculations Table - always shown */}
              {(tableData || aiResponse) && (
                <motion.div className="card border-0 shadow-sm mb-4" initial="hidden" animate="visible" variants={fadeIn}>
                  <div className="card-body">
                    <h6 className="fw-bold text-primary mb-3"><i className="fas fa-table me-2"></i>{t.calculationsTable}</h6>
                    <div className="table-responsive">
                      <table className="table table-bordered table-sm mb-0" style={{ borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,123,255,0.08)' }}>
                        <thead style={{ background: 'linear-gradient(90deg, #007bff 0%, #20c997 100%)', color: '#fff' }}>
                          <tr>
                            <th style={{ border: 'none', fontWeight: 700 }}>{t.investmentType}</th>
                            <th style={{ border: 'none', fontWeight: 700 }}>{t.amountInvested}</th>
                            <th style={{ border: 'none', fontWeight: 700 }}>{t.maturityPerMonth}</th>
                            <th style={{ border: 'none', fontWeight: 700 }}>{t.maturityOneYear}</th>
                            <th style={{ border: 'none', fontWeight: 700 }}>{t.overallReturns}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableData
                            ? tableData.rows.map((row, i) => (
                                <tr key={i} style={{ background: i % 2 === 0 ? '#f8f9fa' : '#e3f0ff' }}>
                                  {row.map((cell, j) => <td key={j} style={{ border: 'none', fontWeight: 500 }}>{cell}</td>)}
                                </tr>
                              ))
                            : extractCalculationLines(aiResponse)
                                .map((line, idx) => {
                                  const calc = parseInvestmentSummary(line);
                                  if (!calc.type && !calc.amount && !calc.maturityMonth && !calc.maturityYear && !calc.overallReturns) return null;
                                  return (
                                    <tr key={idx} style={{ background: idx % 2 === 0 ? '#f8f9fa' : '#e3f0ff' }}>
                                      <td style={{ border: 'none', fontWeight: 600 }}>{calc.type}</td>
                                      <td style={{ border: 'none' }}>{calc.amount}</td>
                                      <td style={{ border: 'none' }}>{calc.maturityMonth}</td>
                                      <td style={{ border: 'none' }}>{calc.maturityYear}</td>
                                      <td style={{ border: 'none' }}>{calc.overallReturns}</td>
                                    </tr>
                                  );
                                })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
              {/* Chart */}
              {chartData && (
                <motion.div className="card border-0 shadow-sm mb-4" initial="hidden" animate="visible" variants={fadeIn}>
                  <div className="card-body">
                    <h6 className="fw-bold text-primary mb-2">{t.projectedGrowth}</h6>
                    <Bar data={chartData} options={{
                      responsive: true,
                      plugins: { legend: { display: false }, tooltip: { enabled: true } },
                      scales: {
                        x: { title: { display: true, text: t.year } },
                        y: { title: { display: true, text: t.value }, beginAtZero: true }
                      }
                    }} height={200} />
                  </div>
                </motion.div>
              )}
              {/* Regenerate Plan Label and Button */}
              {hasGeneratedPlan && aiResponse && (
                <div className="text-center mt-4 mb-2">
                  <span
                    className="fw-bold mb-2 d-inline-block"
                    style={{
                      fontSize: 18,
                      color: labelDid ? '#20c997' : '#fd7e14',
                      transition: 'color 0.5s, transform 0.5s, opacity 0.5s',
                      transform: labelDid ? 'scale(1.08)' : 'scale(1)',
                      opacity: labelDid ? 0.85 : 1,
                    }}
                  >
                    {t.didNotLike}
                  </span>
                  <button
                    className="btn btn-outline-primary px-4 py-2 fw-bold"
                    style={{ borderRadius: 24, fontSize: 16, boxShadow: '0 2px 8px rgba(0,123,255,0.08)' }}
                    onClick={handleRegeneratePlan}
                  >
                    {t.clickToGenerate}
                  </button>
                </div>
              )}
            </div> {/* End of investment-planner-pdf-content */}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// PurposePopover component
function PurposePopover({ purpose }) {
  const [show, setShow] = useState(false);
  const iconRef = useRef(null);
  const popupRef = useRef(null);

  useEffect(() => {
    if (!show) return;
    function handleClickOutside(event) {
      if (
        iconRef.current &&
        !iconRef.current.contains(event.target) &&
        popupRef.current &&
        !popupRef.current.contains(event.target)
      ) {
        setShow(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [show]);

  return (
    <span style={{ marginLeft: 12, position: 'relative' }}>
      <i
        ref={iconRef}
        className="fas fa-info-circle text-info"
        style={{ cursor: 'pointer', fontSize: 20 }}
        onClick={() => setShow((s) => !s)}
        aria-label="Show purpose"
      ></i>
      {show && (
        <motion.div
          ref={popupRef}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          style={{
            position: 'absolute',
            left: 28,
            top: -8,
            minWidth: 180,
            background: '#fff',
            color: '#333',
            border: '1px solid #007bff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0,123,255,0.10)',
            padding: '10px 14px',
            zIndex: 10,
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          <span className="fw-bold text-primary">Purpose:</span> {purpose}
        </motion.div>
      )}
    </span>
  );
}

export default InvestmentPlanner; 