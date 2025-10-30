import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Demographics from "./pages/Demographics";
import TestIntro from "./pages/TestIntro";
import MemoryTest from "./pages/MemoryTest";
import ReactionTest from "./pages/ReactionTest";
import FluencyTest from "./pages/FluencyTest";
import ClockTest from "./pages/ClockTest";
import DigitTest from "./pages/DigitTest";
import RecallTest from "./pages/RecallTest";
import Results from "./pages/Results";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/demographics" element={<Demographics />} />
          <Route path="/test/intro" element={<TestIntro />} />
          <Route path="/test/memory" element={<MemoryTest />} />
          <Route path="/test/reaction" element={<ReactionTest />} />
          <Route path="/test/fluency" element={<FluencyTest />} />
          <Route path="/test/clock" element={<ClockTest />} />
          <Route path="/test/digit" element={<DigitTest />} />
          <Route path="/test/recall" element={<RecallTest />} />
          <Route path="/results" element={<Results />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
