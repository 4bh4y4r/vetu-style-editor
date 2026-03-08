import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !username.trim()) return;
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: { username: username.trim() },
        emailRedirectTo: window.location.origin,
      },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Check your email to confirm your account!');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <h1 className="text-4xl font-display font-bold text-center text-foreground mb-2">DRIP</h1>
        <p className="text-sm font-body text-muted-foreground text-center mb-10">Create your style account</p>

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Username</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="your_style_name"
              className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition"
              required
            />
          </div>
          <div>
            <label className="text-xs font-body font-medium text-muted-foreground mb-1 block">Password</label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters"
                className="w-full px-4 py-3 rounded-lg bg-secondary text-foreground text-sm font-body placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition pr-12"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg bg-primary text-primary-foreground text-sm font-body font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm font-body text-muted-foreground mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:underline">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
