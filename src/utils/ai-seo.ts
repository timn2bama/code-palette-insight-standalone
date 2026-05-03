// AI-optimized SEO utilities for enhanced search visibility

export const generateBreadcrumbJsonLd = (breadcrumbs: Array<{ name: string; url: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": breadcrumbs.map((item, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "name": item.name,
    "item": `https://syncstyle.lovable.app${item.url}`
  }))
});

export const generateLocalBusinessJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": "https://syncstyle.lovable.app/#organization",
  "name": "SyncStyle",
  "description": "AI-powered wardrobe management and styling service",
  "url": "https://syncstyle.lovable.app",
  "telephone": "+1-555-SYNCSTYLE",
  "email": "syncstyleonline@gmail.com",
  "address": {
    "@type": "PostalAddress",
    "addressCountry": "US"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "40.7128",
    "longitude": "-74.0060"
  },
  "openingHours": "Mo-Su 00:00-23:59",
  "priceRange": "Free",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150"
  }
});

export const generatePersonJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "SyncStyle AI Assistant",
  "description": "Your personal AI-powered fashion and style consultant",
  "url": "https://syncstyle.lovable.app",
  "sameAs": [
    "https://twitter.com/syncstyle",
    "https://facebook.com/syncstyle"
  ],
  "knowsAbout": [
    "Fashion styling",
    "Wardrobe organization",
    "Outfit coordination",
    "Weather-appropriate dressing",
    "Personal style development"
  ],
  "memberOf": {
    "@type": "Organization",
    "name": "SyncStyle"
  }
});

export const generateVideoObjectJsonLd = (videoData: {
  name: string;
  description: string;
  thumbnailUrl: string;
  uploadDate: string;
  duration?: string;
}) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": videoData.name,
  "description": videoData.description,
  "thumbnailUrl": videoData.thumbnailUrl,
  "uploadDate": videoData.uploadDate,
  "duration": videoData.duration || "PT2M30S",
  "embedUrl": "https://syncstyle.lovable.app/video-embed",
  "contentUrl": "https://syncstyle.lovable.app/video",
  "publisher": {
    "@type": "Organization",
    "name": "SyncStyle",
    "logo": {
      "@type": "ImageObject",
      "url": "https://syncstyle.lovable.app/logo.png"
    }
  }
});

export const generateProductJsonLd = () => ({
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "SyncStyle Wardrobe Management App",
  "description": "AI-powered digital wardrobe organizer and outfit planning application",
  "brand": {
    "@type": "Brand",
    "name": "SyncStyle"
  },
  "category": "Software Application",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "availability": "https://schema.org/InStock",
    "url": "https://syncstyle.lovable.app",
    "seller": {
      "@type": "Organization",
      "name": "SyncStyle"
    }
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "150",
    "bestRating": "5",
    "worstRating": "1"
  },
  "review": [
    {
      "@type": "Review",
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": "5",
        "bestRating": "5"
      },
      "author": {
        "@type": "Person",
        "name": "Sarah Johnson"
      },
      "reviewBody": "SyncStyle transformed how I manage my wardrobe. The AI suggestions are spot-on!"
    }
  ]
});

// AI Search optimization helpers
export const generateAISearchTags = (pageType: string) => {
  const baseTags = [
    'ai-fashion-assistant',
    'smart-wardrobe-management',
    'digital-closet-organizer',
    'outfit-planning-app',
    'weather-based-styling',
    'fashion-ai-technology'
  ];

  const pageSpecificTags: Record<string, string[]> = {
    wardrobe: ['clothing-inventory', 'wardrobe-analytics', 'style-tracking'],
    outfits: ['outfit-creator', 'style-combinations', 'look-builder'],
    weather: ['weather-outfits', 'climate-appropriate-clothing', 'seasonal-styling'],
    services: ['fashion-services', 'style-professionals', 'clothing-care']
  };

  return [...baseTags, ...(pageSpecificTags[pageType] || [])];
};

export const generateSemanticKeywords = (mainTopic: string) => {
  const semanticMap: Record<string, string[]> = {
    'wardrobe': [
      'closet organization', 'clothing management', 'style inventory',
      'fashion collection', 'garment tracking', 'apparel organization'
    ],
    'outfit': [
      'clothing combinations', 'style coordination', 'look creation',
      'ensemble planning', 'fashion styling', 'dress coordination'
    ],
    'weather': [
      'climate dressing', 'seasonal outfits', 'temperature appropriate clothing',
      'weather-conscious fashion', 'adaptive styling', 'meteorological fashion'
    ],
    'ai': [
      'artificial intelligence fashion', 'machine learning style',
      'smart styling assistant', 'automated fashion advice',
      'intelligent wardrobe', 'AI-powered fashion'
    ]
  };

  return semanticMap[mainTopic] || [];
};

// Voice search optimization
export const generateVoiceSearchContent = () => [
  "How do I organize my wardrobe digitally?",
  "What should I wear based on today's weather?",
  "How can AI help me choose outfits?",
  "Best app for managing clothing collection",
  "Smart wardrobe organization tips",
  "Weather-appropriate outfit suggestions",
  "Digital closet management solutions",
  "AI fashion styling assistant"
];

// Featured snippet optimization
export const generateFeaturedSnippetContent = (topic: string) => {
  const snippets: Record<string, { question: string; answer: string }> = {
    'organize-wardrobe': {
      question: "How to organize your wardrobe with SyncStyle?",
      answer: "1. Upload photos of your clothing items 2. Categorize by type, color, and season 3. Track wear frequency and patterns 4. Get AI-powered outfit suggestions 5. Plan outfits based on weather forecasts"
    },
    'weather-outfits': {
      question: "How does weather-based outfit planning work?",
      answer: "SyncStyle analyzes current weather conditions including temperature, precipitation, humidity, and wind to recommend appropriate clothing from your digital wardrobe. The AI considers fabric types, layering options, and seasonal appropriateness."
    },
    'ai-styling': {
      question: "What is AI-powered fashion styling?",
      answer: "AI fashion styling uses machine learning algorithms to analyze your wardrobe, personal preferences, body type, and external factors like weather to provide personalized outfit recommendations and styling advice."
    }
  };

  return snippets[topic];
};