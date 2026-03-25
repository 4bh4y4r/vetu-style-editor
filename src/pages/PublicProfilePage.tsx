import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, User } from 'lucide-react';

const PublicProfilePage = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background pb-20">
      <div className="flex items-center px-4 pt-4 pb-3 border-b border-border/30">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-foreground hover:bg-secondary rounded-full transition">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-xl font-display font-bold text-foreground ml-2">{username}'s Profile</h1>
      </div>
      <div className="flex flex-col items-center justify-center p-8 mt-12 text-center">
        <div className="w-24 h-24 rounded-full bg-secondary flex items-center justify-center mb-4 overflow-hidden border-4 border-background shadow-md">
           <User size={40} className="text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-display font-bold text-foreground mb-1">@{username}</h2>
        <p className="text-sm font-body text-muted-foreground max-w-[280px] mb-6">
          This is a public profile view. You'll soon see their public outfits and boards here.
        </p>
        <button className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-full hover:brightness-110 transition">
          Follow
        </button>
      </div>
    </div>
  );
};

export default PublicProfilePage;
