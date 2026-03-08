// Fashion image data for the app
export interface OutfitCard {
  id: string;
  imageUrl: string;
  username: string;
  avatarUrl: string;
  liked: boolean;
  height: 'tall' | 'medium' | 'short';
  category: string;
}

export interface ClothingItem {
  id: string;
  imageUrl: string;
  tag: string;
}

export const outfitCards: OutfitCard[] = [
  { id: '1', imageUrl: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=560&fit=crop&auto=format', username: 'sofia.style', avatarUrl: 'https://i.pravatar.cc/40?img=1', liked: false, height: 'tall', category: 'Minimal' },
  { id: '2', imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=400&fit=crop&auto=format', username: 'leo.threads', avatarUrl: 'https://i.pravatar.cc/40?img=2', liked: true, height: 'short', category: 'Casual' },
  { id: '3', imageUrl: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400&h=520&fit=crop&auto=format', username: 'aria.wear', avatarUrl: 'https://i.pravatar.cc/40?img=3', liked: false, height: 'medium', category: 'Formal' },
  { id: '4', imageUrl: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=600&fit=crop&auto=format', username: 'mila.looks', avatarUrl: 'https://i.pravatar.cc/40?img=4', liked: false, height: 'tall', category: 'Streetwear' },
  { id: '5', imageUrl: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=400&h=440&fit=crop&auto=format', username: 'kai.drip', avatarUrl: 'https://i.pravatar.cc/40?img=5', liked: true, height: 'short', category: 'Boho' },
  { id: '6', imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&h=540&fit=crop&auto=format', username: 'nina.chic', avatarUrl: 'https://i.pravatar.cc/40?img=6', liked: false, height: 'medium', category: 'Minimal' },
  { id: '7', imageUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=580&fit=crop&auto=format', username: 'rex.mode', avatarUrl: 'https://i.pravatar.cc/40?img=7', liked: false, height: 'tall', category: 'Casual' },
  { id: '8', imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=420&fit=crop&auto=format', username: 'zoe.fit', avatarUrl: 'https://i.pravatar.cc/40?img=8', liked: true, height: 'short', category: 'Formal' },
  { id: '9', imageUrl: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=500&fit=crop&auto=format', username: 'omar.edge', avatarUrl: 'https://i.pravatar.cc/40?img=9', liked: false, height: 'medium', category: 'Streetwear' },
  { id: '10', imageUrl: 'https://images.unsplash.com/photo-1502716119720-b23a1e3b2b22?w=400&h=570&fit=crop&auto=format', username: 'elle.vibe', avatarUrl: 'https://i.pravatar.cc/40?img=10', liked: false, height: 'tall', category: 'Boho' },
];

export const trendingCards: OutfitCard[] = [
  { id: 't1', imageUrl: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=550&fit=crop&auto=format', username: 'trend.setter', avatarUrl: 'https://i.pravatar.cc/40?img=11', liked: false, height: 'medium', category: 'Minimal' },
  { id: 't2', imageUrl: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=400&h=620&fit=crop&auto=format', username: 'vogue.daily', avatarUrl: 'https://i.pravatar.cc/40?img=12', liked: true, height: 'tall', category: 'Streetwear' },
  { id: 't3', imageUrl: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=400&fit=crop&auto=format', username: 'chic.hunter', avatarUrl: 'https://i.pravatar.cc/40?img=13', liked: false, height: 'short', category: 'Boho' },
  { id: 't4', imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400&h=520&fit=crop&auto=format', username: 'mode.paris', avatarUrl: 'https://i.pravatar.cc/40?img=14', liked: false, height: 'medium', category: 'Formal' },
  { id: 't5', imageUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&h=580&fit=crop&auto=format', username: 'street.lens', avatarUrl: 'https://i.pravatar.cc/40?img=15', liked: true, height: 'tall', category: 'Casual' },
  { id: 't6', imageUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&h=430&fit=crop&auto=format', username: 'fit.journal', avatarUrl: 'https://i.pravatar.cc/40?img=16', liked: false, height: 'short', category: 'Minimal' },
];

export const wardrobeItems: ClothingItem[] = [
  { id: 'w1', imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=300&h=300&fit=crop&auto=format', tag: 'Tops' },
  { id: 'w2', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=300&h=300&fit=crop&auto=format', tag: 'Dresses' },
  { id: 'w3', imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300&h=300&fit=crop&auto=format', tag: 'Shoes' },
  { id: 'w4', imageUrl: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=300&h=300&fit=crop&auto=format', tag: 'Tops' },
  { id: 'w5', imageUrl: 'https://images.unsplash.com/photo-1560243563-062bfc001d68?w=300&h=300&fit=crop&auto=format', tag: 'Dresses' },
  { id: 'w6', imageUrl: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&h=300&fit=crop&auto=format', tag: 'Shoes' },
];

export const categories = ['All', 'Casual', 'Formal', 'Streetwear', 'Minimal', 'Boho'];
export const trendingTags = ['#Minimalist', '#Y2K', '#OldMoney', '#Streetcore', '#Boho', '#DarkAcademia', '#Cottagecore'];
