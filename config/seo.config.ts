export const seoConfig = {
  // Site Information
  siteName: 'Fancy Parivahan',
  siteUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://fancyparivahan.com',
  siteDescription: 'Search for Numerology-based Parivahan fancy numbers easily with Fancy Parivahan. Search and find choice numbers, VIP numbers, and mParivahan fancy numbers online.',
  
  // Default SEO Settings
  defaultTitle: 'Fancy Parivahan | Search Numerology-Based Fancy, Choice & VIP Number',
  defaultDescription: 'Search for Numerology-based Parivahan fancy numbers easily with Fancy Parivahan. Search and find choice numbers, VIP numbers, and mParivahan fancy numbers online.',
  
  // Keywords
  keywords: [
    'fancy number plate',
    'VIP number plate',
    'choice number plate',
    'numerology number plate',
    'parivahan number search',
    'vehicle number plate',
    'lucky number plate',
    'premium number plate',
    'RTO number plate',
    'state wise number plate',
    'fancy parivahan',
    'number plate search',
    'vehicle registration number',
    'car number plate',
    'bike number plate',
    'numerology based number',
    'lucky vehicle number',
    'premium vehicle number',
    'choice vehicle number',
    'VIP vehicle number'
  ],
  
  // Social Media
  social: {
    twitter: '@fancyparivahan',
    facebook: 'fancyparivahan',
    instagram: 'fancyparivahan',
    linkedin: 'fancyparivahan'
  },
  
  // Images
  images: {
    default: '/media/banners/fancy-parivahan-og-image.png',
    logo: '/media/app/fancy-parivahan-logo.png',
    favicon: '/favicon.ico',
    appleTouchIcon: '/media/app/apple-touch-icon.png'
  },
  
  // Structured Data
  organization: {
    name: 'Fancy Parivahan',
    url: process.env.NEXT_PUBLIC_BASE_URL || 'https://fancyparivahan.com',
    logo: '/media/app/fancy-parivahan-logo.png',
    description: 'Leading platform for finding numerology-based fancy number plates, VIP numbers, and choice numbers for vehicles.',
    contactPoint: {
      telephone: '+91-XXXX-XXXXXX',
      contactType: 'customer service',
      areaServed: 'IN',
      availableLanguage: 'English'
    },
    sameAs: [
      'https://twitter.com/fancyparivahan',
      'https://facebook.com/fancyparivahan',
      'https://instagram.com/fancyparivahan',
      'https://linkedin.com/company/fancyparivahan'
    ]
  },
  
  // Page-specific SEO
  pages: {
    home: {
      title: 'Search Fancy Number Plates | Fancy Parivahan',
      description: 'Search for fancy number plates, VIP numbers, and choice numbers based on numerology. Find your perfect vehicle number plate with Fancy Parivahan.',
      keywords: [
        'fancy number plate search',
        'VIP number plate',
        'choice number plate',
        'numerology number plate',
        'vehicle number search',
        'lucky number plate',
        'premium number plate',
        'RTO number search'
      ]
    },
    search: {
      title: 'Number Plate Search Results | Fancy Parivahan',
      description: 'View search results for fancy number plates, VIP numbers, and choice numbers. Browse through available vehicle number plates based on your numerology preferences.',
      keywords: [
        'number plate search results',
        'fancy number plate results',
        'VIP number plate results',
        'choice number plate results',
        'vehicle number search results',
        'numerology number results',
        'RTO number search results'
      ]
    },
    about: {
      title: 'About Fancy Parivahan | Your Trusted Number Plate Search Platform',
      description: 'Learn about Fancy Parivahan - your trusted platform for finding numerology-based fancy number plates, VIP numbers, and choice numbers for your vehicle.',
      keywords: [
        'about fancy parivahan',
        'fancy number plate company',
        'numerology number plate service',
        'VIP number plate provider',
        'vehicle number plate service',
        'RTO number plate company',
        'fancy parivahan team',
        'number plate search platform'
      ]
    },
    contact: {
      title: 'Contact Fancy Parivahan | Get Help with Number Plate Search',
      description: 'Get in touch with Fancy Parivahan for support, inquiries, or assistance with finding your perfect fancy number plate. We are here to help you find the ideal numerology-based vehicle number.',
      keywords: [
        'contact fancy parivahan',
        'fancy number plate support',
        'number plate inquiry',
        'vehicle number plate help',
        'fancy parivahan customer service',
        'number plate assistance',
        'VIP number plate support',
        'numerology number plate help'
      ]
    },
    howItWorks: {
      title: 'How Fancy Parivahan Works | Number Plate Search Guide',
      description: 'Learn how Fancy Parivahan works to help you find the perfect numerology-based fancy number plate. Step-by-step guide to searching and selecting your ideal vehicle number.',
      keywords: [
        'how fancy parivahan works',
        'number plate search process',
        'fancy number plate selection',
        'numerology number plate guide',
        'vehicle number plate process',
        'VIP number plate selection',
        'choice number plate guide',
        'number plate search tutorial'
      ]
    }
  }
};

export default seoConfig;
