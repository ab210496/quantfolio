import React, {
  useState,
  useEffect,
  useMemo,
  createContext,
  useContext,
} from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  Plus, Edit, Trash2, TrendingUp, ArrowDown, DollarSign,
  BrainCircuit, Bot, Zap, Target, CheckCircle, Lightbulb,
  Search, FileText, Radar, AlertTriangle, ShieldAlert,
} from "lucide-react";

import { auth, db, storage } from "./firebase"; 
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithCustomToken,
} from "firebase/auth";
import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  setDoc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

// --- Currency Context ---
const CurrencyContext = createContext();
const USD_INR_RATE = 83.5;
const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState("INR");
  const toggleCurrency = () =>
    setCurrency((c) => (c === "INR" ? "USD" : "INR"));
  const formatCurrency = (amtInUSD) => {
    const amt = typeof amtInUSD === "number" ? amtInUSD : 0;
    return currency === "INR"
      ? `₹${(amt * USD_INR_RATE).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`
      : `$${amt.toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;
  };
  const getSymbol = () => (currency === "INR" ? "₹" : "$");
  const getCode = () => currency;
  const parseCurrency = (disp) =>
    Number(String(disp).replace(/[^0-9.]/g, "")) /
    (currency === "INR" ? USD_INR_RATE : 1);
  return (
    <CurrencyContext.Provider
      value={{
        currency,
        toggleCurrency,
        formatCurrency,
        getSymbol,
        getCode,
        parseCurrency,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};
const useCurrency = () => useContext(CurrencyContext);

// --- Logo, Header, Tabs, LoadingScreen etc. ---
//... (same content from your Parts 1 & 2, cleaned above)

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

const PortfolioRow = ({ item, onSell }) => {
  const { formatCurrency } = useCurrency();

  const totalValue = item.quantity * item.currentPrice;
  const profitLoss = totalValue - (item.quantity * item.buyPrice);
  const isProfit = profitLoss >= 0;

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/40 transition">
      <td className="px-4 py-3 font-medium text-white">{item.name}</td>
      <td className="px-4 py-3 text-gray-400">{item.ticker}</td>
      <td className="px-4 py-3 text-gray-400">{item.quantity}</td>
      <td className="px-4 py-3 text-gray-400">{formatCurrency(item.buyPrice)}</td>
      <td className="px-4 py-3 text-gray-400">{formatCurrency(item.currentPrice)}</td>
      <td className={`px-4 py-3 font-semibold ${isProfit ? 'text-teal-400' : 'text-red-400'}`}>
        {isProfit ? '+' : '-'}{formatCurrency(Math.abs(profitLoss))}
      </td>
      <td className="px-4 py-3">
        <button onClick={() => onSell(item)} className="text-red-400 hover:underline">Sell</button>
      </td>
    </tr>
  );
};

export default PortfolioRow;
import React, { useState } from 'react';
import { useCurrency } from '../hooks/useCurrency';

const InvestmentModal = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    name: '',
    ticker: '',
    quantity: '',
    buyPrice: '',
    currentPrice: '',
    assetType: '',
    sector: ''
  });

  const { formatCurrency } = useCurrency();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...formData, quantity: parseFloat(formData.quantity), buyPrice: parseFloat(formData.buyPrice), currentPrice: parseFloat(formData.currentPrice) });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center">
      <div className="bg-slate-900 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold text-white mb-4">Add New Investment</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Company Name" required className="input" />
          <input type="text" name="ticker" value={formData.ticker} onChange={handleChange} placeholder="Ticker (e.g. AAPL)" required className="input" />
          <input type="number" name="quantity" value={formData.quantity} onChange={handleChange} placeholder="Quantity" required className="input" />
          <input type="number" name="buyPrice" value={formData.buyPrice} onChange={handleChange} placeholder="Buy Price" required className="input" />
          <input type="number" name="currentPrice" value={formData.currentPrice} onChange={handleChange} placeholder="Current Price" required className="input" />
          <input type="text" name="assetType" value={formData.assetType} onChange={handleChange} placeholder="Asset Type (e.g. Equity)" className="input" />
          <input type="text" name="sector" value={formData.sector} onChange={handleChange} placeholder="Sector (optional)" className="input" />
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="text-gray-300 hover:text-white">Cancel</button>
            <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2 px-4 rounded">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InvestmentModal;

import React, { useState } from 'react';

const GoalSetupForm = ({ onSave }) => {
  const [goalAmount, setGoalAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ goalAmount: parseFloat(goalAmount), targetDate });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="number" value={goalAmount} onChange={(e) => setGoalAmount(e.target.value)} placeholder="Goal Amount (e.g. 1000000)" required className="input" />
      <input type="date" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} required className="input" />
      <button type="submit" className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold py-2 px-4 rounded w-full">Set Goal</button>
    </form>
  );
};

export default GoalSetupForm;

import React from 'react';
import { Lightbulb } from 'lucide-react';

const InvestmentAdvisor = ({ recommendations }) => {
  if (!recommendations || recommendations.length === 0) return null;

  return (
    <div className="bg-slate-900/50 ring-1 ring-white/10 rounded-xl p-6 space-y-4 mt-6">
      <div className="flex items-center mb-4">
        <Lightbulb className="h-6 w-6 text-yellow-300 mr-2" />
        <h3 className="text-lg font-bold text-white">GPT Investment Suggestions</h3>
      </div>
      <ul className="space-y-3 text-gray-300">
        {recommendations.map((rec, i) => (
          <li key={i} className="bg-slate-800/50 rounded p-3 border border-slate-700">
            <p className="font-semibold text-white">{rec.title}</p>
            <p className="text-sm text-gray-400 mt-1">{rec.description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default InvestmentAdvisor;
import React, { useState, useMemo, useEffect } from 'react';
import { Zap, ArrowDown } from 'lucide-react';
import { useCurrency } from '../hooks/useCurrency';

const ScenarioPlanner = ({ investments }) => {
  const { formatCurrency } = useCurrency();
  const portfolioValue = useMemo(
    () => investments.reduce((sum, i) => sum + i.quantity * i.currentPrice, 0),
    [investments]
  );

  const [scenario, setScenario] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!scenario || !investments.length) {
      setError("Enter a scenario and have investments first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setAnalysis(null);

    // Prepare AI payload
    const summary = investments.map(inv => ({
      name: inv.name, ticker: inv.ticker,
      value: inv.quantity * inv.currentPrice, type: inv.assetType
    }));
    const prompt = `Analyze scenario: "${scenario}". Portfolio: ${JSON.stringify(summary)}. Current value: $${portfolioValue.toFixed(2)}. Provide JSON with overallImpact, estimatedNewValue, impactedHoldings[].`;
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                scenarioTitle: { type: "STRING" },
                overallImpact: { type: "STRING" },
                estimatedNewValue: { type: "NUMBER" },
                impactedHoldings: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      name: { type: "STRING" },
                      ticker: { type: "STRING" },
                      estimatedImpactPercentage: { type: "NUMBER" },
                      reasoning: { type: "STRING" }
                    },
                    required: ["name", "ticker", "estimatedImpactPercentage", "reasoning"]
                  }
                }
              },
              required: ["scenarioTitle", "overallImpact", "estimatedNewValue", "impactedHoldings"]
            }
          }
        })
      }
    );
    if (!response.ok) {
      setError(`AI error: ${response.statusText}`);
    } else {
      const json = await response.json();
      setAnalysis(JSON.parse(json.candidates[0].content.parts[0].text));
    }
    setIsLoading(false);
  };

  return (
    <div className="bg-slate-900/50 ring-1 ring-white/10 rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center mb-4">
        <Zap className="h-6 w-6 text-teal-400 mr-2" />
        <h3 className="text-xl font-bold text-white">Scenario Planner</h3>
      </div>
      <form onSubmit={handleAnalyze} className="flex gap-4 mb-4">
        <input
          value={scenario}
          onChange={e => setScenario(e.target.value)}
          placeholder="e.g. 'IT sector drops 10%'"
          className="flex-grow bg-slate-800 border border-slate-700 px-4 py-2 rounded text-white"
        />
        <button
          type="submit"
          className="bg-teal-500 hover:bg-teal-400 text-slate-900 font-bold px-4 rounded"
          disabled={isLoading}
        >
          {isLoading ? "Analyzing..." : "Analyze"}
        </button>
      </form>
      {error && <p className="text-red-400 mb-4">{error}</p>}
      {analysis && (
        <div className="bg-slate-800 p-4 rounded">
          <h4 className="font-semibold text-white">{analysis.scenarioTitle}</h4>
          <p className="text-gray-300">{analysis.overallImpact}</p>
          <div className="mt-4 text-center">
            <p className="text-gray-400 line-through">{formatCurrency(portfolioValue)}</p>
            <ArrowDown className="mx-auto text-red-500" />
            <p className="text-teal-400 font-bold">{formatCurrency(analysis.estimatedNewValue)}</p>
          </div>
          <ul className="space-y-2 mt-4">
            {analysis.impactedHoldings.map((h, idx) => (
              <li key={idx} className="bg-slate-700 p-3 rounded flex justify-between">
                <div>
                  <p className="text-white font-semibold">{h.name} ({h.ticker})</p>
                  <p className="text-gray-300 text-sm italic">{h.reasoning}</p>
                </div>
                <p className={h.estimatedImpactPercentage >= 0 ? 'text-teal-400' : 'text-red-400'}>
                  {h.estimatedImpactPercentage >= 0 ? '+' : ''}{h.estimatedImpactPercentage.toFixed(2)}%
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ScenarioPlanner;
import React, { useState, useEffect } from 'react';
import { Search, FileText, TrendingUp, AlertTriangle, ShieldAlert, Radar } from 'lucide-react';
import AnnualReportSummarizer from './AnnualReportSummarizer';
import OpportunityRadar from './OpportunityRadar';

const ResearchSuite = ({ investments }) => {
  const [subTab, setSubTab] = useState('summarizer');
  return (
    <div className="bg-slate-900/50 ring-1 ring-white/10 rounded-2xl p-6 animate-fade-in">
      <div className="flex items-center mb-4">
        <Search className="h-6 w-6 text-teal-400 mr-2" />
        <h3 className="text-xl font-bold text-white">AI Research & Discovery</h3>
      </div>
      <div className="flex gap-4 mb-4">
        <button className={`${subTab==='summarizer' ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-gray-300'} px-4 py-2 rounded`} onClick={()=>setSubTab('summarizer')}>Company Analysis</button>
        <button className={`${subTab==='radar' ? 'bg-teal-500 text-slate-900' : 'bg-slate-800 text-gray-300'} px-4 py-2 rounded`} onClick={()=>setSubTab('radar')}>Opportunity Radar</button>
      </div>
      {subTab === 'summarizer' && <AnnualReportSummarizer />}
      {subTab === 'radar' && <OpportunityRadar investments={investments} />}
    </div>
  );
};

export default ResearchSuite;
import React, { useState } from 'react';
import { FileText, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import SummarySection from './SummarySection';

const AnnualReportSummarizer = () => {
  const [company, setCompany] = useState('');
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSummarize = async (e) => {
    e.preventDefault();
    if (!company) return;
    setLoading(true);
    setError(null);
    setSummary(null);

    const prompt = `Provide business summary, growth drivers, key risks, red flags in JSON for "${company}"`;
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema:{
              type:'OBJECT',properties:{
                companyName:{type:'STRING'},
                businessSummary:{type:'STRING'},
                growthDrivers: {type:'ARRAY', items:{type:'STRING'}},
                keyRisks: {type:'ARRAY', items:{type:'STRING'}},
                redFlags: {type:'ARRAY', items:{type:'STRING'}}
              },
              required:['companyName','businessSummary','growthDrivers','keyRisks','redFlags']
            }
          }
        })
      }
    );
    if (!resp.ok) {
      setError(resp.statusText);
    } else {
      const json = await resp.json();
      setSummary(JSON.parse(json.candidates[0].content.parts[0].text));
    }
    setLoading(false);
  };

  return (
    <div>
      <form onSubmit={handleSummarize} className="flex gap-2 mb-4">
        <input
          value={company}
          onChange={e=>setCompany(e.target.value)}
          placeholder="e.g. Apple"
          className="flex-grow bg-slate-800 border border-slate-700 px-4 py-2 rounded text-white"
        />
        <button type="submit" className="bg-teal-500 px-4 rounded text-slate-900 font-semibold">
          {loading ? 'Analyzing...' : 'Analyze Company'}
        </button>
      </form>
      {error && <p className="text-red-400">{error}</p>}
      {summary && (
        <div className="space-y-4 mt-4">
          <SummarySection
            title="Business Summary"
            items={[summary.businessSummary]}
            icon={FileText}
            color="blue"
          />
          <SummarySection
            title="Growth Drivers"
            items={summary.growthDrivers}
            icon={TrendingUp}
            color="green"
          />
          <SummarySection
            title="Key Risks"
            items={summary.keyRisks}
            icon={AlertTriangle}
            color="yellow"
          />
          {summary.redFlags.length > 0 && (
            <SummarySection
              title="Red Flags"
              items={summary.redFlags}
              icon={ShieldAlert}
              color="red"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default AnnualReportSummarizer;
import React from 'react';

const colorMap = {
  blue: 'text-sky-400',
  green: 'text-teal-400',
  yellow: 'text-yellow-400',
  red: 'text-red-400',
};

const SummarySection = ({ title, items, icon: Icon, color }) => (
  <div className="bg-slate-800/50 ring-1 ring-white/10 p-4 rounded">
    <h4 className={`flex items-center gap-2 font-semibold mb-2 ${colorMap[color]}`}>
      <Icon /> {title}
    </h4>
    <ul className="list-disc list-inside text-gray-300 space-y-1">
      {items.map((t, i) => (
        <li key={i}>{t}</li>
      ))}
    </ul>
  </div>
);

export default SummarySection;
import React, { useState, useEffect } from 'react';
import { Radar as RadarIcon } from 'lucide-react';

const OpportunityRadar = ({ investments }) => {
  const [alerts, setAlerts] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!investments.length) {
      setAlerts([{ title: "Add investments", description: "No portfolio to scan." }]);
      return;
    }
    setLoading(true);
    setAlerts(null);

    const summary = investments.map(inv => ({ ticker: inv.ticker, assetType: inv.assetType }));
    const prompt = `Suggest 2–3 diversification opportunities from ${JSON.stringify(summary)}`;
    const resp = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.REACT_APP_GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema:{
              type:'OBJECT',
              properties: { alerts: {
                type:'ARRAY',
                items:{
                  type:'OBJECT',
                  properties:{
                    title:{type:'STRING'}, description:{type:'STRING'}
                  },
                  required:['title','description']
                }
              }},
              required:['alerts']
            }
          }
        })
      }
    );
    if (resp.ok) {
      const json = await resp.json();
      setAlerts(JSON.parse(json.candidates[0].content.parts[0].text).alerts);
    } else {
      setAlerts([{ title: "Error", description: "Failed to fetch radar." }]);
    }
    setLoading(false);
  };

  useEffect(() => analyze(), [investments]);

  return (
    <div>
      {loading && <p className="text-gray-400">Scanning...</p>}
      {alerts && (
        <ul className="space-y-2">
          {alerts.map((a, i) => (
            <li key={i} className="bg-slate-800/50 ring-1 ring-teal-500/20 p-3 flex gap-3 rounded">
              <RadarIcon className="h-6 w-6 text-teal-400" />
              <div>
                <p className="font-semibold text-white">{a.title}</p>
                <p className="text-gray-300 text-sm">{a.description}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OpportunityRadar;
// --- Core App Component ---
function App() {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [investments, setInvestments] = useState([]);
  const [goal, setGoal] = useState(null);
  const [activeTab, setActiveTab] = useState("advisor");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        try {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          ) {
            await signInWithCustomToken(auth, __initial_auth_token);
          } else {
            await signInAnonymously(auth);
          }
        } catch (err) {
          console.error("Auth error:", err);
        }
      }
      setIsAuthReady(true);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!isAuthReady || !userId) return;
    setIsLoading(true);
    const base = `artifacts/${process.env.REACT_APP_FIREBASE_PROJECT_ID}/users/${userId}`;
    const portCol = collection(db, `${base}/portfolio`);
    const goalDoc = doc(db, `${base}/goals/mainGoal`);

    const unsubP = onSnapshot(
      portCol,
      (snap) => {
        setInvestments(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(),
            buyPrice: Number(d.data().buyPrice) || 0,
            quantity: Number(d.data().quantity) || 0,
            currentPrice: Number(d.data().currentPrice || d.data().buyPrice),
          }))
        );
        setIsLoading(false);
      },
      (e) => {
        console.error("Portfolio fetch error:", e);
        setIsLoading(false);
      }
    );

    const unsubG = onSnapshot(
      goalDoc,
      (snap) => setGoal(snap.exists() ? { id: snap.id, ...snap.data() } : null),
      (e) => console.error("Goal fetch error:", e)
    );

    return () => {
      unsubP();
      unsubG();
    };
  }, [isAuthReady, userId]);

  const handleAdd = () => {
    setEditingInvestment(null);
    setIsModalOpen(true);
  };

  const handleEdit = (inv) => {
    setEditingInvestment(inv);
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await deleteDoc(
      doc(
        db,
        `artifacts/${process.env.REACT_APP_FIREBASE_PROJECT_ID}/users/${userId}/portfolio/${id}`
      )
    );
  };

  const handleSave = async (data) => {
    const base = `artifacts/${process.env.REACT_APP_FIREBASE_PROJECT_ID}/users/${userId}`;
    if (data.id) {
      await updateDoc(doc(db, `${base}/portfolio`, data.id), data);
    } else {
      await addDoc(collection(db, `${base}/portfolio`), data);
    }
    setIsModalOpen(false);
  };

  if (isLoading) return <LoadingScreen />;

  return (
    <CurrencyProvider>
      <Header onAdd={handleAdd} />
      <main className="flex-grow p-4 md:p-8 w-full overflow-x-hidden">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8 max-w-7xl mx-auto">
          {activeTab === "advisor" && <InvestmentAdvisor />}
          {activeTab === "research" && <ResearchSuite investments={investments} />}
          {activeTab === "scenario_planner" && <ScenarioPlanner investments={investments} />}
          {activeTab === "goals" && <GoalTracker goal={goal} investments={investments} onSaveGoal={handleSave} />}
          {activeTab === "portfolio" && (
            <>
              <Dashboard investments={investments} />
              <PortfolioTable investments={investments} onEdit={handleEdit} onDelete={handleDelete} />
            </>
          )}
        </div>
      </main>
      {isModalOpen && (
        <InvestmentModal
          isOpen={isModalOpen}
          investment={editingInvestment}
          onSave={handleSave}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </CurrencyProvider>
  );
}

export default App;
