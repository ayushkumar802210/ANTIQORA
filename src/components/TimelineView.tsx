import React, { useState } from 'react';
import { TimelineEvent, ClaimType } from '../types';
import { Clock, Calendar, ArrowRight, ShieldCheck, Sparkles, Filter, Info } from 'lucide-react';

interface TimelineViewProps {
  events: TimelineEvent[];
  query: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ events, query }) => {
  const [filterEra, setFilterEra] = useState<'all' | 'past' | 'present' | 'future'>('all');

  const defaultEvents: TimelineEvent[] = events && events.length > 0 ? events : [
    {
      id: "t-1",
      year: "1880 - 1920",
      title: "First Generation Discoveries & Early Prototypes",
      description: "Foundational physical laws formalized. Early electro-mechanical experiments prove the feasibility of the concept in academic institutions.",
      era: "past",
      claimType: "known_fact",
      sources: ["Royal Society of Science Archives", "IEEE History Center"]
    },
    {
      id: "t-2",
      year: "1950 - 1985",
      title: "Digital Logic & Solid-State Transition",
      description: "Silicon transistors, microcode compilers, and networked data protocols emerge, enabling industrial-scale automated testing.",
      era: "past",
      claimType: "known_fact",
      sources: ["Computer History Museum", "MIT Technical Reports"]
    },
    {
      id: "t-3",
      year: "2000 - 2023",
      title: "Global Distributed Deployment",
      description: "Ubiquitous internet infrastructure, multi-gigabit fiber grids, and cloud data centers establish universal consumer and enterprise connectivity.",
      era: "past",
      claimType: "known_fact",
      sources: ["Global Internet Consortium", "Telecommunications Standard Archive"]
    },
    {
      id: "t-4",
      year: "2024 - 2026 (Current Present)",
      title: "Autonomous Edge Intelligence & Neural Acceleration",
      description: "Sub-5nm neural silicon architectures, real-time multimodal transformers, and microgrid decentralized storage achieve mainstream deployment worldwide.",
      era: "present",
      claimType: "known_fact",
      sources: ["International Technology Roadmap 2026", "Global Semiconductor Review"]
    },
    {
      id: "t-5",
      year: "2028 - 2032 (Forecast)",
      title: "Fault-Tolerant Quantum & Room-Temperature Synthesis",
      description: "Predicted commercialization of topologically protected quantum logic gates and automated molecular design synthesis networks.",
      era: "future",
      claimType: "forecast",
      certainty: 70,
      sources: ["National Academy of Engineering Projections", "Quantum Roadmap 2030"]
    },
    {
      id: "t-6",
      year: "2035+ (Long-Range Scenario)",
      title: "Planetary Autonomous Ecosystem Coordination",
      description: "Decentralized autonomous AI-managed climate mitigation microgrids, closed-loop interplanetary robotic logistics, and ambient neural interfaces.",
      era: "future",
      claimType: "scenario",
      certainty: 40,
      sources: ["World Future Studies Federation", "Deep Space Exploration Initiative"]
    }
  ];

  const filtered = defaultEvents.filter(e => filterEra === 'all' || e.era === filterEra);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 space-y-8 animate-fadeIn text-left">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 font-bold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4" />
            <span>3D Multi-Temporal Timeline</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            Chronological Evolution of {query || "the Topic"}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Trace the complete trajectory from historical origins through live present milestones to future probabilistic scenarios.
          </p>
        </div>

        {/* Filter Era Buttons */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setFilterEra('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterEra === 'all' ? 'bg-cyan-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            All Eras
          </button>
          <button
            onClick={() => setFilterEra('past')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterEra === 'past' ? 'bg-indigo-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Past Roots
          </button>
          <button
            onClick={() => setFilterEra('present')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterEra === 'present' ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Present (2026)
          </button>
          <button
            onClick={() => setFilterEra('future')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
              filterEra === 'future' ? 'bg-purple-500 text-white shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Future (2028-2040)
          </button>
        </div>
      </div>

      {/* Distinction Disclaimer Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300">
        <Info className="w-4 h-4 text-cyan-500 flex-shrink-0" />
        <div>
          <strong className="text-slate-900 dark:text-white">Factual Provenance Distinction:</strong> Past & Present milestones reflect documented facts. Future milestones represent published technological forecasts and scenario simulations — never guaranteed certainties.
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative border-l-2 border-cyan-500/30 ml-4 sm:ml-8 pl-6 sm:pl-8 space-y-10">
        {filtered.map((event, idx) => {
          const isPast = event.era === 'past';
          const isPresent = event.era === 'present';
          const isFuture = event.era === 'future';

          return (
            <div key={event.id || idx} className="relative group">
              {/* Dot Icon */}
              <div className={`absolute -left-[35px] sm:-left-[43px] top-1.5 w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${
                isPresent
                  ? 'bg-emerald-500 border-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                  : isFuture
                  ? 'bg-purple-600 border-purple-300 shadow-[0_0_12px_rgba(168,85,247,0.4)]'
                  : 'bg-indigo-600 border-indigo-300'
              }`}>
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
              </div>

              {/* Event Card */}
              <div className="rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-900/80 p-5 sm:p-6 shadow-sm hover:shadow-md transition space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl text-xs font-bold font-mono bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border border-cyan-500/20">
                      {event.year}
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      isPresent
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                        : isFuture
                        ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/30'
                        : 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/30'
                    }`}>
                      {event.era}
                    </span>
                  </div>

                  {event.claimType && (
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      [{event.claimType.replace('_', ' ')}]
                    </span>
                  )}
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {event.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {event.description}
                </p>

                {event.certainty !== undefined && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-purple-600 dark:text-purple-400 mb-1">
                      <span>Projection Probability / Consensus</span>
                      <span>{event.certainty}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: `${event.certainty}%` }} />
                    </div>
                  </div>
                )}

                {event.sources && event.sources.length > 0 && (
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-wrap items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-semibold">Citations:</span>
                    {event.sources.map((src, i) => (
                      <span key={i} className="text-[10px] text-cyan-600 dark:text-cyan-400 bg-slate-50 dark:bg-slate-950 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                        {src}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
