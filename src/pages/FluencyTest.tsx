import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff } from "lucide-react";
import { addTestResult } from "@/integrations/supabase/api";

const FluencyTest = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [animals, setAnimals] = useState("");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (started && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (started && timeLeft === 0) {
      setIsRecording(false);
    }
  }, [started, timeLeft]);

  const handleStart = () => {
    setStarted(true);
    setIsRecording(true);
  };

  const handleNext = async () => {
    const count = animals.split('\n').filter(a => a.trim()).length;
    await addTestResult({
      testType: "fluency",
      rawData: { entries: animals.split('\n').map(s => s.trim()).filter(Boolean) },
      score: count,
    });
    navigate('/test/clock');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Test 3 of 5</span>
            <span className="text-sm text-muted-foreground">Verbal Fluency Test</span>
          </div>
          <Progress value={60} />
        </div>

        <Card className="p-8 space-y-6">
          {!started ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Verbal Fluency Test</h1>
                <p className="text-muted-foreground">
                  Name as many animals as you can in 60 seconds.
                </p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Say or type animal names</li>
                <li>• Each animal counts once</li>
                <li>• You have 60 seconds</li>
              </ul>
              <Button onClick={handleStart} size="lg" className="w-full">
                Start Test
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="text-4xl font-bold text-primary">
                  {timeLeft}s
                </div>
                <p className="text-muted-foreground">
                  {timeLeft > 0 ? "Name as many animals as you can" : "Time's up!"}
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2 justify-center">
                  {isRecording ? (
                    <Mic className="h-5 w-5 text-destructive animate-pulse" />
                  ) : (
                    <MicOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm text-muted-foreground">
                    {isRecording ? "Recording..." : "Recording stopped"}
                  </span>
                </div>

                <Textarea
                  placeholder="Type animal names here (one per line)..."
                  value={animals}
                  onChange={(e) => setAnimals(e.target.value)}
                  disabled={timeLeft === 0}
                  className="min-h-32 text-lg"
                />

                <p className="text-sm text-muted-foreground">
                  Animals entered: {animals.split('\n').filter(a => a.trim()).length}
                </p>
              </div>

              {timeLeft === 0 && (
                <Button onClick={handleNext} size="lg" className="w-full">
                  Continue
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default FluencyTest;
