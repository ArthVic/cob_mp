import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";

const ReactionTest = () => {
  const navigate = useNavigate();
  const [started, setStarted] = useState(false);
  const [isGreen, setIsGreen] = useState(false);
  const [startTime, setStartTime] = useState(0);
  const [reactionTimes, setReactionTimes] = useState<number[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const maxRounds = 10;

  const startRound = () => {
    if (!started) return;
    
    const delay = Math.random() * 3000 + 1000; // Random delay between 1-4 seconds
    setTimeout(() => {
      setIsGreen(true);
      setStartTime(Date.now());
    }, delay);
  };

  useEffect(() => {
    if (started && currentRound < maxRounds && !isGreen) {
      startRound();
    } else if (currentRound >= maxRounds) {
      // Test complete, move to next
      setTimeout(() => navigate('/test/fluency'), 1500);
    }
  }, [started, currentRound, isGreen]);

  const handleClick = () => {
    if (!started) {
      setStarted(true);
      setCurrentRound(1);
      return;
    }

    if (isGreen) {
      const reactionTime = Date.now() - startTime;
      setReactionTimes([...reactionTimes, reactionTime]);
      setIsGreen(false);
      setCurrentRound(prev => prev + 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Test 2 of 5</span>
            <span className="text-sm text-muted-foreground">Reaction Time Test</span>
          </div>
          <Progress value={40} />
        </div>

        <Card className="p-8 space-y-6">
          {!started ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold">Reaction Time Test</h1>
                <p className="text-muted-foreground">
                  Click or tap as quickly as possible when the screen turns green.
                </p>
              </div>
              <ul className="space-y-2 text-muted-foreground">
                <li>• Wait for the screen to turn green</li>
                <li>• Click/tap as fast as you can</li>
                <li>• Repeat 10 times</li>
              </ul>
              <Button onClick={handleClick} size="lg" className="w-full">
                Start Test
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">
                  Round {currentRound} of {maxRounds}
                </p>
                {currentRound >= maxRounds && (
                  <p className="text-lg font-semibold text-primary">Test Complete!</p>
                )}
              </div>

              <button
                onClick={handleClick}
                className={`w-full h-64 rounded-lg transition-colors ${
                  isGreen ? 'bg-success' : 'bg-muted/50'
                } cursor-pointer flex items-center justify-center text-2xl font-bold`}
                disabled={currentRound >= maxRounds}
              >
                {isGreen ? 'CLICK NOW!' : 'Wait...'}
              </button>

              {reactionTimes.length > 0 && (
                <div className="text-center text-sm text-muted-foreground">
                  Last reaction: {reactionTimes[reactionTimes.length - 1]}ms
                </div>
              )}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ReactionTest;
