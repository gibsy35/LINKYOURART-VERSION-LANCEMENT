import React from 'react';

export const getSafeImageUrl = (image: string | undefined, category: string = 'Fine Art'): string => {
  if (!image || image.includes('picsum.photos') || image.includes('placeholder')) {
    const fallbacks: Record<string, string> = {
      'Fine Art': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800',
      'Architecture': 'https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&q=80&w=800',
      'Podcast': 'https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&q=80&w=800',
      'Digital Art': 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800',
      'Film': 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800',
      'TV Series': 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800',
      'Music': 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800',
      'Literature': 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&q=80&w=800',
      'Fashion': 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=800',
      'Design': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&q=80&w=800',
      'Photography': 'https://images.unsplash.com/photo-1452780212940-6f5c0d14d84a?auto=format&fit=crop&q=80&w=800',
      'Performing Arts': 'https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&q=80&w=800',
      'Gastronomy': 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=800',
    };
    return fallbacks[category] || fallbacks['Fine Art'];
  }
  return image;
};

// Universal <img onError> handler for project visuals. However an image URL
// went bad — a broken AI-generated data URI, an expired link, a blocked
// third-party host — this swaps it for a real, reliable Unsplash fallback
// at the moment it fails to load in the browser, instead of leaving a
// permanently broken/blank image. Use on every <img> that renders a
// project's picture, not just the ones going through getSafeImageUrl.
export const handleImageError = (category: string = 'Fine Art') =>
  (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    const fallback = getSafeImageUrl(undefined, category);
    if (target.src !== fallback) {
      target.src = fallback;
    }
  };
