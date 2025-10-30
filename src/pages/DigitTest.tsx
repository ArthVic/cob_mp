import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const SEQUENCES = [
  { forward: "3-7-2", backward: "2-7-3" },
  { forward: "5-8-2-9", backward: "9-2-8-5" },
  { forward: "4-2-7-3-1", backward: "1-3-7-2-4" },
];

const DigitTest = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"show" | "forward" | "backward">("show");
  const [currentSequence, setCurrentSequence] = useState(0);
  const [showSequence, setShowSequence] = useState(true);
  const [forwardAnswer, setForwardAnswer] = useState("");
  const [backwardAnswer, setBackwardAnswer] = useState("");

  useEffect(() => {
    if (stage === "show" && showSequence) {
      const timer = setTimeout(() => {
        setShowSequence(false);
        setStage("forward");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [stage, showSequence]);

  const handleForwardSubmit = () => {
    setStage("backward");
  };

  const handleBackwardSubmit = () => {
    if (currentSequence < SEQUENCES.length - 1) {
      setCurrentSequence(prev => prev + 1);
      setStage("show");
      setShowSequence(true);
      setForwardAnswer("");
      setBackwardAnswer("");
    } else {
      navigate('/test/recall');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Test 5 of 5</span>
            <span className="text-sm text-muted-foreground">Digit Span Test</span>
          </div>
          <Progress value={90} />
        </div>

        <Card className="p-8 space-y-6">
          {stage === "show" && showSequence && (
            <div className="space-y-6 text-center py-8">
              <h2 className="text-2xl font-bold">Remember This Sequence</h2>
              <div className="bg-primary/10 rounded-lg p-8">
                <p className="text-4xl font-bold tracking-wider">
                  {SEQUENCES[currentSequence].forward}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                Sequence {currentSequence + 1} of {SEQUENCES.length}
              </p>
            </div>
          )}

          {stage === "forward" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Type the Sequence Forward</h2>
                <p className="text-muted-foreground">
                  Enter the numbers in the same order you saw them (use hyphens)
                </p>
              </div>
              <Input
                value={forwardAnswer}
                onChange={(e) => setForwardAnswer(e.target.value)}
                placeholder="e.g., 3-7-2"
                className="text-xl text-center"
              />
              <Button onClick={handleForwardSubmit} size="lg" className="w-full">
                Next
              </Button>
            </div>
          )}

          {stage === "backward" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">Type the Sequence Backward</h2>
                <p className="text-muted-foreground">
                  Enter the numbers in reverse order (use hyphens)
                </p>
              </div>
              <Input
                value={backwardAnswer}
                onChange={(e) => setBackwardAnswer(e.target.value)}
                placeholder="e.g., 2-7-3"
                className="text-xl text-center"
              />
              <Button onClick={handleBackwardSubmit} size="lg" className="w-full">
                {currentSequence < SEQUENCES.length - 1 ? "Next Sequence" : "Continue"}
              </Button>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default DigitTest;
