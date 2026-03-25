import { ArrowLeft, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InboxPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex items-center px-4 pt-4 pb-3 border-b border-border/30">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-full transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground ml-2">Inbox</h1>
      </div>
      <div className="flex flex-col items-center justify-center p-8 mt-20 text-center">
        <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
          <Bell size={28} className="text-muted-foreground" />
        </div>
        <h2 className="text-lg font-display font-bold text-foreground mb-2">No notifications yet</h2>
        <p className="text-sm font-body text-muted-foreground max-w-[250px]">
          When you get likes, follows, or messages, they will appear here.
        </p>
      </div>
    </div>
  );
};

export default InboxPage;
