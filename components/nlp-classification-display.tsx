"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, TrendingUp } from "lucide-react"

interface NLPClassificationDisplayProps {
  targetDivision: string
  confidence: number
  confidenceLevel?: string
  keywords?: string[]
  isOverridden?: boolean
  originalDivision?: string
  allPredictions?: Array<{ division: string; confidence: number }>
}

export function NLPClassificationDisplay({
  targetDivision,
  confidence,
  confidenceLevel = "medium",
  keywords = [],
  isOverridden = false,
  originalDivision,
  allPredictions = [],
}: NLPClassificationDisplayProps) {
  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-green-600"
      case "medium":
        return "text-yellow-600"
      case "low":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  const getConfidenceIcon = (level: string) => {
    switch (level) {
      case "high":
        return <CheckCircle2 className="h-4 w-4 text-green-600" />
      case "medium":
        return <TrendingUp className="h-4 w-4 text-yellow-600" />
      case "low":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Hasil Klasifikasi NLP
          {isOverridden && <Badge variant="outline">Diubah Manual</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Target Divisi</p>
            <p className="text-lg font-semibold">{targetDivision}</p>
            {isOverridden && originalDivision && (
              <p className="text-xs text-muted-foreground">Asli: {originalDivision}</p>
            )}
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <div className="flex items-center gap-2">
              {getConfidenceIcon(confidenceLevel)}
              <p className={`text-lg font-semibold ${getConfidenceColor(confidenceLevel)}`}>
                {(confidence * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {keywords.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Keywords</p>
            <div className="flex flex-wrap gap-2">
              {keywords.map((keyword, index) => (
                <Badge key={index} variant="secondary">
                  {keyword}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {allPredictions.length > 0 && (
          <div>
            <p className="mb-2 text-sm text-muted-foreground">Prediksi Lainnya</p>
            <div className="space-y-1">
              {allPredictions.slice(0, 3).map((pred, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span>{pred.division}</span>
                  <span className="text-muted-foreground">{(pred.confidence * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
