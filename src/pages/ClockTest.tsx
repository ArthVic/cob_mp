import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { Eraser } from "lucide-react";

const ClockTest = () => {
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = '#000000';
        context.lineWidth = 2;
        context.lineCap = 'round';
        setCtx(context);
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !ctx) return;
    const rect = canvasRef.current!.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Test 4 of 5</span>
            <span className="text-sm text-muted-foreground">Clock Drawing Test</span>
          </div>
          <Progress value={80} />
        </div>

        <Card className="p-8 space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Clock Drawing Test</h1>
            <p className="text-muted-foreground">
              Draw a clock face with all numbers and set the time to 11:10
            </p>
          </div>

          <div className="space-y-3">
            <div className="border-2 border-border rounded-lg overflow-hidden bg-white">
              <canvas
                ref={canvasRef}
                width={500}
                height={500}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>

            <Button
              variant="outline"
              onClick={clearCanvas}
              className="w-full"
            >
              <Eraser className="mr-2 h-4 w-4" />
              Clear Drawing
            </Button>
          </div>

          <Button onClick={() => navigate('/test/digit')} size="lg" className="w-full">
            Continue
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default ClockTest;
