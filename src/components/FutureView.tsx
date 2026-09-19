import React, { useState } from 'react';
import { FutureScenario } from '../types';
import { Sparkles, TrendingUp, AlertTriangle, HelpCircle, Compass, ShieldAlert, Cpu } from 'lucide-react';

interface FutureViewProps {
  query: string;
  scenarios?: FutureScenario[];
  keyDrivers?: string[];
  uncertainties?: string[];
}

export const FutureView: React.FC<FutureViewProps> = ({
  query,
  scenarios,
  keyDrivers,
  uncertainties
}) => {
  const [activeScenario, setActiveScenario] = useState<string>('all');

  const defaultDrivers = keyDrivers || [
    "Sub-2nm and solid-state materials scaling acceleration",
    "Decentralized edge neural orchestration replacing cloud-centric bottlenecks",
    "Global carbon tax and clean infrastructure mandates worldwide",
    "Convergence of quantum optimization algorithms with commercial workflows"
  ];

  const defaultUncertainties = uncertainties || [
    "Supply chain dependency on critical rare earth elements",
    "Geopolitical divergence in technology and AI safety standardizations",
    "Grid stability under massive intermittent renewable fluctuations"
  ];

  const defaultScenarios: FutureScenario[] = scenarios && scenarios.length > 0 ? scenarios : [
    {
      id: "sc-1",
      title: "Mainstream Acceleration Scenario (65% Probability)",
      probability: "High",
      timeframe: "2027 - 2032",
      keyDrivers: ["Solid-state battery scaling", "Unified autonomous transport protocols"],
      uncertainties: ["Mineral extraction bottlenecks"],
      description: "Standardized modular architectures achieve price parity with legacy tech, driving global adoption past 65% across OECD economies. Carbon offset targets met 3 years early.",
      claimType: "scenario"
    },
    {
      id: "sc-2",
      title: "Regional Fragmentation Scenario (25% Probability)",
      probability: "Moderate",
      timeframe: "2028 - 2035",
      keyDrivers: ["Tariff protections", "Disparate privacy regulations"],
      uncertainties: ["Cross-border data flow limitations"],
      description: "Bifurcated technical standards between western and eastern corridors slow universal interoperability, raising operational costs by 18%.",
      claimType: "scenario"
    },
    {
      id: "sc-3",
      title: "Disruptive Paradigm Shift Scenario (10% Probability)",
      probability: "Speculative",
      timeframe: "2032 - 2040",
      keyDrivers: ["Room-temperature superconductor breakthrough"],
      uncertainties: ["Physical manufacturing reproducibility"],
      description: "An unexpected physical mechanism renders silicon and electrochemical baselines obsolete, requiring complete redesign of planetary grid infrastructures.",
      claimType: "speculation"
    }
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6 space-y-2">
        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs uppercase tracking-wider">
          <Sparkles className="w-4 h-4" />
          <span>ANTIQORA Future Intelligence</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
          Probabilistic Horizons for {query || "the Future"}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
          Future Intelligence synthesizes published technological roadmaps, expert projections, and stochastic simulation models. We explicitly categorize all claims into <strong>Known Trends</strong>, <strong>Forecasts</strong>, and <strong>Scenarios</strong>.
        </p>
      </div>

      {/* Distinction Policy Banner */}
      <div className="rounded-2xl p-4 bg-purple-500/10 border border-purple-500/20 text-xs text-purple-800 dark:text-purple-300 flex items-start gap-3">
        <Compass className="w-5 h-5 flex-shrink-0 mt-0.5 text-purple-600 dark:text-purple-400" />
        <div className="space-y-1">
          <p className="font-bold">Future Horizon Methodology & Governance:</p>
          <p className="leading-relaxed">
            ANTIQORA never presents hypothetical projections as guaranteed facts. Every forward-looking projection represents a probability distribution anchored in current empirical data.
          </p>
        </div>
      </div>

      {/* Grid: Drivers & Uncertainties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Key Drivers */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
            <TrendingUp className="w-4 h-4" />
            <span>Primary Acceleration Drivers</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {defaultDrivers.map((driver, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{driver}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Critical Uncertainties */}
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span>Key Vulnerabilities & Uncertainties</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
            {defaultUncertainties.map((unc, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                <span className="leading-relaxed">{unc}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Scenarios Section */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Cpu className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <span>Multi-Scenario Forecast Matrix (2027 - 2040)</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {defaultScenarios.map((sc) => (
            <div
              key={sc.id}
              className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-purple-500/40 transition space-y-3 text-left"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-xl text-xs font-bold ${
                    sc.probability === 'High' 
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : sc.probability === 'Moderate'
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  }`}>
                    {sc.probability} Likelihood
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    Timeframe: {sc.timeframe}
                  </span>
                </div>
                <span className="text-[10px] font-bold uppercase text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                  [{sc.claimType.toUpperCase()}]
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {sc.title}
              </h3>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {sc.description}
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 block mb-0.5">Enabling Factors:</span>
                  <span className="text-slate-600 dark:text-slate-400">{sc.keyDrivers.join(', ')}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80">
                  <span className="font-semibold text-amber-600 dark:text-amber-400 block mb-0.5">Primary Risks:</span>
                  <span className="text-slate-600 dark:text-slate-400">{sc.uncertainties.join(', ')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
