"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { MicroscopeIcon as Molecule, Target, Pill, Beaker, Globe, FileText, Sparkles } from "lucide-react"

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

interface MoleculeMetadataProps {
  onSubmit: (data: MoleculeData) => void
}

const modalityOptions = [
  "Small Molecule",
  "Monoclonal Antibody",
  "ADC (Antibody-Drug Conjugate)",
  "Bispecific Antibody",
  "mRNA Therapy",
  "Gene Therapy",
  "Cell Therapy",
  "Protein/Peptide",
  "Oligonucleotide",
  "Vaccine",
  "Other",
]

const phaseOptions = [
  "Preclinical",
  "Phase I",
  "Phase I/II",
  "Phase II",
  "Phase II/III",
  "Phase III",
  "Registration",
  "Approved",
]

const regionOptions = [
  "United States",
  "European Union",
  "Japan",
  "China",
  "Canada",
  "Australia",
  "South Korea",
  "Brazil",
  "Rest of World",
]

const routeOptions = [
  "Oral",
  "Intravenous",
  "Subcutaneous",
  "Intramuscular",
  "Topical",
  "Inhalation",
  "Intranasal",
  "Other",
]

export function MoleculeMetadata({ onSubmit }: MoleculeMetadataProps) {
  const [formData, setFormData] = useState<MoleculeData>({
    moleculeName: "",
    internalCode: "",
    indications: [],
    mechanismOfAction: "",
    drugClass: "",
    modality: "",
    developmentPhase: "",
    targetLaunchYear: "",
    regionsOfInterest: [],
    routeOfAdministration: "",
    clinicalTrials: "",
    manualNotes: "",
  })

  const handleInputChange = (field: keyof MoleculeData, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleIndicationToggle = (indication: string) => {
    const current = formData.indications
    const updated = current.includes(indication) ? current.filter((i) => i !== indication) : [...current, indication]
    handleInputChange("indications", updated)
  }

  const handleRegionToggle = (region: string) => {
    const current = formData.regionsOfInterest
    const updated = current.includes(region) ? current.filter((r) => r !== region) : [...current, region]
    handleInputChange("regionsOfInterest", updated)
  }

  const handleSubmit = () => {
    onSubmit(formData)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Molecule className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-4xl font-bold text-slate-900">Market Analysis Agent</h1>
          </div>
          <p className="text-lg text-slate-600">Molecule Profile & Development Context</p>
          <p className="text-sm text-slate-500 mt-2">
            Provide as much detail as available - all fields are optional and can be updated later
          </p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <Target className="w-6 h-6" />
              Drug Asset Information
            </CardTitle>
            <CardDescription>
              Comprehensive molecule profile to enable precise market analysis and competitive positioning
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Basic Information */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Pill className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="moleculeName" className="text-sm font-medium">
                    Molecule Name
                  </Label>
                  <Input
                    id="moleculeName"
                    placeholder="e.g., BMS-986165, Osimertinib"
                    value={formData.moleculeName}
                    onChange={(e) => handleInputChange("moleculeName", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="internalCode" className="text-sm font-medium">
                    Internal Code
                  </Label>
                  <Input
                    id="internalCode"
                    placeholder="e.g., Program #247A, TKI-001"
                    value={formData.internalCode}
                    onChange={(e) => handleInputChange("internalCode", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="drugClass" className="text-sm font-medium">
                    Drug Class
                  </Label>
                  <Input
                    id="drugClass"
                    placeholder="e.g., Tyrosine Kinase Inhibitor, Checkpoint Inhibitor"
                    value={formData.drugClass}
                    onChange={(e) => handleInputChange("drugClass", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modality" className="text-sm font-medium">
                    Modality
                  </Label>
                  <Select value={formData.modality} onValueChange={(value) => handleInputChange("modality", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select modality" />
                    </SelectTrigger>
                    <SelectContent>
                      {modalityOptions.map((modality) => (
                        <SelectItem key={modality} value={modality}>
                          {modality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mechanismOfAction" className="text-sm font-medium">
                  Mechanism of Action
                </Label>
                <Textarea
                  id="mechanismOfAction"
                  placeholder="e.g., Selective inhibition of EGFR L858R/T790M mutations while sparing wild-type EGFR..."
                  value={formData.mechanismOfAction}
                  onChange={(e) => handleInputChange("mechanismOfAction", e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            {/* Indications */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-slate-800">Target Indications</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  "NSCLC",
                  "Breast Cancer",
                  "Colorectal Cancer",
                  "Melanoma",
                  "Prostate Cancer",
                  "Ovarian Cancer",
                  "Pancreatic Cancer",
                  "Glioblastoma",
                  "Leukemia",
                  "Lymphoma",
                  "Multiple Myeloma",
                  "Other Solid Tumors",
                ].map((indication) => (
                  <div key={indication} className="flex items-center space-x-2">
                    <Checkbox
                      id={indication}
                      checked={formData.indications.includes(indication)}
                      onCheckedChange={() => handleIndicationToggle(indication)}
                    />
                    <Label htmlFor={indication} className="text-sm">
                      {indication}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Development Status */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Beaker className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-slate-800">Development Status</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="developmentPhase" className="text-sm font-medium">
                    Development Phase
                  </Label>
                  <Select
                    value={formData.developmentPhase}
                    onValueChange={(value) => handleInputChange("developmentPhase", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select phase" />
                    </SelectTrigger>
                    <SelectContent>
                      {phaseOptions.map((phase) => (
                        <SelectItem key={phase} value={phase}>
                          {phase}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetLaunchYear" className="text-sm font-medium">
                    Target Launch Year
                  </Label>
                  <Input
                    id="targetLaunchYear"
                    placeholder="e.g., 2027"
                    value={formData.targetLaunchYear}
                    onChange={(e) => handleInputChange("targetLaunchYear", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="routeOfAdministration" className="text-sm font-medium">
                    Route of Administration
                  </Label>
                  <Select
                    value={formData.routeOfAdministration}
                    onValueChange={(value) => handleInputChange("routeOfAdministration", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select route" />
                    </SelectTrigger>
                    <SelectContent>
                      {routeOptions.map((route) => (
                        <SelectItem key={route} value={route}>
                          {route}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Geographic Focus */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Globe className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-slate-800">Regions of Interest</h3>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {regionOptions.map((region) => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={region}
                      checked={formData.regionsOfInterest.includes(region)}
                      onCheckedChange={() => handleRegionToggle(region)}
                    />
                    <Label htmlFor={region} className="text-sm">
                      {region}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Clinical Context */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-red-600" />
                <h3 className="text-lg font-semibold text-slate-800">Clinical Context</h3>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicalTrials" className="text-sm font-medium">
                    Relevant Clinical Trials
                  </Label>
                  <Input
                    id="clinicalTrials"
                    placeholder="e.g., NCT04567890, KEYNOTE-189, CheckMate-227"
                    value={formData.clinicalTrials}
                    onChange={(e) => handleInputChange("clinicalTrials", e.target.value)}
                  />
                  <p className="text-xs text-slate-500">Enter trial identifiers or names (comma-separated)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="manualNotes" className="text-sm font-medium">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="manualNotes"
                    placeholder="Any additional context, competitive considerations, or strategic notes..."
                    value={formData.manualNotes}
                    onChange={(e) => handleInputChange("manualNotes", e.target.value)}
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Summary Preview */}
            {(formData.moleculeName || formData.drugClass || formData.indications.length > 0) && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border">
                <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Analysis Preview
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Molecule:</span>
                    <p className="font-medium">{formData.moleculeName || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Drug Class:</span>
                    <p className="font-medium">{formData.drugClass || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Phase:</span>
                    <p className="font-medium">{formData.developmentPhase || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Target Launch:</span>
                    <p className="font-medium">{formData.targetLaunchYear || "Not specified"}</p>
                  </div>
                </div>
                {formData.indications.length > 0 && (
                  <div className="mt-3">
                    <span className="text-slate-600 text-sm">Target Indications:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formData.indications.map((indication) => (
                        <Badge key={indication} variant="secondary" className="text-xs">
                          {indication}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button onClick={handleSubmit} size="lg" className="px-12 py-3 text-lg">
                <Sparkles className="w-5 h-5 mr-2" />
                Generate Market Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
