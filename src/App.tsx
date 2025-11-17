import { useEffect, useMemo, useState } from 'react';
import './index.css';

type Industry = 'Construction' | 'Professional services' | 'Insurance' | 'Other';
type Stage = 'Intake' | 'Delivery' | 'Billing' | 'Support' | 'Back office' | 'Other';

type Process = {
  id: string;
  name: string;
  domain: string;
  owner: string;
  stage: Stage;
  category: string;
  description: string;
  systems: string;
  painPoints: string;
  dataSources: string;
  estVolumePerMonth?: number;
  estFteHoursPerMonth?: number;
  volume: number;
  manual: number;
  data: number;
  standardization: number;
  risk: number;
  aiFit: number;
  impact: number;
  effort: number;
  tags?: string[];
};

type TemplateSeed = Omit<Process, 'id'>;
type ReadinessFilter = 'All' | 'High' | 'Medium' | 'Low';

type ScoredProcess = Process & { readiness: number };

const industries: Industry[] = ['Construction', 'Professional services', 'Insurance', 'Other'];
const stages: Stage[] = ['Intake', 'Delivery', 'Billing', 'Support', 'Back office', 'Other'];
const readinessBands: ReadinessFilter[] = ['All', 'High', 'Medium', 'Low'];

const scoreWeights = {
  volume: 0.16,
  manual: 0.18,
  data: 0.14,
  standardization: 0.12,
  aiFit: 0.18,
  impact: 0.16,
  effort: 0.06,
};

const normalize = (value: number) => ((value - 1) / 4) * 100;

const readinessBandLabel = (score: number): ReadinessFilter => {
  if (score >= 75) return 'High';
  if (score >= 55) return 'Medium';
  return 'Low';
};

const calculateReadiness = (process: Process): number => {
  const volumeScore = normalize(process.volume);
  const manualScore = normalize(process.manual);
  const dataScore = normalize(process.data);
  const standardizationScore = normalize(process.standardization);
  const aiFitScore = normalize(process.aiFit);
  const impactScore = normalize(process.impact);
  const effortScore = 100 - normalize(process.effort);
  const riskFactor = 1 - ((process.risk - 1) / 4) * 0.12;

  const weighted =
    volumeScore * scoreWeights.volume +
    manualScore * scoreWeights.manual +
    dataScore * scoreWeights.data +
    standardizationScore * scoreWeights.standardization +
    aiFitScore * scoreWeights.aiFit +
    impactScore * scoreWeights.impact +
    effortScore * scoreWeights.effort;

  return Math.round(Math.max(0, Math.min(100, weighted * riskFactor)));
};

const genId = () =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

const makeSeeds = (items: TemplateSeed[]): Process[] =>
  items.map((seed) => ({ ...seed, id: genId() }));

const generateTemplateProcesses = (industry: Industry): Process[] => {
  const sharedSeeds: TemplateSeed[] = [
    {
      name: 'Customer onboarding',
      owner: 'Ops lead',
      stage: 'Intake',
      domain: 'Client experience',
      category: 'Intake',
      description: 'Collect requirements, set up folders, kick-off workflows.',
      systems: 'Email, CRM, file storage',
      painPoints: 'Manual document requests, inconsistent templates',
      dataSources: 'Intake forms, CRM records',
      estVolumePerMonth: 25,
      estFteHoursPerMonth: 80,
      volume: 3,
      manual: 4,
      data: 3,
      standardization: 3,
      risk: 2,
      aiFit: 4,
      impact: 3,
      effort: 3,
      tags: ['onboarding', 'templates'],
    },
    {
      name: 'Invoice processing',
      owner: 'Finance manager',
      stage: 'Billing',
      domain: 'Finance',
      category: 'Billing',
      description: 'Validate and post vendor invoices; route approvals.',
      systems: 'ERP, AP inbox',
      painPoints: 'Duplicate data entry, missing approvals',
      dataSources: 'Invoices, PO data',
      estVolumePerMonth: 180,
      estFteHoursPerMonth: 120,
      volume: 4,
      manual: 4,
      data: 3,
      standardization: 4,
      risk: 3,
      aiFit: 3,
      impact: 4,
      effort: 3,
      tags: ['finance', 'ap'],
    },
  ];

  const constructionSeeds: TemplateSeed[] = [
    {
      name: 'Bid estimating & takeoffs',
      owner: 'Preconstruction director',
      stage: 'Intake',
      domain: 'Preconstruction',
      category: 'Estimating',
      description: 'Quantify materials and labor from plans for bids.',
      systems: 'Bluebeam, Excel, takeoff tools',
      painPoints: 'Time-consuming measurements, version control issues',
      dataSources: 'Drawings, specs, historical bids',
      estVolumePerMonth: 14,
      estFteHoursPerMonth: 160,
      volume: 3,
      manual: 4,
      data: 3,
      standardization: 3,
      risk: 4,
      aiFit: 4,
      impact: 4,
      effort: 2,
      tags: ['bidding', 'precon'],
    },
    {
      name: 'RFIs and submittals',
      owner: 'Project engineer',
      stage: 'Delivery',
      domain: 'Field operations',
      category: 'Coordination',
      description: 'Log, route, and respond to RFIs and submittals.',
      systems: 'Procore, email, spreadsheets',
      painPoints: 'Cycle time delays, missing attachments',
      dataSources: 'RFIs, drawings, correspondence',
      estVolumePerMonth: 80,
      estFteHoursPerMonth: 90,
      volume: 4,
      manual: 3,
      data: 3,
      standardization: 4,
      risk: 3,
      aiFit: 3,
      impact: 4,
      effort: 3,
      tags: ['field', 'coordination'],
    },
    {
      name: 'Daily field reports',
      owner: 'Superintendent',
      stage: 'Delivery',
      domain: 'Field operations',
      category: 'Reporting',
      description: 'Capture manpower, safety, weather, and production daily.',
      systems: 'Procore, mobile apps',
      painPoints: 'Incomplete data, late submissions',
      dataSources: 'Mobile forms, photos',
      estVolumePerMonth: 400,
      estFteHoursPerMonth: 50,
      volume: 5,
      manual: 3,
      data: 3,
      standardization: 3,
      risk: 2,
      aiFit: 3,
      impact: 3,
      effort: 4,
      tags: ['reporting', 'safety'],
    },
    {
      name: 'Progress billing (AIA)',
      owner: 'Project accountant',
      stage: 'Billing',
      domain: 'Finance',
      category: 'Billing',
      description: 'Prepare and submit monthly pay apps with backups.',
      systems: 'ERP, Excel, Procore',
      painPoints: 'Manual backup gathering, submission errors',
      dataSources: 'Contracts, change orders, schedule of values',
      estVolumePerMonth: 20,
      estFteHoursPerMonth: 75,
      volume: 3,
      manual: 4,
      data: 4,
      standardization: 4,
      risk: 3,
      aiFit: 3,
      impact: 4,
      effort: 3,
      tags: ['billing', 'pay app'],
    },
    {
      name: 'Change order management',
      owner: 'Project manager',
      stage: 'Delivery',
      domain: 'Project controls',
      category: 'Change control',
      description: 'Identify, price, and approve change orders.',
      systems: 'Procore, Excel, ERP',
      painPoints: 'Late notice, weak audit trails',
      dataSources: 'RFIs, drawings, labor logs',
      estVolumePerMonth: 18,
      estFteHoursPerMonth: 110,
      volume: 3,
      manual: 4,
      data: 3,
      standardization: 3,
      risk: 4,
      aiFit: 3,
      impact: 5,
      effort: 2,
      tags: ['controls', 'commercial'],
    },
  ];

  const professionalSeeds: TemplateSeed[] = [
    {
      name: 'Statement of work drafting',
      owner: 'Engagement manager',
      stage: 'Intake',
      domain: 'Sales ops',
      category: 'Contracting',
      description: 'Draft SOWs based on discovery notes and templates.',
      systems: 'Docs editor, CRM',
      painPoints: 'Versioning, approvals, manual copy/paste',
      dataSources: 'Call notes, proposal templates',
      estVolumePerMonth: 22,
      estFteHoursPerMonth: 70,
      volume: 3,
      manual: 4,
      data: 3,
      standardization: 4,
      risk: 3,
      aiFit: 4,
      impact: 4,
      effort: 3,
      tags: ['sales', 'contracts'],
    },
    {
      name: 'Resource staffing & forecasting',
      owner: 'Delivery director',
      stage: 'Delivery',
      domain: 'Operations',
      category: 'Planning',
      description: 'Match skills to projects and forecast utilization.',
      systems: 'PSA, spreadsheets',
      painPoints: 'Manual skill matching, stale data',
      dataSources: 'Project plans, skills inventory',
      estVolumePerMonth: 40,
      estFteHoursPerMonth: 95,
      volume: 4,
      manual: 3,
      data: 3,
      standardization: 3,
      risk: 2,
      aiFit: 3,
      impact: 4,
      effort: 3,
      tags: ['staffing', 'forecasting'],
    },
    {
      name: 'Engagement reporting',
      owner: 'Client lead',
      stage: 'Delivery',
      domain: 'Client success',
      category: 'Reporting',
      description: 'Prepare weekly executive-ready updates.',
      systems: 'BI tool, slides',
      painPoints: 'Data wrangling, slow insights',
      dataSources: 'Time tracking, project plans',
      estVolumePerMonth: 45,
      estFteHoursPerMonth: 60,
      volume: 4,
      manual: 3,
      data: 4,
      standardization: 3,
      risk: 2,
      aiFit: 4,
      impact: 4,
      effort: 4,
      tags: ['reporting', 'analytics'],
    },
    {
      name: 'Time & expense audit',
      owner: 'Finance ops',
      stage: 'Billing',
      domain: 'Finance',
      category: 'Compliance',
      description: 'Audit submitted time and expenses against policy.',
      systems: 'ERP, expense tool',
      painPoints: 'Manual sampling, policy exceptions',
      dataSources: 'Timecards, receipts',
      estVolumePerMonth: 320,
      estFteHoursPerMonth: 85,
      volume: 5,
      manual: 3,
      data: 4,
      standardization: 4,
      risk: 3,
      aiFit: 3,
      impact: 3,
      effort: 3,
      tags: ['billing', 'compliance'],
    },
    {
      name: 'Renewal playbooks',
      owner: 'Customer success',
      stage: 'Support',
      domain: 'Customer success',
      category: 'Retention',
      description: 'Run renewal motions and health checks.',
      systems: 'CS platform, CRM',
      painPoints: 'Manual reminders, inconsistent messaging',
      dataSources: 'Usage data, NPS, support logs',
      estVolumePerMonth: 28,
      estFteHoursPerMonth: 70,
      volume: 3,
      manual: 3,
      data: 4,
      standardization: 3,
      risk: 2,
      aiFit: 4,
      impact: 4,
      effort: 4,
      tags: ['success', 'renewals'],
    },
  ];

  const insuranceSeeds: TemplateSeed[] = [
    {
      name: 'Claims intake triage',
      owner: 'Claims supervisor',
      stage: 'Intake',
      domain: 'Claims',
      category: 'Triage',
      description: 'Capture FNOL details, classify, and assign adjusters.',
      systems: 'Claims system, telephony, email',
      painPoints: 'Manual data entry, missing info, slow assignments',
      dataSources: 'Emails, voice transcripts, forms',
      estVolumePerMonth: 520,
      estFteHoursPerMonth: 160,
      volume: 5,
      manual: 4,
      data: 3,
      standardization: 4,
      risk: 4,
      aiFit: 4,
      impact: 5,
      effort: 3,
      tags: ['claims', 'intake'],
    },
    {
      name: 'Policy underwriting',
      owner: 'Underwriting lead',
      stage: 'Delivery',
      domain: 'Underwriting',
      category: 'Risk assessment',
      description: 'Review submissions, evaluate risk, issue quotes.',
      systems: 'Policy admin, rating engines',
      painPoints: 'Document review overhead, inconsistent risk notes',
      dataSources: 'Applications, credit data, loss runs',
      estVolumePerMonth: 210,
      estFteHoursPerMonth: 200,
      volume: 4,
      manual: 4,
      data: 4,
      standardization: 3,
      risk: 4,
      aiFit: 3,
      impact: 5,
      effort: 2,
      tags: ['underwriting', 'risk'],
    },
    {
      name: 'Fraud screening',
      owner: 'SIU analyst',
      stage: 'Delivery',
      domain: 'Fraud',
      category: 'Investigation',
      description: 'Identify suspicious claims for SIU review.',
      systems: 'Analytics platform',
      painPoints: 'False positives, manual lookups',
      dataSources: 'Claims data, third-party data',
      estVolumePerMonth: 90,
      estFteHoursPerMonth: 70,
      volume: 3,
      manual: 2,
      data: 4,
      standardization: 4,
      risk: 4,
      aiFit: 4,
      impact: 4,
      effort: 3,
      tags: ['fraud', 'analytics'],
    },
    {
      name: 'Customer billing queries',
      owner: 'Policy service team',
      stage: 'Support',
      domain: 'Service',
      category: 'Support',
      description: 'Resolve billing-related inquiries and adjustments.',
      systems: 'CRM, billing system',
      painPoints: 'Repetitive questions, knowledge gaps',
      dataSources: 'Call transcripts, account data',
      estVolumePerMonth: 350,
      estFteHoursPerMonth: 120,
      volume: 5,
      manual: 3,
      data: 3,
      standardization: 3,
      risk: 2,
      aiFit: 4,
      impact: 3,
      effort: 4,
      tags: ['support', 'billing'],
    },
    {
      name: 'Subrogation recovery',
      owner: 'Subrogation lead',
      stage: 'Back office',
      domain: 'Recovery',
      category: 'Finance',
      description: 'Identify and pursue third-party recoveries.',
      systems: 'Claims, legal trackers',
      painPoints: 'Manual document gathering, slow notices',
      dataSources: 'Claims files, police reports',
      estVolumePerMonth: 60,
      estFteHoursPerMonth: 140,
      volume: 3,
      manual: 4,
      data: 3,
      standardization: 3,
      risk: 3,
      aiFit: 3,
      impact: 4,
      effort: 3,
      tags: ['recovery', 'finance'],
    },
  ];

  const otherSeeds: TemplateSeed[] = [
    {
      name: 'Generic intake triage',
      owner: 'Operations',
      stage: 'Intake',
      domain: 'Operations',
      category: 'Intake',
      description: 'Log requests and dispatch to teams.',
      systems: 'Email, forms',
      painPoints: 'Manual routing, lost requests',
      dataSources: 'Forms, inboxes',
      estVolumePerMonth: 60,
      estFteHoursPerMonth: 40,
      volume: 3,
      manual: 3,
      data: 3,
      standardization: 3,
      risk: 2,
      aiFit: 3,
      impact: 3,
      effort: 4,
      tags: ['intake'],
    },
    ...sharedSeeds,
  ];

  const base =
    industry === 'Construction'
      ? makeSeeds([...constructionSeeds, ...sharedSeeds])
      : industry === 'Professional services'
      ? makeSeeds([...professionalSeeds, ...sharedSeeds])
      : industry === 'Insurance'
      ? makeSeeds([...insuranceSeeds, ...sharedSeeds])
      : makeSeeds(otherSeeds);

  const expanded = base.flatMap((item, idx) => {
    if (idx % 4 === 0) {
      return [
        item,
        { ...item, id: genId(), name: `${item.name} - variant ${idx + 1}` },
      ];
    }
    return item;
  });

  return expanded;
};

const pillColor = (score: number) => {
  if (score >= 75) return 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/40';
  if (score >= 55) return 'bg-amber-500/15 text-amber-300 border border-amber-500/40';
  return 'bg-slate-700/60 text-slate-200 border border-slate-600/80';
};

const Slider = ({
  label,
  value,
  onChange,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
  onChange: (val: number) => void;
}) => (
  <div className="flex flex-col gap-1">
    <div className="flex justify-between text-[12px] text-slate-200">
      <span>{label}</span>
      <span className="text-slate-400">{value} / 5</span>
    </div>
    <input
      type="range"
      min={1}
      max={5}
      step={1}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="accent-emerald-400"
    />
    <p className="text-[11px] text-slate-500">{helper}</p>
  </div>
);

const ProcessRow = ({
  process,
  selected,
  onSelect,
  onDelete,
}: {
  process: ScoredProcess;
  selected: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) => (
  <div
    onClick={onSelect}
    className={`grid grid-cols-[1.2fr,0.9fr,0.9fr,1fr,0.6fr,40px] items-center gap-3 rounded-xl border px-3 py-2 transition hover:border-emerald-500/40 hover:bg-slate-800/60 ${
      selected ? 'border-emerald-500/50 bg-slate-800/70' : 'border-slate-800 bg-slate-900/60'
    }`}
  >
    <div className="flex flex-col">
      <span className="font-semibold text-[13px] text-white">{process.name}</span>
      <span className="text-[11px] text-slate-400">{process.owner || 'Owner not set'}</span>
    </div>
    <span className="text-[12px] text-slate-300">{process.stage}</span>
    <span className="text-[12px] text-slate-300">{process.domain || '—'}</span>
    <span className="text-[12px] text-slate-300">
      {process.tags && process.tags.length > 0 ? process.tags.join(', ') : '—'}
    </span>
    <span className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-1 text-[12px] ${pillColor(process.readiness)}`}>
      {process.readiness}
    </span>
    <button
      aria-label="Delete process"
      onClick={(e) => {
        e.stopPropagation();
        onDelete();
      }}
      className="flex h-7 w-7 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-red-500 hover:text-red-300"
    >
      ×
    </button>
  </div>
);

function App() {
  const [industry, setIndustry] = useState<Industry>('Construction');
  const [clientName, setClientName] = useState('');
  const [processes, setProcesses] = useState<Process[]>(() => generateTemplateProcesses('Construction'));
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [filters, setFilters] = useState({ stage: 'All' as Stage | 'All', readiness: 'All' as ReadinessFilter, tag: '', search: '' });

  useEffect(() => {
    setProcesses(generateTemplateProcesses(industry));
    setSelectedProcessId(null);
    setFilters({ stage: 'All', readiness: 'All', tag: '', search: '' });
  }, [industry]);

  const scoredProcesses = useMemo<ScoredProcess[]>(
    () => processes.map((p) => ({ ...p, readiness: calculateReadiness(p) })),
    [processes],
  );

  const filteredProcesses = useMemo(() => {
    return scoredProcesses.filter((p) => {
      const stageMatch = filters.stage === 'All' || p.stage === filters.stage;
      const readinessMatch =
        filters.readiness === 'All' || readinessBandLabel(p.readiness) === filters.readiness;
      const tagMatch =
        !filters.tag.trim() ||
        (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(filters.tag.toLowerCase())));
      const search = filters.search.toLowerCase();
      const searchMatch =
        !search ||
        [p.name, p.domain, p.category, p.owner]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(search));

      return stageMatch && readinessMatch && tagMatch && searchMatch;
    });
  }, [filters, scoredProcesses]);

  const selectedProcess = processes.find((p) => p.id === selectedProcessId) || null;
  const selectedReadiness = scoredProcesses.find((p) => p.id === selectedProcessId)?.readiness ?? null;

  const portfolioStats = useMemo(() => {
    if (filteredProcesses.length === 0) {
      return { avg: 0, max: 0, highCount: 0, maxName: '' };
    }
    const total = filteredProcesses.reduce((acc, p) => acc + p.readiness, 0);
    const avg = Math.round(total / filteredProcesses.length);
    const maxProcess = filteredProcesses.reduce((prev, curr) =>
      curr.readiness > prev.readiness ? curr : prev,
    );
    const highCount = filteredProcesses.filter((p) => p.readiness >= 70).length;
    return { avg, max: maxProcess.readiness, highCount, maxName: maxProcess.name };
  }, [filteredProcesses]);

  const executiveSummary = useMemo(() => {
    if (scoredProcesses.length === 0) return 'No processes mapped yet.';

    const total = scoredProcesses.length;
    const readinessAverage = Math.round(
      scoredProcesses.reduce((sum, p) => sum + p.readiness, 0) / scoredProcesses.length,
    );
    const stagesCovered = new Set(scoredProcesses.map((p) => p.stage)).size;
    const highRoi = scoredProcesses.filter((p) => p.readiness >= 70).length;
    const medium = scoredProcesses.filter((p) => p.readiness >= 50 && p.readiness < 70).length;
    const topThree = [...scoredProcesses]
      .sort((a, b) => b.readiness - a.readiness)
      .slice(0, 3)
      .map((p) => `${p.name} (${p.readiness})`)
      .join(', ');

    return `We mapped ${total} processes across ${stagesCovered} lifecycle stages for ${clientName || 'the client'}, with an average readiness of ${readinessAverage}/100. ${highRoi} are high-ROI candidates (≥70) and ${medium} are mid-readiness opportunities. Top contenders: ${topThree}. Prioritize high-impact, lower-effort items first while sequencing strategic builds for higher-effort candidates.`;
  }, [clientName, scoredProcesses]);

  const updateProcess = (id: string, updater: (prev: Process) => Process) => {
    setProcesses((prev) => prev.map((p) => (p.id === id ? updater(p) : p)));
  };

  const addProcess = () => {
    const newProcess: Process = {
      id: genId(),
      name: 'New process',
      owner: '',
      stage: 'Intake',
      domain: '',
      category: '',
      description: '',
      systems: '',
      painPoints: '',
      dataSources: '',
      estVolumePerMonth: undefined,
      estFteHoursPerMonth: undefined,
      volume: 3,
      manual: 3,
      data: 3,
      standardization: 3,
      risk: 2,
      aiFit: 3,
      impact: 3,
      effort: 3,
      tags: [],
    };
    setProcesses((prev) => [newProcess, ...prev]);
    setSelectedProcessId(newProcess.id);
  };

  const duplicateProcess = () => {
    if (!selectedProcess) return;
    const dup: Process = { ...selectedProcess, id: genId(), name: `${selectedProcess.name} (copy)` };
    setProcesses((prev) => [dup, ...prev]);
    setSelectedProcessId(dup.id);
  };

  const deleteProcess = (id: string) => {
    setProcesses((prev) => prev.filter((p) => p.id !== id));
    if (selectedProcessId === id) {
      setSelectedProcessId(null);
    }
  };

  const resetScores = () => {
    if (!selectedProcess) return;
    updateProcess(selectedProcess.id, (p) => ({
      ...p,
      volume: 3,
      manual: 3,
      data: 3,
      standardization: 3,
      risk: 3,
      aiFit: 3,
      impact: 3,
      effort: 3,
    }));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 md:flex-nowrap">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 shadow-soft">
              <span className="text-lg font-bold">CAI</span>
            </div>
            <div>
              <p className="text-[13px] uppercase tracking-[0.2em] text-slate-400">CederusAI</p>
              <h1 className="text-lg font-semibold text-white">Process Readiness Studio</h1>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <label className="text-slate-400">Business type</label>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value as Industry)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
            >
              {industries.map((ind) => (
                <option key={ind} value={ind}>
                  {ind}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-5 lg:grid-cols-[1.2fr,1fr]">
          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-slate-400">Engagement setup</p>
                  <h2 className="text-lg font-semibold text-white">Workshop context</h2>
                </div>
                <div className="text-right text-[12px] text-slate-400">
                  <p>Processes in library</p>
                  <p className="text-xl font-semibold text-emerald-300">{processes.length}</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-slate-400">Client / firm name</label>
                  <input
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Acme Construction Co."
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-slate-400">Business type</label>
                  <div className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-emerald-200">
                    {industry}
                  </div>
                </div>
              </div>
              <p className="mt-3 text-[12px] text-slate-500">
                Change the business type to swap in a curated portfolio of workflows for that industry.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-soft">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-slate-400">Portfolio of workflows</p>
                  <h2 className="text-lg font-semibold text-white">Processes</h2>
                </div>
                <div className="flex items-center gap-2 text-[12px] text-slate-400">
                  <span>Showing</span>
                  <span className="rounded-full bg-slate-800 px-2 py-1 text-emerald-200">
                    {filteredProcesses.length} of {scoredProcesses.length}
                  </span>
                  <span>processes</span>
                </div>
              </div>

              <div className="mb-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-slate-400">Stage</label>
                  <select
                    value={filters.stage}
                    onChange={(e) => setFilters((prev) => ({ ...prev, stage: e.target.value as Stage | 'All' }))}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    <option value="All">All</option>
                    {stages.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-slate-400">Readiness band</label>
                  <select
                    value={filters.readiness}
                    onChange={(e) => setFilters((prev) => ({ ...prev, readiness: e.target.value as ReadinessFilter }))}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {readinessBands.map((band) => (
                      <option key={band} value={band}>
                        {band}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-slate-400">Tag filter</label>
                  <input
                    value={filters.tag}
                    onChange={(e) => setFilters((prev) => ({ ...prev, tag: e.target.value }))}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="e.g. billing"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-[12px] text-slate-400">Search</label>
                  <input
                    value={filters.search}
                    onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                    className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    placeholder="Name, domain, category, owner"
                  />
                </div>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                <button
                  onClick={addProcess}
                  className="rounded-xl border border-emerald-500/60 bg-emerald-500/10 px-3 py-2 text-sm font-semibold text-emerald-200 transition hover:border-emerald-400"
                >
                  + Add process
                </button>
                <button
                  onClick={duplicateProcess}
                  disabled={!selectedProcess}
                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-sm font-semibold text-slate-200 transition hover:border-slate-500 disabled:opacity-40"
                >
                  Duplicate
                </button>
              </div>

              <div className="grid gap-2">
                <div className="grid grid-cols-[1.2fr,0.9fr,0.9fr,1fr,0.6fr,40px] items-center gap-3 px-3 text-[12px] text-slate-400">
                  <span>Process</span>
                  <span>Stage</span>
                  <span>Domain</span>
                  <span>Tags</span>
                  <span>Readiness</span>
                  <span></span>
                </div>
                <div className="flex flex-col gap-2">
                  {filteredProcesses.map((process) => (
                    <ProcessRow
                      key={process.id}
                      process={process}
                      selected={process.id === selectedProcessId}
                      onSelect={() => setSelectedProcessId(process.id)}
                      onDelete={() => deleteProcess(process.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-5">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-soft">
              <div className="mb-4 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[13px] text-slate-400">Process editor</p>
                  <h2 className="text-lg font-semibold text-white">Details & scoring factors</h2>
                </div>
                {selectedReadiness !== null && (
                  <span className={`rounded-full px-3 py-1 text-sm font-semibold ${pillColor(selectedReadiness)}`}>
                    Readiness: {selectedReadiness} / 100
                  </span>
                )}
              </div>

              {selectedProcess ? (
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={resetScores}
                      className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-emerald-500"
                    >
                      Reset scores
                    </button>
                    <button
                      onClick={() => setSelectedProcessId(null)}
                      className="rounded-xl border border-slate-700 bg-slate-800/70 px-3 py-2 text-sm font-semibold text-slate-200 hover:border-slate-500"
                    >
                      Deselect
                    </button>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Process name</label>
                      <input
                        value={selectedProcess.name}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, name: e.target.value }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Primary owner</label>
                      <input
                        value={selectedProcess.owner}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, owner: e.target.value }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Stage</label>
                      <select
                        value={selectedProcess.stage}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({
                            ...p,
                            stage: e.target.value as Stage,
                          }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Domain / area</label>
                      <input
                        value={selectedProcess.domain}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, domain: e.target.value }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Category / type</label>
                      <input
                        value={selectedProcess.category}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, category: e.target.value }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Short description</label>
                      <textarea
                        value={selectedProcess.description}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, description: e.target.value }))
                        }
                        rows={3}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Key pain points</label>
                      <textarea
                        value={selectedProcess.painPoints}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, painPoints: e.target.value }))
                        }
                        rows={3}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Data sources</label>
                      <input
                        value={selectedProcess.dataSources}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, dataSources: e.target.value }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Systems & tools involved</label>
                      <input
                        value={selectedProcess.systems}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({ ...p, systems: e.target.value }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Est. volume / month</label>
                      <input
                        type="number"
                        value={selectedProcess.estVolumePerMonth ?? ''}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({
                            ...p,
                            estVolumePerMonth: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Est. FTE hours / month</label>
                      <input
                        type="number"
                        value={selectedProcess.estFteHoursPerMonth ?? ''}
                        onChange={(e) =>
                          updateProcess(selectedProcess.id, (p) => ({
                            ...p,
                            estFteHoursPerMonth: e.target.value ? Number(e.target.value) : undefined,
                          }))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-[12px] text-slate-400">Tags (comma separated)</label>
                      <input
                        value={selectedProcess.tags?.join(', ') ?? ''}
                        onChange={(e) => {
                          const tags = e.target.value
                            .split(',')
                            .map((t) => t.trim())
                            .filter(Boolean);
                          updateProcess(selectedProcess.id, (p) => ({ ...p, tags }));
                        }}
                        className="rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-white focus:border-emerald-500 focus:outline-none"
                        placeholder="billing, intake"
                      />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <Slider
                      label="Volume & frequency"
                      value={selectedProcess.volume}
                      helper="How often this workflow runs and its throughput."
                      onChange={(val) => updateProcess(selectedProcess.id, (p) => ({ ...p, volume: val }))}
                    />
                    <Slider
                      label="Manual touchpoints"
                      value={selectedProcess.manual}
                      helper="Number of human touchpoints and handoffs required."
                      onChange={(val) => updateProcess(selectedProcess.id, (p) => ({ ...p, manual: val }))}
                    />
                    <Slider
                      label="Data availability"
                      value={selectedProcess.data}
                      helper="How well the data is structured and accessible."
                      onChange={(val) => updateProcess(selectedProcess.id, (p) => ({ ...p, data: val }))}
                    />
                    <Slider
                      label="Standardization"
                      value={selectedProcess.standardization}
                      helper="Consistency of inputs/outputs and playbooks."
                      onChange={(val) =>
                        updateProcess(selectedProcess.id, (p) => ({ ...p, standardization: val }))
                      }
                    />
                    <Slider
                      label="Risk & controls"
                      value={selectedProcess.risk}
                      helper="Regulatory / control sensitivity (higher = more risk)."
                      onChange={(val) => updateProcess(selectedProcess.id, (p) => ({ ...p, risk: val }))}
                    />
                    <Slider
                      label="AI suitability"
                      value={selectedProcess.aiFit}
                      helper="Pattern recognition, language, or prediction heavy?"
                      onChange={(val) => updateProcess(selectedProcess.id, (p) => ({ ...p, aiFit: val }))}
                    />
                    <Slider
                      label="Business impact"
                      value={selectedProcess.impact}
                      helper="Revenue, margin, or risk reduction upside."
                      onChange={(val) => updateProcess(selectedProcess.id, (p) => ({ ...p, impact: val }))}
                    />
                    <Slider
                      label="Effort to automate"
                      value={selectedProcess.effort}
                      helper="How hard it would be to automate (5 = easier)."
                      onChange={(val) => updateProcess(selectedProcess.id, (p) => ({ ...p, effort: val }))}
                    />
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-800 bg-slate-950/60 p-6 text-center text-sm text-slate-400">
                  Select a process to edit details and scoring.
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-soft">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[13px] text-slate-400">Portfolio view</p>
                  <h2 className="text-lg font-semibold text-white">Opportunity snapshot (current filters)</h2>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-[12px] text-slate-400">Average readiness</p>
                  <p className="text-2xl font-semibold text-emerald-300">{portfolioStats.avg} / 100</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-[12px] text-slate-400">Highest scored process</p>
                  <p className="text-2xl font-semibold text-cyan-300">{portfolioStats.max} / 100</p>
                  <p className="text-[12px] text-slate-400">{portfolioStats.maxName || '—'}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
                  <p className="text-[12px] text-slate-400">High-ROI candidates (≥70)</p>
                  <p className="text-2xl font-semibold text-amber-300">{portfolioStats.highCount}</p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 rounded-xl border border-slate-800 bg-slate-950/60 p-4 md:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-[12px] text-slate-400">Impact vs effort lens</p>
                  <div className="mt-3 grid grid-cols-2 gap-3 text-[12px] text-slate-200">
                    <div className="rounded-lg border border-slate-800 bg-slate-800/60 p-3">
                      <p className="font-semibold text-emerald-200">High impact / low effort</p>
                      <p className="text-[11px] text-slate-400">Immediate wins</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-800/60 p-3">
                      <p className="font-semibold text-amber-200">High impact / high effort</p>
                      <p className="text-[11px] text-slate-400">Strategic projects</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-800/60 p-3">
                      <p className="font-semibold text-slate-200">Low impact / low effort</p>
                      <p className="text-[11px] text-slate-400">Nice-to-haves</p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-slate-800/60 p-3">
                      <p className="font-semibold text-slate-200">Low impact / high effort</p>
                      <p className="text-[11px] text-slate-400">Avoid for now</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4">
                  <p className="text-[12px] text-slate-400">Executive summary (copy/paste)</p>
                  <p className="mt-2 text-sm leading-relaxed text-slate-100">{executiveSummary}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
