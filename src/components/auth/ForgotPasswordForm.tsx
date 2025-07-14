import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowRight, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { AuthLayout } from './AuthLayout';
import { useToast } from '@/hooks/use-toast';

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const { resetPassword } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);
    
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    } else {
      setSent(true);
      toast({
        title: "Email sent!",
        description: "Check your email for password reset instructions."
      });
    }
    setLoading(false);
  };

  if (sent) {
    return (
      <AuthLayout
        title="Check your email"
        subtitle="We've sent a password reset link to your email address"
      >
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-success/10 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-success" />
          </div>
          <p className="text-muted-foreground">
            Didn't receive the email? Check your spam folder or try again.
          </p>
          <Button
            onClick={() => setSent(false)}
            variant="outline"
            className="w-full"
          >
            Try again
          </Button>
          <Link 
            to="/auth/login" 
            className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email address and we'll send you a reset link"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 rounded-lg"
              required
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit Button */}
        <Button 
          type="submit" 
          className="w-full bg-gradient-primary text-white rounded-lg py-3 font-medium hover:opacity-90 transition-opacity"
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <>
              Send reset link
              <ArrowRight className="h-4 w-4 ml-2" />
            </>
          )}
        </Button>
      </form>

      {/* Footer Links */}
      <div className="text-center">
        <Link 
          to="/auth/login" 
          className="text-sm text-primary hover:underline flex items-center justify-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </AuthLayout>
  );
}