import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ensureSession } from "@/integrations/supabase/api";
import { useState } from "react";

const TestIntro = () => {
  const navigate = useNavigate();
  const [starting, setStarting] = useState(false);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">Before You Begin</h1>
          
          <div className="bg-muted/50 p-4 rounded-lg flex gap-3">
            <AlertCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm space-y-2">
              <p className="font-semibold">Important Information</p>
              <p>
                This screening tool is designed to detect early signs of cognitive decline. 
                It is not a diagnostic tool and should not replace professional medical advice.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">What to expect:</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>5 simple cognitive tests taking approximately 15-20 minutes</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Find a quiet, comfortable place with minimal distractions</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Complete all tests in one sitting for accurate results</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>You may need to draw on screen and record audio</span>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h2 className="text-xl font-semibold">Your Privacy</h2>
            <p className="text-muted-foreground text-sm">
              All your data is encrypted and stored securely. Your test results are private 
              and will only be shared if you choose to do so with healthcare providers.
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => navigate('/')} className="flex-1">
            Go Back
          </Button>
          <Button
            onClick={async () => {
              try {
                setStarting(true);
                await ensureSession();
                navigate('/test/memory');
              } finally {
                setStarting(false);
              }
            }}
            className="flex-1"
            disabled={starting}
          >
            {starting ? 'Starting…' : 'Start Test'} <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TestIntro;
