// This is now the dashboard route for the main app at /commercial-dashboard
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Download,
  TrendingUp,
  Target,
  DollarSign,
  Shield,
  FileText,
  BarChart3,
  Zap,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { MoleculeMetadata } from "./components/molecule-metadata"
import { LoadingScreen } from "./components/loading-screen"
import { CompoundProfile } from "./components/compound-profile"
import { CompetitiveLandscape } from "./components/competitive-landscape"
import { MarketSize } from "./components/market-size"
import { PricingAccess } from "./components/pricing-access"
import { IncentivesRegulation } from "./components/incentives-regulation"
import { IPPositioning } from "./components/ip-positioning"
import { FinancialProjections } from "./components/financial-projections"
import { StrategicFit } from "./components/strategic-fit"
import './globals.css';

const modules = [
  { id: "compound", label: "Compound Profile", icon: Target },
  { id: "competitive", label: "Competitive Landscape", icon: BarChart3 },
  { id: "market", label: "Market Size", icon: TrendingUp },
  { id: "pricing", label: "Pricing & Access", icon: DollarSign },
  { id: "incentives", label: "Incentives & Regulation", icon: Shield },
  { id: "ip", label: "IP Positioning", icon: FileText },
  { id: "financial", label: "Financial Projections", icon: BarChart3 },
  { id: "strategic", label: "Strategic Fit", icon: Zap },
]

interface MoleculeData {
  moleculeName: string
  internalCode: string
  indications: string[]
  mechanismOfAction: string
  drugClass: string
  modality: string
  developmentPhase: string
  targetLaunchYear: string
  regionsOfInterest: string[]
  routeOfAdministration: string
  clinicalTrials: string
  manualNotes: string
}

export default function MarketAnalysisAgent() {
  const [currentStep, setCurrentStep] = useState<"metadata" | "loading" | "analysis">("analysis")
  const [moleculeData, setMoleculeData] = useState<MoleculeData | null>(null)
  const [activeModule, setActiveModule] = useState("compound")
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set())
  const [perplexityData, setPerplexityData] = useState<{
    marketSize?: string,
    cagr?: string,
    directCompetitors?: string[],
    prvEligibility?: string | number,
    nationalPriority?: string,
    reviewTimelineMonths?: string | number,
    peakRevenue2030?: string,
    peakMarketShare2030?: string,
    peakPatients2030?: string,
    dealActivity?: any[],
    pipelineAnalysis?: any,
    dealCommentary?: string
  }>({})
  const [decodeError, setDecodeError] = useState<string | null>(null)
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    console.log('[DEBUG] Dashboard mounted');
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem('perplexityResult');
      console.log('[DEBUG] Loaded perplexityResult from localStorage:', stored);
      if (stored) {
        try {
          setPerplexityData(JSON.parse(stored));
          console.log('[DEBUG] Parsed perplexityResult:', JSON.parse(stored));
        } catch (e) {
          setDecodeError('Failed to parse perplexityResult: ' + String(e));
          console.error('[DEBUG] Failed to parse perplexityResult:', e);
        }
      }
    }
  }, []);

  if (!hasMounted) {
    return null;
  }

  const toggleModule = (moduleId: string) => {
    const newCollapsed = new Set(collapsedModules)
    if (newCollapsed.has(moduleId)) {
      newCollapsed.delete(moduleId)
    } else {
      newCollapsed.add(moduleId)
    }
    setCollapsedModules(newCollapsed)
  }

  const exportData = (format: string) => {
    console.log(`Exporting data in ${format} format`)
  }

  const handleMetadataSubmit = (data: MoleculeData) => {
    setMoleculeData(data)
    setCurrentStep("loading")
  }

  const handleLoadingComplete = () => {
    setCurrentStep("analysis")
  }

  const handleBackToMetadata = () => {
    setCurrentStep("metadata")
  }

  if (decodeError) {
    console.log('[DEBUG] Rendering decodeError:', decodeError);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-red-50">
        <div className="bg-white border border-red-300 rounded-lg p-8 shadow-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h2>
          <p className="text-red-700 mb-2">{decodeError}</p>
          <p className="text-slate-600 text-sm">Please check the URL or try submitting the form again.</p>
        </div>
      </div>
    );
  }

  if (currentStep === "metadata") {
    console.log('[DEBUG] Rendering MoleculeMetadata step');
    return <MoleculeMetadata onSubmit={handleMetadataSubmit} />
  }

  if (currentStep === "loading") {
    console.log('[DEBUG] Rendering LoadingScreen step');
    return <LoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900">Market Analysis Agent</h1>
                  <p className="text-slate-600 mt-1">Simulating Commercial Viability for Drug Asset Evaluation</p>
                </div>
                {true && (
                  <div className="text-sm text-slate-600 border-l pl-4">
                    <p className="font-semibold">Example Molecule</p>
                    <p>Internal Code 123</p>
                    <p>Phase: Phase 2</p>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => exportData("csv")}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData("excel")}>
                <Download className="w-4 h-4 mr-2" />
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={() => exportData("pdf")}>
                <Download className="w-4 h-4 mr-2" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="sticky top-[88px] z-40 bg-white/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-6">
          <div className="flex overflow-x-auto">
            {modules.map((module) => {
              const Icon = module.icon
              return (
                <button
                  key={module.id}
                  onClick={() => setActiveModule(module.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    activeModule === module.id
                      ? "border-blue-600 text-blue-600"
                      : "border-transparent text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {module.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-8">
        <div className="space-y-8">
          {/* Compound Profile */}
          <div id="compound" className={activeModule === "compound" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Compound Profile</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleModule("compound")}>
                {collapsedModules.has("compound") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            {!collapsedModules.has("compound") && <CompoundProfile />}
          </div>

          {/* Competitive Landscape */}
          <div id="competitive" className={activeModule === "competitive" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Competitive Landscape</h2>
              {/* Collapse arrow/button removed */}
            </div>
            {/* Always expanded, never collapsible */}
            <CompetitiveLandscape
              directCompetitors={perplexityData.directCompetitors}
              dealActivity={perplexityData.dealActivity}
              pipelineAnalysis={perplexityData.pipelineAnalysis}
              dealCommentary={perplexityData.dealCommentary}
            />
          </div>

          {/* Market Size */}
          <div id="market" className={activeModule === "market" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Market Size & Growth</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleModule("market")}>
                {collapsedModules.has("market") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            {!collapsedModules.has("market") && <MarketSize marketSize={perplexityData.marketSize} cagr={perplexityData.cagr} />}
          </div>

          {/* Pricing & Access */}
          <div id="pricing" className={activeModule === "pricing" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Pricing & Reimbursement</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleModule("pricing")}>
                {collapsedModules.has("pricing") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            {!collapsedModules.has("pricing") && <PricingAccess />}
          </div>

          {/* Incentives & Regulation */}
          <div id="incentives" className={activeModule === "incentives" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Incentives & Regulatory Opportunities</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleModule("incentives")}>
                {collapsedModules.has("incentives") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            {!collapsedModules.has("incentives") && (
              <IncentivesRegulation
                prvEligibility={perplexityData.prvEligibility}
                nationalPriority={perplexityData.nationalPriority}
                reviewTimelineMonths={perplexityData.reviewTimelineMonths}
              />
            )}
          </div>

          {/* IP Positioning */}
          <div id="ip" className={activeModule === "ip" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Patent & Exclusivity</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleModule("ip")}>
                {collapsedModules.has("ip") ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </Button>
            </div>
            {!collapsedModules.has("ip") && <IPPositioning />}
          </div>

          {/* Financial Projections */}
          <div id="financial" className={activeModule === "financial" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Financial Forecasting</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleModule("financial")}>
                {collapsedModules.has("financial") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            {!collapsedModules.has("financial") && (
              <FinancialProjections
                peakRevenue2030={perplexityData.peakRevenue2030}
                peakMarketShare2030={perplexityData.peakMarketShare2030}
                peakPatients2030={perplexityData.peakPatients2030}
              />
            )}
          </div>

          {/* Strategic Fit */}
          <div id="strategic" className={activeModule === "strategic" ? "block" : "hidden"}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Strategic Fit & Tailwind Score</h2>
              <Button variant="ghost" size="sm" onClick={() => toggleModule("strategic")}>
                {collapsedModules.has("strategic") ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronUp className="w-4 h-4" />
                )}
              </Button>
            </div>
            {!collapsedModules.has("strategic") && <StrategicFit />}
          </div>
        </div>
      </div>
    </div>
  )
}
