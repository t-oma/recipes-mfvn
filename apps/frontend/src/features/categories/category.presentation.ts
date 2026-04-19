interface CategoryPresentation {
  image: string;
}

const presentationBySlug: Record<string, CategoryPresentation> = {
  desserts: {
    image:
      "https://images.unsplash.com/photo-1563729784474-d77dbb9386b5?w=400&h=520&fit=crop",
  },
  soups: {
    image:
      "https://images.unsplash.com/photo-1604152135912-04a022e23696?w=400&h=520&fit=crop",
  },
  salads: {
    image:
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=520&fit=crop",
  },
  pasta: {
    image:
      "https://images.unsplash.com/photo-1556761223-4c4282c73f77?w=420&h=520&fit=crop",
  },
  snacks: {
    image:
      "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?w=400&h=520&fit=crop",
  },
  meat: {
    image:
      "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?w=400&h=520&fit=crop",
  },
};

const fallbackImages = [
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=520&fit=crop",
  "https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=520&fit=crop",
  "https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=400&h=520&fit=crop",
  "https://images.unsplash.com/photo-1499028344343-cd173ffc68a9?w=400&h=520&fit=crop",
  "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?w=400&h=520&fit=crop",
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&h=520&fit=crop",
];

const defaultImage =
  "https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=400&h=520&fit=crop";

function hashSlug(slug: string): number {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash << 5) - hash + slug.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function getCategoryPresentation(slug: string): CategoryPresentation {
  const known = presentationBySlug[slug];
  if (known) return known;

  const index = hashSlug(slug) % fallbackImages.length;
  return { image: fallbackImages.at(index) ?? defaultImage };
}
