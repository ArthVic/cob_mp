import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Download, Home, AlertCircle, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { enqueueAnalysisAndProcess, fetchSessionAndResults, generateReport } from "@/integrations/supabase/api";

const Results = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [overallScore, setOverallScore] = useState<number | null>(null);
  const [tests, setTests] = useState<{ test_type: string; score: number | null; interpretation: string | null }[]>([]);

  const riskLevel = useMemo(() => {
    const v = overallScore ?? 0;
    return v <= 30 ? "low" : v <= 60 ? "moderate" : "high";
  }, [overallScore]);

  useEffect(() => {
    (async () => {
      try {
        setProcessing(true);
        await enqueueAnalysisAndProcess();
        // brief wait for processing then fetch
        await new Promise(r => setTimeout(r, 1200));
        const { session, results } = await fetchSessionAndResults();
        setOverallScore(Math.round(Number(session.overall_risk_score ?? 0)));
        setTests(results ?? []);
      } finally {
        setProcessing(false);
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background py-12 px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Your Assessment Results</h1>
          <p className="text-muted-foreground">
            Completed on {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Overall Risk Score */}
        <Card className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div>
              <Badge 
                variant={riskLevel === "low" ? "default" : riskLevel === "moderate" ? "secondary" : "destructive"}
                className="text-lg px-6 py-2"
              >
                {riskLevel === "low" && "Low Risk"}
                {riskLevel === "moderate" && "Moderate Risk"}
                {riskLevel === "high" && "High Risk"}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="text-6xl font-bold text-primary">{overallScore ?? 0}/100</div>
              <p className="text-muted-foreground">Overall Risk Score</p>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 max-w-2xl mx-auto">
              <div className="flex gap-3 items-start">
                <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="text-sm text-left">
                  <p className="font-semibold mb-2">What This Means</p>
                  {riskLevel === "low" && (
                    <p>Your cognitive assessment shows results within normal ranges for your age group. Continue maintaining a healthy lifestyle.</p>
                  )}
                  {riskLevel === "moderate" && (
                    <p>Some areas show mild concerns. We recommend discussing these results with your healthcare provider for further evaluation.</p>
                  )}
                  {riskLevel === "high" && (
                    <p>Several areas indicate significant concerns. We strongly recommend consulting with a healthcare professional for comprehensive evaluation.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Individual Test Results */}
        <Card className="p-8 space-y-6">
          <h2 className="text-2xl font-bold">Test Breakdown</h2>
          
          <div className="space-y-4">
            {tests.map((test, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {Number(test.score ?? 0) >= 50 ? (
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-warning" />
                  )}
                  <div>
                    <p className="font-semibold">{test.test_type}</p>
                    <p className="text-sm text-muted-foreground">Score: {test.score ?? 0}</p>
                  </div>
                </div>
                <Badge variant={Number(test.score ?? 0) >= 50 ? "default" : "secondary"}>
                  {Number(test.score ?? 0) >= 50 ? "Normal" : "Needs Attention"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={() => navigate('/')} variant="outline" className="flex-1">
            <Home className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <Button className="flex-1" disabled={processing || loading} onClick={async () => {
            const { url } = await generateReport();
            if (url) window.open(url, '_blank');
          }}>
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>

        {/* Next Steps */}
        <Card className="p-8 space-y-4 bg-primary/5 border-primary/20">
          <h3 className="text-xl font-bold">Recommended Next Steps</h3>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Share these results with your healthcare provider</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Consider retaking the assessment in 3 months to track changes</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Maintain a healthy lifestyle with regular exercise and social engagement</span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary">•</span>
              <span>Engage in cognitive activities like puzzles, reading, and learning new skills</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default Results;
