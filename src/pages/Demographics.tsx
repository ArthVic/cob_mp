import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const demographicsSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  age: z.string().refine((val) => {
    const num = parseInt(val);
    return num >= 20 && num <= 100;
  }, "Age must be between 20 and 100"),
  gender: z.string().min(1, "Gender is required"),
  education: z.string().min(1, "Education level is required"),
});

const Demographics = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    education: "",
  });

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      }
    });
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      demographicsSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Update profile with demographics
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          age: parseInt(formData.age),
        })
        .eq("id", session.user.id);

      if (error) throw error;

      // Store additional data in sessionStorage for tests
      sessionStorage.setItem("demographics", JSON.stringify(formData));
      
      // Create a new test session
      const { data: sessionData, error: sessionError } = await supabase
        .from("test_sessions")
        .insert({
          user_id: session.user.id,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Store session ID for use in tests
      sessionStorage.setItem("testSessionId", sessionData.id);

      navigate("/test/intro");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-8 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Basic Information</h1>
          <p className="text-muted-foreground">
            This information helps us provide more accurate results.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              required
              maxLength={100}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter your full name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="age">Age *</Label>
            <Input
              id="age"
              type="number"
              min="20"
              max="100"
              required
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              placeholder="Enter your age"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender *</Label>
            <Select 
              required 
              value={formData.gender}
              onValueChange={(value) => setFormData({ ...formData, gender: value })}
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
                <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="education">Education Level *</Label>
            <Select 
              required 
              value={formData.education}
              onValueChange={(value) => setFormData({ ...formData, education: value })}
            >
              <SelectTrigger id="education">
                <SelectValue placeholder="Select education level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="elementary">Elementary School</SelectItem>
                <SelectItem value="high-school">High School</SelectItem>
                <SelectItem value="some-college">Some College</SelectItem>
                <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                <SelectItem value="graduate">Graduate Degree</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => navigate('/')} className="flex-1">
              Go Back
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? "Saving..." : "Continue"} {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default Demographics;
