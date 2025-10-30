import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const WORDS = ["Apple", "Table", "Penny", "Flower", "Book"];

const MemoryTest = () => {
  const navigate = useNavigate();
  const [stage, setStage] = useState<"show" | "distraction" | "recall">("show");
  const [memorizedWords] = useState(WORDS);
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    if (stage === "show") {
      const timer = setTimeout(() => {
        setStage("distraction");
        setCountdown(5);
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [stage]);

  useEffect(() => {
    if (stage === "distraction" && countdown > 0) {
      const timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (stage === "distraction" && countdown === 0) {
      navigate('/test/reaction');
    }
  }, [stage, countdown, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Test 1 of 5</span>
            <span className="text-sm text-muted-foreground">Memory Test</span>
          </div>
          <Progress value={20} />
        </div>

        <Card className="p-8 space-y-6">
          {stage === "show" && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Remember These Words</h1>
                <p className="text-muted-foreground">
                  Study these 5 words carefully. You will be asked to recall them later.
                </p>
              </div>

              <div className="bg-primary/10 rounded-lg p-8">
                <div className="space-y-4">
                  {memorizedWords.map((word, index) => (
                    <div key={index} className="text-2xl font-semibold text-center">
                      {word}
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  Time remaining: {countdown} seconds
                </p>
              </div>
            </div>
          )}

          {stage === "distraction" && (
            <div className="space-y-6 text-center py-8">
              <h2 className="text-2xl font-bold">Moving to Next Test</h2>
              <p className="text-muted-foreground">
                We'll ask you to recall those words later. Let's continue with the next assessment.
              </p>
              <div className="text-4xl font-bold text-primary">{countdown}</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MemoryTest;
