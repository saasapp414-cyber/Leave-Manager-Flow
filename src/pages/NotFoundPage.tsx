import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center text-center p-4">
      <div className="animate-slide-up">
        <div className="text-8xl font-display font-bold text-slate-800 mb-2">404</div>
        <Calendar className="w-12 h-12 text-brand-500/50 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-slate-200 mb-2">Page Not Found</h1>
        <p className="text-slate-500 mb-6">The page you're looking for doesn't exist.</p>
        <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
      </div>
    </div>
  );
}
