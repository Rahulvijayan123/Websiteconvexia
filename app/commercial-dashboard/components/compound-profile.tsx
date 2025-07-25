import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"

export function CompoundProfile() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Key Preclinical Findings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Key Preclinical Findings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="blurred-section space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-1">IC50 (Mutant)</h4>
                <p className="text-lg font-bold text-green-600">2.5 nM</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-600 mb-1">IC50 (Wild-type)</h4>
                <p className="text-lg font-bold text-slate-600">180 nM</p>
              </div>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm text-slate-600 mb-2">Tumor Inhibition (in vivo)</h4>
              <div className="flex items-center gap-2">
                <Progress value={87} className="flex-1" />
                <span className="text-sm font-semibold">87%</span>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-600 mb-2">Survival Improvement</h4>
              <div className="flex items-center gap-2">
                <Progress value={65} className="flex-1" />
                <span className="text-sm font-semibold">65%</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Development Strategy */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Development Strategy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="blurred-section space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-slate-600 mb-2">Primary Indication</h4>
              <Badge variant="secondary" className="mb-2">
                NSCLC w/ T790M mutation
              </Badge>
              <p className="text-sm text-slate-700">
                Targeting second-line treatment after first-generation EGFR TKI failure
              </p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold text-sm text-slate-600 mb-2">Regulatory Plan</h4>
              <div className="space-y-2">
                <Badge variant="outline" className="mr-2">
                  Breakthrough Designation
                </Badge>
                <Badge variant="outline" className="mr-2">
                  Orphan Drug Status
                </Badge>
                <p className="text-sm text-slate-700 mt-2">
                  Fast-track pathway with potential for accelerated approval based on ORR endpoint
                </p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-sm text-slate-600 mb-2">Timeline to Market</h4>
              <p className="text-lg font-bold text-blue-600">3.5 years</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

