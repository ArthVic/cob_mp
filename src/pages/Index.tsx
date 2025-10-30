import { Button } from "@/components/ui/button";
import { ArrowRight, Brain, Clock, Shield, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleStartTest = () => {
    if (!user) {
      navigate("/auth");
    } else {
      navigate("/demographics");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {user && (
        <div className="absolute top-4 right-4">
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="container mx-auto px-6 py-16 md:py-24 max-w-4xl">
        <div className="text-center space-y-6">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
            Early Dementia Screening in 15 Minutes
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            AI-powered cognitive assessment designed for elderly users and caregivers. 
            Simple, accessible, and clinically validated.
          </p>
          <div className="pt-4">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={handleStartTest}
            >
              {user ? "Start Free Test" : "Sign Up to Start Test"} <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="container mx-auto px-6 py-16 max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Clock className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Quick & Easy</h3>
            <p className="text-muted-foreground">
              Complete 5 simple tests in just 15-20 minutes
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Brain className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">AI-Powered</h3>
            <p className="text-muted-foreground">
              Advanced algorithms analyze cognitive patterns
            </p>
          </div>

          <div className="text-center space-y-3">
            <div className="flex justify-center">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h3 className="text-lg font-semibold">Secure & Private</h3>
            <p className="text-muted-foreground">
              Your health data is encrypted and protected
            </p>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="container mx-auto px-6 py-16 max-w-3xl">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="space-y-6">
          {[
            { step: 1, title: "Memory Test", desc: "Remember and recall words" },
            { step: 2, title: "Reaction Time", desc: "Test processing speed" },
            { step: 3, title: "Verbal Fluency", desc: "Name animals in 60 seconds" },
            { step: 4, title: "Clock Drawing", desc: "Draw a clock face" },
            { step: 5, title: "Digit Span", desc: "Remember number sequences" }
          ].map(({ step, title, desc }) => (
            <div key={step} className="flex items-start gap-4 p-4 rounded-lg bg-muted/50">
              <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">
                {step}
              </div>
              <div>
                <h4 className="font-semibold mb-1">{title}</h4>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="container mx-auto px-6 py-16 text-center">
        <div className="bg-muted/50 rounded-2xl p-12 max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-6">
            Early detection can make a significant difference. Take the first step today.
          </p>
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 h-auto"
            onClick={handleStartTest}
          >
            {user ? "Begin Assessment" : "Sign Up to Start"} <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
