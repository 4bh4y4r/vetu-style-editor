import { useState, useEffect } from 'react';
import { X, UserRoundSearch } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface FollowListModalProps {
  open: boolean;
  type: 'followers' | 'following' | null;
  userId: string;
  onClose: () => void;
}

const FollowListModal = ({ open, type, userId, onClose }: FollowListModalProps) => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && type && userId) {
      fetchUsers();
    }
  }, [open, type, userId]);

  const fetchUsers = async () => {
    setLoading(true);
    setUsers([]);
    try {
      if (type === 'followers') {
        const { data } = await supabase
          .from('follows')
          .select('follower_id, profiles!follows_follower_id_fkey(id, display_name, username, avatar_url)')
          .eq('following_id', userId);
        if (data) setUsers(data.map(d => d.profiles));
      } else {
        const { data } = await supabase
          .from('follows')
          .select('following_id, profiles!follows_following_id_fkey(id, display_name, username, avatar_url)')
          .eq('follower_id', userId);
        if (data) setUsers(data.map(d => d.profiles));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (!open || !type) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center sm:items-end bg-foreground/40 backdrop-blur-sm p-4 sm:p-0" onClick={onClose}>
      <div
        className="w-full max-w-md bg-background rounded-2xl sm:rounded-b-none sm:rounded-t-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: 'calc(100vh - 4rem)', minHeight: '50vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-4 pb-3 shrink-0 border-b border-border/30">
          <h2 className="text-lg font-display font-bold text-foreground capitalize">{type}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2">
          {loading ? (
            <div className="py-12 flex justify-center">
               <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 flex flex-col items-center text-center px-4">
              <div className="w-12 h-12 bg-secondary rounded-full flex items-center justify-center mb-3">
                 <UserRoundSearch size={20} className="text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold">No {type} yet</p>
              <p className="text-xs text-muted-foreground">When you have {type}, they'll show up here.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border/30">
              {users.map((profile) => (
                profile && (
                  <li key={profile.id}>
                    <button
                      onClick={() => {
                        onClose();
                        navigate(`/profile/${profile.id}`);
                      }}
                      className="w-full flex items-center gap-3 p-3 hover:bg-secondary/50 transition-colors text-left"
                    >
                      <img 
                        src={profile.avatar_url || `https://ui-avatars.com/api/?name=${profile.display_name || profile.username}&background=random`} 
                        alt="Avatar" 
                        className="w-10 h-10 rounded-full object-cover bg-secondary"
                      />
                      <div>
                        <p className="text-sm font-semibold">{profile.display_name || profile.username}</p>
                        {profile.username && <p className="text-xs text-muted-foreground">@{profile.username}</p>}
                      </div>
                    </button>
                  </li>
                )
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default FollowListModal;
