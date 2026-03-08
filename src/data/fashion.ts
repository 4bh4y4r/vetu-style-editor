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

const unsplashFashion = (id: number, w = 400, h = 600) =>
  `https://images.unsplash.com/photo-${id}?w=${w}&h=${h}&fit=crop&auto=format`;

export const outfitCards: OutfitCard[] = [
  { id: '1', imageUrl: unsplashFashion(1515886657613, 400, 560), username: 'sofia.style', avatarUrl: 'https://i.pravatar.cc/40?img=1', liked: false, height: 'tall', category: 'Minimal' },
  { id: '2', imageUrl: unsplashFashion(1509631179647, 400, 400), username: 'leo.threads', avatarUrl: 'https://i.pravatar.cc/40?img=2', liked: true, height: 'short', category: 'Casual' },
  { id: '3', imageUrl: unsplashFashion(1485968056840, 400, 520), username: 'aria.wear', avatarUrl: 'https://i.pravatar.cc/40?img=3', liked: false, height: 'medium', category: 'Formal' },
  { id: '4', imageUrl: unsplashFashion(1496747611176, 400, 600), username: 'mila.looks', avatarUrl: 'https://i.pravatar.cc/40?img=4', liked: false, height: 'tall', category: 'Streetwear' },
  { id: '5', imageUrl: unsplashFashion(1529139574466, 400, 440), username: 'kai.drip', avatarUrl: 'https://i.pravatar.cc/40?img=5', liked: true, height: 'short', category: 'Boho' },
  { id: '6', imageUrl: unsplashFashion(1490481651871, 400, 540), username: 'nina.chic', avatarUrl: 'https://i.pravatar.cc/40?img=6', liked: false, height: 'medium', category: 'Minimal' },
  { id: '7', imageUrl: unsplashFashion(1544005313991, 400, 580), username: 'rex.mode', avatarUrl: 'https://i.pravatar.cc/40?img=7', liked: false, height: 'tall', category: 'Casual' },
  { id: '8', imageUrl: unsplashFashion(1558618666248, 400, 420), username: 'zoe.fit', avatarUrl: 'https://i.pravatar.cc/40?img=8', liked: true, height: 'short', category: 'Formal' },
  { id: '9', imageUrl: unsplashFashion(1487222477894, 400, 500), username: 'omar.edge', avatarUrl: 'https://i.pravatar.cc/40?img=9', liked: false, height: 'medium', category: 'Streetwear' },
  { id: '10', imageUrl: unsplashFashion(1502716036198, 400, 570), username: 'elle.vibe', avatarUrl: 'https://i.pravatar.cc/40?img=10', liked: false, height: 'tall', category: 'Boho' },
];

export const trendingCards: OutfitCard[] = [
  { id: 't1', imageUrl: unsplashFashion(1539109136881, 400, 550), username: 'trend.setter', avatarUrl: 'https://i.pravatar.cc/40?img=11', liked: false, height: 'medium', category: 'Minimal' },
  { id: 't2', imageUrl: unsplashFashion(1551232864509, 400, 620), username: 'vogue.daily', avatarUrl: 'https://i.pravatar.cc/40?img=12', liked: true, height: 'tall', category: 'Streetwear' },
  { id: 't3', imageUrl: unsplashFashion(1495385794356, 400, 400), username: 'chic.hunter', avatarUrl: 'https://i.pravatar.cc/40?img=13', liked: false, height: 'short', category: 'Boho' },
  { id: 't4', imageUrl: unsplashFashion(1469334031218, 400, 520), username: 'mode.paris', avatarUrl: 'https://i.pravatar.cc/40?img=14', liked: false, height: 'medium', category: 'Formal' },
  { id: 't5', imageUrl: unsplashFashion(1524504388940, 400, 580), username: 'street.lens', avatarUrl: 'https://i.pravatar.cc/40?img=15', liked: true, height: 'tall', category: 'Casual' },
  { id: 't6', imageUrl: unsplashFashion(1517841905240, 400, 430), username: 'fit.journal', avatarUrl: 'https://i.pravatar.cc/40?img=16', liked: false, height: 'short', category: 'Minimal' },
];

export const wardrobeItems: ClothingItem[] = [
  { id: 'w1', imageUrl: unsplashFashion(1562157873, 300, 300), tag: 'Tops' },
  { id: 'w2', imageUrl: unsplashFashion(1594938298603, 300, 300), tag: 'Dresses' },
  { id: 'w3', imageUrl: unsplashFashion(1542291026616, 300, 300), tag: 'Shoes' },
  { id: 'w4', imageUrl: unsplashFashion(1583743814966, 300, 300), tag: 'Tops' },
  { id: 'w5', imageUrl: unsplashFashion(1560243563120, 300, 300), tag: 'Dresses' },
  { id: 'w6', imageUrl: unsplashFashion(1549298916, 300, 300), tag: 'Shoes' },
];

export const categories = ['All', 'Casual', 'Formal', 'Streetwear', 'Minimal', 'Boho'];
export const trendingTags = ['#Minimalist', '#Y2K', '#OldMoney', '#Streetcore', '#Boho', '#DarkAcademia', '#Cottagecore'];
