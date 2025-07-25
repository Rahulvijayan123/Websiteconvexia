"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, AlertCircle } from "lucide-react"

interface ProjectData {
  projectName: string
  internalCode: string
  analystName: string
  teamLead: string
  dateOfSubmission: string
  notes: string
  priorityLevel: string
  statusTracker: string
}

interface ProjectMetadataProps {
  onSubmit: (data: ProjectData) => void
}

export function ProjectMetadata({ onSubmit }: ProjectMetadataProps) {
  const [formData, setFormData] = useState<ProjectData>({
    projectName: "",
    internalCode: "",
    analystName: "",
    teamLead: "",
    dateOfSubmission: new Date().toISOString().split("T")[0],
    notes: "",
    priorityLevel: "",
    statusTracker: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: keyof ProjectData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.projectName.trim()) newErrors.projectName = "Project name is required"
    if (!formData.internalCode.trim()) newErrors.internalCode = "Internal code is required"
    if (!formData.analystName.trim()) newErrors.analystName = "Analyst name is required"
    if (!formData.priorityLevel) newErrors.priorityLevel = "Priority level is required"
    if (!formData.statusTracker) newErrors.statusTracker = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Market Analysis Agent</h1>
          <p className="text-lg text-slate-600">Project Setup & Metadata Configuration</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              Project Information
            </CardTitle>
            <CardDescription>Please provide the basic project details to begin your market analysis</CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Project Name */}
              <div className="space-y-2">
                <Label htmlFor="projectName" className="text-sm font-medium">
                  Project Name *
                </Label>
                <Input
                  id="projectName"
                  placeholder="e.g., EGFR TKI Development Program"
                  value={formData.projectName}
                  onChange={(e) => handleInputChange("projectName", e.target.value)}
                  className={errors.projectName ? "border-red-500" : ""}
                />
                {errors.projectName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.projectName}
                  </p>
                )}
              </div>

              {/* Internal Code */}
              <div className="space-y-2">
                <Label htmlFor="internalCode" className="text-sm font-medium">
                  Internal Code *
                </Label>
                <Input
                  id="internalCode"
                  placeholder="e.g., Program #247A"
                  value={formData.internalCode}
                  onChange={(e) => handleInputChange("internalCode", e.target.value)}
                  className={errors.internalCode ? "border-red-500" : ""}
                />
                {errors.internalCode && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.internalCode}
                  </p>
                )}
              </div>

              {/* Analyst Name */}
              <div className="space-y-2">
                <Label htmlFor="analystName" className="text-sm font-medium">
                  Analyst Name *
                </Label>
                <Input
                  id="analystName"
                  placeholder="Your name"
                  value={formData.analystName}
                  onChange={(e) => handleInputChange("analystName", e.target.value)}
                  className={errors.analystName ? "border-red-500" : ""}
                />
                {errors.analystName && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.analystName}
                  </p>
                )}
              </div>

              {/* Team Lead */}
              <div className="space-y-2">
                <Label htmlFor="teamLead" className="text-sm font-medium">
                  Team Lead <span className="text-slate-500">(optional)</span>
                </Label>
                <Input
                  id="teamLead"
                  placeholder="Team lead name"
                  value={formData.teamLead}
                  onChange={(e) => handleInputChange("teamLead", e.target.value)}
                />
              </div>

              {/* Date of Submission */}
              <div className="space-y-2">
                <Label htmlFor="dateOfSubmission" className="text-sm font-medium">
                  Date of Submission
                </Label>
                <div className="relative">
                  <Input
                    id="dateOfSubmission"
                    type="date"
                    value={formData.dateOfSubmission}
                    onChange={(e) => handleInputChange("dateOfSubmission", e.target.value)}
                  />
                  <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
              </div>

              {/* Priority Level */}
              <div className="space-y-2">
                <Label htmlFor="priorityLevel" className="text-sm font-medium">
                  Priority Level *
                </Label>
                <Select
                  value={formData.priorityLevel}
                  onValueChange={(value) => handleInputChange("priorityLevel", value)}
                >
                  <SelectTrigger className={errors.priorityLevel ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="high">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        High Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        Medium Priority
                      </div>
                    </SelectItem>
                    <SelectItem value="low">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        Low Priority
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.priorityLevel && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.priorityLevel}
                  </p>
                )}
              </div>

              {/* Status Tracker */}
              <div className="space-y-2">
                <Label htmlFor="statusTracker" className="text-sm font-medium">
                  Status Tracker *
                </Label>
                <Select
                  value={formData.statusTracker}
                  onValueChange={(value) => handleInputChange("statusTracker", value)}
                >
                  <SelectTrigger className={errors.statusTracker ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center gap-2">
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                        Currently in progress
                      </div>
                    </SelectItem>
                    <SelectItem value="paused">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          Paused
                        </Badge>
                        Temporarily on hold
                      </div>
                    </SelectItem>
                    <SelectItem value="archived">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Archived
                        </Badge>
                        Completed or discontinued
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                {errors.statusTracker && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.statusTracker}
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Project Notes <span className="text-slate-500">(optional)</span>
              </Label>
              <Textarea
                id="notes"
                placeholder="Add any relevant notes, context, or special considerations for this analysis..."
                value={formData.notes}
                onChange={(e) => handleInputChange("notes", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Summary Preview */}
            {(formData.projectName || formData.internalCode) && (
              <div className="bg-slate-50 rounded-lg p-4 border">
                <h4 className="font-semibold text-sm text-slate-700 mb-2">Project Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-600">Project:</span>
                    <p className="font-medium">{formData.projectName || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Code:</span>
                    <p className="font-medium">{formData.internalCode || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Analyst:</span>
                    <p className="font-medium">{formData.analystName || "Not specified"}</p>
                  </div>
                  <div>
                    <span className="text-slate-600">Priority:</span>
                    <div className="flex items-center gap-2">
                      {formData.priorityLevel && (
                        <Badge
                          variant={
                            formData.priorityLevel === "high"
                              ? "destructive"
                              : formData.priorityLevel === "medium"
                                ? "secondary"
                                : "outline"
                          }
                          className="text-xs"
                        >
                          {formData.priorityLevel.charAt(0).toUpperCase() + formData.priorityLevel.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-center pt-4">
              <Button onClick={handleSubmit} size="lg" className="px-8">
                Begin Market Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
