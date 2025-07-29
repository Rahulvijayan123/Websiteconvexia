import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Line, ComposedChart, Area, AreaChart } from "recharts"
import { ExpandableDetail } from "./expandable-detail"
import { SourceAttribution } from "./source-attribution"
import { AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const revenueData = [
  { year: "2024", usRevenue: 0, exUsRevenue: 0, marketShare: 0, grossToNet: 0 },
  { year: "2025", usRevenue: 0, exUsRevenue: 0, marketShare: 0, grossToNet: 0 },
  { year: "2026", usRevenue: 0, exUsRevenue: 0, marketShare: 0, grossToNet: 0 },
  { year: "2027", usRevenue: 450, exUsRevenue: 280, marketShare: 3.2, grossToNet: 25 },
  { year: "2028", usRevenue: 1250, exUsRevenue: 820, marketShare: 8.5, grossToNet: 30 },
  { year: "2029", usRevenue: 2100, exUsRevenue: 1400, marketShare: 14.2, grossToNet: 32 },
  { year: "2030", usRevenue: 2650, exUsRevenue: 1750, marketShare: 17.1, grossToNet: 35 },
  { year: "2031", usRevenue: 2580, exUsRevenue: 1680, marketShare: 16.8, grossToNet: 38 },
  { year: "2032", usRevenue: 2420, exUsRevenue: 1580, marketShare: 15.9, grossToNet: 40 },
  { year: "2033", usRevenue: 1890, exUsRevenue: 1240, marketShare: 12.4, grossToNet: 42 },
]

const keyMetrics = [
  { metric: "Peak Revenue", value: "$3.826B", year: "2030" },
  { metric: "Total 10-Year Revenue", value: "$25.654B", period: "2024-2033" },
  { metric: "Peak Market Share", value: "17.1%", year: "2030" },
  { metric: "Peak Patients", value: "26K", year: "2030" },
  { metric: "Avg Selling Price", value: "$156K", note: "Blended global" },
  { metric: "Persistence Rate", value: "85%", note: "12-month" },
  { metric: "Treatment Duration", value: "18 mo", note: "Median" },
  { metric: "Geographic Split", value: "60% US / 40% Ex-US", note: "Peak year" },
]

const loeImpact = [
  { year: "2030", revenue: 4400, loeImpact: 0, genericShare: 0 },
  { year: "2031", revenue: 4260, loeImpact: 140, genericShare: 5 },
  { year: "2032", revenue: 4000, loeImpact: 400, genericShare: 15 },
  { year: "2033", revenue: 3130, loeImpact: 1270, genericShare: 35 },
  { year: "2034", revenue: 2200, loeImpact: 2200, genericShare: 55 },
  { year: "2035", revenue: 1540, loeImpact: 2860, genericShare: 70 },
]

const chartConfig = {
  usRevenue: {
    label: "US Revenue ($M)",
    color: "hsl(var(--chart-1))",
  },
  exUsRevenue: {
    label: "Ex-US Revenue ($M)",
    color: "hsl(var(--chart-2))",
  },
  marketShare: {
    label: "Market Share (%)",
    color: "hsl(var(--chart-3))",
  },
  grossToNet: {
    label: "Gross-to-Net (%)",
    color: "hsl(var(--chart-4))",
  },
  revenue: {
    label: "Revenue ($M)",
    color: "hsl(var(--chart-1))",
  },
  loeImpact: {
    label: "LOE Impact ($M)",
    color: "hsl(var(--chart-5))",
  },
}

const financialSources = [
  {
    name: "Internal Financial Model",
    type: "manual" as const,
    description: "Company DCF model with pharma-specific assumptions",
  },
  {
    name: "EvaluatePharma Consensus",
    type: "database" as const,
    url: "https://www.evaluate.com",
    description: "Analyst consensus estimates and comparable transactions",
    lastUpdated: "Dec 2024",
  },
  {
    name: "BioPharma Dive Deal Database",
    type: "database" as const,
    description: "M&A transaction multiples and valuations",
  },
  {
    name: "Monte Carlo Simulation",
    type: "ai-generated" as const,
    description: "Risk-adjusted NPV using 10,000 scenario iterations",
  },
]

export function FinancialProjections({
  peakRevenue2030,
  peakMarketShare2030,
  peakPatients2030,
  avgSellingPrice,
  persistenceRate,
  treatmentDuration,
  geographicSplit,
  total10YearRevenue
}: {
  peakRevenue2030?: string,
  peakMarketShare2030?: string,
  peakPatients2030?: string,
  avgSellingPrice?: string,
  persistenceRate?: string,
  treatmentDuration?: string,
  geographicSplit?: string,
  total10YearRevenue?: string
} = {}) {
  // Input validation function to detect invalid inputs
  const isInvalidInput = (input: string | null | undefined): boolean => {
    if (!input || typeof input !== 'string') return true;
    const trimmed = input.trim().toLowerCase();
    // Only detect obviously invalid inputs - be more permissive for real drug/target names
    const invalidPatterns = ['xxx', 'n/a', 'random', 'asdf', 'test', 'placeholder', 'dummy', 'fake', 'qwerty', '123456'];
    return invalidPatterns.some(pattern => trimmed.includes(pattern)) || trimmed.length < 1;
  };

  // Business logic validation functions
  const validateRareDiseaseEligibility = () => {
    if (!peakPatients2030) return { isValid: false, message: 'Patient count not available' };
    
    const patientCount = parseFloat(peakPatients2030.replace(/[^0-9.]/g, ''));
    const multiplier = peakPatients2030.includes('M') ? 1000000 : 
                      peakPatients2030.includes('K') ? 1000 : 1;
    const actualPatients = patientCount * multiplier;
    
    if (actualPatients <= 200000) {
      return { isValid: true, message: 'Eligible for rare disease designation (<200k patients)' };
    } else {
      return { isValid: false, message: 'Not eligible for rare disease designation (>200k patients)' };
    }
  };

  const validateMathematicalConsistency = () => {
    if (!peakRevenue2030 || !peakPatients2030 || !avgSellingPrice) {
      return { isValid: false, message: 'Missing data for validation' };
    }

    const revenue = parseFloat(peakRevenue2030.replace(/[^0-9.]/g, ''));
    const revenueMultiplier = peakRevenue2030.includes('B') ? 1000000000 : 
                             peakRevenue2030.includes('M') ? 1000000 : 1;
    const actualRevenue = revenue * revenueMultiplier;

    const patients = parseFloat(peakPatients2030.replace(/[^0-9.]/g, ''));
    const patientMultiplier = peakPatients2030.includes('M') ? 1000000 : 
                             peakPatients2030.includes('K') ? 1000 : 1;
    const actualPatients = patients * patientMultiplier;

    const price = parseFloat(avgSellingPrice.replace(/[^0-9.]/g, ''));
    const priceMultiplier = avgSellingPrice.includes('K') ? 1000 : 1;
    const actualPrice = price * priceMultiplier;

    const calculatedRevenue = actualPatients * actualPrice;
    const revenueRatio = Math.abs(calculatedRevenue - actualRevenue) / actualRevenue;

    if (revenueRatio < 0.2) { // Within 20% tolerance
      return { isValid: true, message: 'Revenue calculation is mathematically consistent' };
    } else {
      return { isValid: false, message: 'Revenue calculation may be inconsistent with patient count and pricing' };
    }
  };

  const validateMarketShareConsistency = () => {
    if (!peakMarketShare2030 || !peakPatients2030) {
      return { isValid: false, message: 'Missing market share or patient data' };
    }

    const marketShare = parseFloat(peakMarketShare2030.replace(/[^0-9.]/g, ''));
    const patients = parseFloat(peakPatients2030.replace(/[^0-9.]/g, ''));
    const patientMultiplier = peakPatients2030.includes('M') ? 1000000 : 
                             peakPatients2030.includes('K') ? 1000 : 1;
    const actualPatients = patients * patientMultiplier;

    // Estimate total market size based on patient count and market share
    const estimatedTotalPatients = actualPatients / (marketShare / 100);
    
    if (estimatedTotalPatients <= 200000 && marketShare > 50) {
      return { isValid: true, message: 'High market share consistent with rare disease' };
    } else if (estimatedTotalPatients > 200000 && marketShare <= 20) {
      return { isValid: true, message: 'Market share appropriate for larger patient population' };
    } else {
      return { isValid: false, message: 'Market share may not align with patient population size' };
    }
  };

  // Get input values from localStorage to validate
  const getInputValues = () => {
    try {
      const stored = localStorage.getItem('perplexityResult');
      if (stored) {
        const data = JSON.parse(stored);
        return data.inputValues || {
          therapeuticArea: '',
          indication: '',
          target: '',
          geography: '',
          developmentPhase: ''
        };
      }
    } catch (e) {
      // If localStorage fails, assume valid input
    }
    return { therapeuticArea: '', indication: '', target: '', geography: '', developmentPhase: '' };
  };

  const inputValues = getInputValues();
  // Only trigger fallback if MOST fields are invalid (at least 3 out of 5)
  const invalidFields = [
    isInvalidInput(inputValues.therapeuticArea),
    isInvalidInput(inputValues.indication),
    isInvalidInput(inputValues.target),
    isInvalidInput(inputValues.geography),
    isInvalidInput(inputValues.developmentPhase)
  ].filter(Boolean);
  const hasInvalidInput = invalidFields.length >= 3;

  // Run validations
  const rareDiseaseValidation = validateRareDiseaseEligibility();
  const mathValidation = validateMathematicalConsistency();
  const marketShareValidation = validateMarketShareConsistency();

  // Calculate Total 10-Year Revenue if not provided
  const calculateTotal10YearRevenue = () => {
    if (total10YearRevenue && total10YearRevenue !== 'Unknown') {
      return total10YearRevenue;
    }
    
    if (peakRevenue2030 && peakRevenue2030 !== 'Unknown') {
      // Extract numeric value from peak revenue (e.g., "17.5B" -> 17.5)
      const peakValue = parseFloat(peakRevenue2030.replace(/[^0-9.]/g, ''));
      const multiplier = peakRevenue2030.includes('B') ? 1000000000 : 
                        peakRevenue2030.includes('M') ? 1000000 : 1;
      const peakRevenueNumeric = peakValue * multiplier;
      
      // Total 10-year revenue should be 5-8x peak revenue (industry standard)
      const totalRevenue = peakRevenueNumeric * 6.5; // Using 6.5x as middle ground
      
      if (totalRevenue >= 1000000000) {
        return `$${(totalRevenue / 1000000000).toFixed(1)}B`;
      } else if (totalRevenue >= 1000000) {
        return `$${(totalRevenue / 1000000).toFixed(1)}M`;
      } else {
        return `$${totalRevenue.toFixed(0)}`;
      }
    }
    
    return 'N/A';
  };

  // Generate detailed rationales for each metric
  const getPeakRevenueRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (peakRevenue2030 && peakRevenue2030 !== 'Unknown') {
      return `${peakRevenue2030} peak revenue - based on market size analysis, competitive positioning, and pricing assumptions for 2030`;
    }
    return 'Peak revenue requires assessment of market size, competitive landscape, and pricing strategy';
  };

  const getTotal10YearRevenueRationale = () => {
    if (hasInvalidInput) return 'N/A';
    const totalRevenue = calculateTotal10YearRevenue();
    if (totalRevenue !== 'N/A') {
      return `${totalRevenue} total revenue - calculated as 6.5x peak revenue following industry standard revenue curve (ramp-up, plateau, decline)`;
    }
    return 'Total 10-year revenue requires peak revenue data and industry-standard revenue curve modeling';
  };

  const getPeakMarketShareRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (peakMarketShare2030 && peakMarketShare2030 !== 'Unknown') {
      return `${peakMarketShare2030} market share - projected based on competitive landscape analysis and product differentiation`;
    }
    return 'Market share projection requires competitive landscape analysis and product positioning assessment';
  };

  const getPeakPatientsRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (peakPatients2030 && peakPatients2030 !== 'Unknown') {
      const rareDiseaseStatus = rareDiseaseValidation.isValid ? ' (Rare Disease Eligible)' : ' (Not Rare Disease)';
      return `${peakPatients2030} peak patients${rareDiseaseStatus} - based on epidemiology data, treatment penetration, and market access assumptions`;
    }
    return 'Patient population projection requires epidemiology analysis and treatment penetration modeling';
  };

  const getAvgSellingPriceRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (avgSellingPrice && avgSellingPrice !== 'Unknown') {
      return `${avgSellingPrice} average selling price - based on competitive pricing analysis, value proposition, and reimbursement assumptions`;
    }
    return 'Average selling price requires competitive pricing analysis and value-based pricing assessment';
  };

  const getPersistenceRateRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (persistenceRate && persistenceRate !== 'Unknown') {
      return `${persistenceRate} persistence rate - based on clinical trial data, real-world evidence, and patient adherence patterns`;
    }
    return 'Persistence rate requires clinical trial data and real-world evidence analysis';
  };

  const getTreatmentDurationRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (treatmentDuration && treatmentDuration !== 'Unknown') {
      return `${treatmentDuration} treatment duration - based on clinical trial protocols, disease progression, and treatment guidelines`;
    }
    return 'Treatment duration requires clinical trial data and disease progression analysis';
  };

  const getGeographicSplitRationale = () => {
    if (hasInvalidInput) return 'N/A';
    if (geographicSplit && geographicSplit !== 'Unknown') {
      return `${geographicSplit} geographic split - based on market access analysis, pricing differences, and regional adoption patterns`;
    }
    return 'Geographic split requires market access analysis and regional adoption modeling';
  };

  return (
    <div className="space-y-6">
      {/* Business Logic Validation Alert */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-blue-500" />
            Business Logic Validation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              {rareDiseaseValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-red-500" />
              )}
              <span className="text-sm">{rareDiseaseValidation.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {mathValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">{mathValidation.message}</span>
            </div>
            <div className="flex items-center gap-2">
              {marketShareValidation.isValid ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-yellow-500" />
              )}
              <span className="text-sm">{marketShareValidation.message}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Key Financial Metrics</CardTitle>
          <CardDescription>Projected financial performance and market dynamics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {hasInvalidInput ? 'N/A' : (peakRevenue2030 || 'N/A')}
              </div>
              <div className="text-sm text-slate-600">Peak Revenue (2030)</div>
                             <ExpandableDetail
                 title="Peak Revenue Rationale"
                 value={peakRevenue2030 || 'N/A'}
                 aiDerivation={getPeakRevenueRationale()}
               />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {hasInvalidInput ? 'N/A' : calculateTotal10YearRevenue()}
              </div>
              <div className="text-sm text-slate-600">Total 10-Year Revenue</div>
                             <ExpandableDetail
                 title="Total Revenue Rationale"
                 value={calculateTotal10YearRevenue()}
                 aiDerivation={getTotal10YearRevenueRationale()}
               />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {hasInvalidInput ? 'N/A' : (peakMarketShare2030 || 'N/A')}
              </div>
              <div className="text-sm text-slate-600">Peak Market Share (2030)</div>
                             <ExpandableDetail
                 title="Market Share Rationale"
                 value={peakMarketShare2030 || 'N/A'}
                 aiDerivation={getPeakMarketShareRationale()}
               />
             </div>
             <div className="text-center">
               <div className="text-2xl font-bold text-orange-600">
                 {hasInvalidInput ? 'N/A' : (peakPatients2030 || 'N/A')}
               </div>
               <div className="text-sm text-slate-600">Peak Patients (2030)</div>
               <Badge variant={rareDiseaseValidation.isValid ? "default" : "destructive"} className="mt-1">
                 {rareDiseaseValidation.isValid ? "Rare Disease" : "Not Rare Disease"}
               </Badge>
               <ExpandableDetail
                 title="Patient Count Rationale"
                 value={peakPatients2030 || 'N/A'}
                 aiDerivation={getPeakPatientsRationale()}
               />
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Additional Metrics */}
       <Card>
         <CardHeader>
           <CardTitle>Market Dynamics</CardTitle>
           <CardDescription>Treatment patterns and pricing assumptions</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div className="text-center">
               <div className="text-xl font-bold text-indigo-600">
                 {hasInvalidInput ? 'N/A' : (avgSellingPrice || 'N/A')}
               </div>
               <div className="text-sm text-slate-600">Avg Selling Price</div>
               <ExpandableDetail
                 title="Pricing Rationale"
                 value={avgSellingPrice || 'N/A'}
                 aiDerivation={getAvgSellingPriceRationale()}
               />
             </div>
             <div className="text-center">
               <div className="text-xl font-bold text-teal-600">
                 {hasInvalidInput ? 'N/A' : (persistenceRate || 'N/A')}
               </div>
               <div className="text-sm text-slate-600">Persistence Rate</div>
               <ExpandableDetail
                 title="Persistence Rationale"
                 value={persistenceRate || 'N/A'}
                 aiDerivation={getPersistenceRateRationale()}
               />
             </div>
             <div className="text-center">
               <div className="text-xl font-bold text-cyan-600">
                 {hasInvalidInput ? 'N/A' : (treatmentDuration || 'N/A')}
               </div>
               <div className="text-sm text-slate-600">Treatment Duration</div>
               <ExpandableDetail
                 title="Duration Rationale"
                 value={treatmentDuration || 'N/A'}
                 aiDerivation={getTreatmentDurationRationale()}
               />
             </div>
             <div className="text-center">
               <div className="text-xl font-bold text-pink-600">
                 {hasInvalidInput ? 'N/A' : (geographicSplit || 'N/A')}
               </div>
               <div className="text-sm text-slate-600">Geographic Split</div>
               <ExpandableDetail
                 title="Geographic Rationale"
                 value={geographicSplit || 'N/A'}
                 aiDerivation={getGeographicSplitRationale()}
               />
             </div>
           </div>
         </CardContent>
       </Card>

       {/* Revenue Projection Chart */}
       <Card>
         <CardHeader>
           <CardTitle>Revenue Projection (2024-2033)</CardTitle>
           <CardDescription>Annual revenue forecast with geographic breakdown</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="h-[400px]">
             <ResponsiveContainer width="100%" height="100%">
               <ComposedChart data={revenueData}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="year" />
                 <YAxis yAxisId="left" />
                 <YAxis yAxisId="right" orientation="right" />
                 <ChartTooltip />
                 <Bar yAxisId="left" dataKey="usRevenue" fill="hsl(var(--chart-1))" name="US Revenue ($M)" />
                 <Bar yAxisId="left" dataKey="exUsRevenue" fill="hsl(var(--chart-2))" name="Ex-US Revenue ($M)" />
                 <Line yAxisId="right" type="monotone" dataKey="marketShare" stroke="hsl(var(--chart-3))" name="Market Share (%)" />
               </ComposedChart>
             </ResponsiveContainer>
           </div>
         </CardContent>
       </Card>

       {/* Loss of Exclusivity Impact */}
       <Card>
         <CardHeader>
           <CardTitle>Loss of Exclusivity Impact</CardTitle>
           <CardDescription>Revenue erosion following patent expiration</CardDescription>
         </CardHeader>
         <CardContent>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={loeImpact}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="year" />
                 <YAxis />
                 <ChartTooltip />
                 <Area type="monotone" dataKey="revenue" stackId="1" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" name="Revenue ($M)" />
                 <Area type="monotone" dataKey="loeImpact" stackId="2" stroke="hsl(var(--chart-5))" fill="hsl(var(--chart-5))" name="LOE Impact ($M)" />
               </AreaChart>
             </ResponsiveContainer>
           </div>
         </CardContent>
       </Card>

             {/* Data Sources */}
       <SourceAttribution sectionTitle="Financial Projections" sources={financialSources} />
    </div>
  )
}
