
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthRequiredDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AuthRequiredDialog = ({
  open,
  onOpenChange,
}: AuthRequiredDialogProps) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    try {
      if (mode === 'signin') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "You have been signed in successfully",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });
        
        if (error) throw error;
        
        toast({
          title: "Success",
          description: "Your account has been created. Please check your email for a confirmation link.",
        });
      }
      
      onOpenChange(false);
    } catch (error: any) {
      console.error('Authentication error:', error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="sm:max-w-[425px] z-[3000]"
        role="dialog"
        aria-labelledby="auth-dialog-title"
        aria-describedby="auth-dialog-description"
      >
        <AlertDialogHeader>
          <AlertDialogTitle id="auth-dialog-title">
            {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
          </AlertDialogTitle>
          <AlertDialogDescription id="auth-dialog-description" className="space-y-2">
            <p>
              {mode === 'signin' 
                ? 'Sign in to comment, save applications, and get notifications.' 
                : 'Create an account to join the discussion and save your favorite applications.'}
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <form onSubmit={handleAuth} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email" 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="Enter your email" 
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              placeholder="Enter your password" 
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading 
              ? 'Please wait...' 
              : mode === 'signin' 
                ? 'Sign In' 
                : 'Create Account'
            }
          </Button>
        </form>
        
        <div className="text-center text-sm">
          {mode === 'signin' ? (
            <p>
              Don't have an account?{' '}
              <button 
                onClick={() => setMode('signup')} 
                className="text-primary hover:underline"
                type="button"
              >
                Create one
              </button>
            </p>
          ) : (
            <p>
              Already have an account?{' '}
              <button 
                onClick={() => setMode('signin')} 
                className="text-primary hover:underline"
                type="button"
              >
                Sign in
              </button>
            </p>
          )}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
