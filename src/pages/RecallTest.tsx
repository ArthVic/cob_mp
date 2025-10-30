import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";

const RecallTest = () => {
  const navigate = useNavigate();
  const [words, setWords] = useState<string[]>(["", "", "", "", ""]);

  const handleWordChange = (index: number, value: string) => {
    const newWords = [...words];
    newWords[index] = value;
    setWords(newWords);
  };

  const handleSubmit = () => {
    navigate('/results');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Final Step</span>
            <span className="text-sm text-muted-foreground">Memory Recall</span>
          </div>
          <Progress value={100} />
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Memory Recall</h1>
            <p className="text-muted-foreground">
              Remember the 5 words from the beginning? Type as many as you can remember.
            </p>
          </div>

          <div className="space-y-3">
            {words.map((word, index) => (
              <div key={index} className="space-y-1">
                <label className="text-sm text-muted-foreground">
                  Word {index + 1}
                </label>
                <Input
                  value={word}
                  onChange={(e) => handleWordChange(index, e.target.value)}
                  placeholder={`Enter word ${index + 1}`}
                  className="text-lg"
                />
              </div>
            ))}
          </div>

          <Button onClick={handleSubmit} size="lg" className="w-full">
            Submit & View Results
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default RecallTest;
