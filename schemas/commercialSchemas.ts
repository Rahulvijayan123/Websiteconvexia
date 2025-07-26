import { z } from 'zod';

// Deal activity item schema
export const DealActivityItem = z.object({
  asset: z.string().min(2),
  stage: z.enum(['Preclinical','Phase 1','Phase 2','Phase 3','Filed','Marketed']),
  priceUSD: z.number().positive(),
  dateISO: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  rationale: z.string().min(10),
  sources: z.array(z.string().url()).min(1)
});

// Key market assumptions schema
export const KeyMarketAssumptions = z.object({
  avgSellingPriceUSD: z.number().positive(),
  persistenceRate: z.number().min(0).max(1),
  treatmentDurationMonths: z.number().positive(),
  geographicSplit: z.object({
    us: z.number().min(0).max(1),
    eu: z.number().min(0).max(1),
    row: z.number().min(0).max(1)
  }),
  rationale: z.string().min(10),
  sources: z.array(z.string().url()).min(1)
});

// Regulatory incentives schema
export const RegIncentives = z.object({
  prvEligibility: z.object({
    value: z.boolean(),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  }),
  nationalPriority: z.object({
    value: z.string().min(2),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  }),
  reviewTimelineMonths: z.object({
    value: z.number().positive(),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  })
});

// IP strength schema
export const IpStrength = z.object({
  exclusivityYears: z.object({
    value: z.number().positive(),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  }),
  genericEntryRiskPercent: z.object({
    value: z.number().min(0).max(100),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  }),
  coreIpPosition: z.object({
    value: z.string().min(2),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  })
});

// Financial forecast schema
export const FinancialForecast = z.object({
  totalTenYearRevenueUSD: z.object({
    value: z.number().positive(),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  }),
  peakMarketSharePercent: z.object({
    value: z.number().min(0).max(100),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  }),
  peakPatientsCount: z.object({
    value: z.number().positive(),
    rationale: z.string().min(10),
    sources: z.array(z.string().url()).min(1)
  })
});

// Raw facts schema - data retrieved from sources
export const RawFactsSchema = z.object({
  currentMarket: z.number().positive(),
  peakRevenue2030: z.number().positive(),
  yearsToPeak: z.number().positive(),
  avgPrice: z.number().positive(),
  persistenceRate: z.number().min(0).max(1),
  sameTargetAssets: z.number().nonnegative(),
  totalAssets: z.number().positive(),
  vectorA: z.array(z.number()),
  vectorB: z.array(z.number()),
  dealActivity: z.array(DealActivityItem).min(1),
  keyMarketAssumptions: KeyMarketAssumptions,
  regIncentives: RegIncentives,
  ipStrength: IpStrength,
  financialForecast: FinancialForecast,
  sourceMap: z.record(z.string(), z.array(z.string().url()))
});

// Derived facts schema - computed metrics
export const DerivedFactsSchema = z.object({
  cagr: z.number(),
  peakPatients2030: z.number().positive(),
  pipelineDensity: z.number().min(0).max(100),
  strategicFit: z.number().min(0).max(1)
}); 