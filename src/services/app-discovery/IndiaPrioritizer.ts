/**
 * IndiaPrioritizer
 * 
 * Manages category definitions, India-focused priority detection,
 * and canonical seeds across 38+ essential service sectors.
 */

import { AppCategoryItem, UniversalAppRecord } from './types';

export const ALL_APP_CATEGORIES: AppCategoryItem[] = [
  { id: 'upi', name: 'UPI', hindiName: 'यूपीआई पेमेंट्स', iconName: 'CreditCard', priorityIndia: true, sampleQueries: ['upi apps', 'best upi', 'instant payment app', 'qr payment'] },
  { id: 'banking', name: 'Banking', hindiName: 'बैंकिंग', iconName: 'Landmark', priorityIndia: true, sampleQueries: ['banking apps', 'mobile banking', 'sbi yono', 'hdfc bank'] },
  { id: 'food_delivery', name: 'Food Delivery', hindiName: 'फूड डिलीवरी', iconName: 'Utensils', priorityIndia: true, sampleQueries: ['food delivery apps', 'order food', 'swiggy', 'zomato'] },
  { id: 'grocery', name: 'Grocery', hindiName: 'ग्रॉसरी व त्वरित डिलीवरी', iconName: 'ShoppingBag', priorityIndia: true, sampleQueries: ['grocery apps', 'quick commerce', 'blinkit', 'zepto'] },
  { id: 'travel', name: 'Travel', hindiName: 'यात्रा व टिकट', iconName: 'Plane', priorityIndia: true, sampleQueries: ['travel apps', 'train booking', 'irctc', 'flight ticket'] },
  { id: 'cab', name: 'Cab', hindiName: 'कैब व राइड्स', iconName: 'Car', priorityIndia: true, sampleQueries: ['cab apps', 'taxi booking', 'ola', 'uber', 'rapido'] },
  { id: 'hotels', name: 'Hotels', hindiName: 'होटल बुकिंग', iconName: 'BedDouble', priorityIndia: true, sampleQueries: ['hotel booking apps', 'oyo', 'makemytrip hotels'] },
  { id: 'shopping', name: 'Shopping', hindiName: 'शॉपिंग', iconName: 'ShoppingBag', priorityIndia: true, sampleQueries: ['shopping apps', 'online shopping', 'flipkart', 'amazon', 'meesho'] },
  { id: 'e_commerce', name: 'E-commerce', hindiName: 'ई-कॉमर्स', iconName: 'Store', priorityIndia: true, sampleQueries: ['ecommerce apps', 'fashion store', 'myntra', 'ajio'] },
  { id: 'ott', name: 'OTT', hindiName: 'ओटीटी व मूवीज', iconName: 'Film', priorityIndia: true, sampleQueries: ['ott apps', 'movie streaming', 'jiocinema', 'hotstar', 'netflix'] },
  { id: 'video', name: 'Video', hindiName: 'वीडियो', iconName: 'Video', priorityIndia: true, sampleQueries: ['video apps', 'youtube', 'short videos', 'reels'] },
  { id: 'music', name: 'Music', hindiName: 'म्यूजिक व गाने', iconName: 'Music', priorityIndia: true, sampleQueries: ['music apps', 'songs app', 'spotify', 'jiosaavn', 'wynk'] },
  { id: 'podcasts', name: 'Podcasts', hindiName: 'पॉडकास्ट', iconName: 'Mic', priorityIndia: false, sampleQueries: ['podcast apps', 'audio stories', 'kuku fm', 'pocket fm'] },
  { id: 'messaging', name: 'Messaging', hindiName: 'मैसेजिंग व चैटिंग', iconName: 'MessageSquare', priorityIndia: true, sampleQueries: ['messaging apps', 'chat app', 'whatsapp', 'telegram', 'signal'] },
  { id: 'social_media', name: 'Social Media', hindiName: 'सोशल मीडिया', iconName: 'Share2', priorityIndia: true, sampleQueries: ['social media apps', 'instagram', 'facebook', 'x twitter'] },
  { id: 'govt_services', name: 'Government Services', hindiName: 'सरकारी सेवाएं', iconName: 'Shield', priorityIndia: true, sampleQueries: ['government apps', 'digilocker', 'umang', 'parivahan', 'aadhaar'] },
  { id: 'finance', name: 'Finance', hindiName: 'फाइनेंस व इनवेस्टमेंट', iconName: 'TrendingUp', priorityIndia: true, sampleQueries: ['finance apps', 'stock market', 'zerodha', 'groww', 'upstox'] },
  { id: 'insurance', name: 'Insurance', hindiName: 'बीमा व सुरक्षा', iconName: 'Umbrella', priorityIndia: true, sampleQueries: ['insurance apps', 'policybazaar', 'lic app'] },
  { id: 'education', name: 'Education', hindiName: 'शिक्षा व लर्निंग', iconName: 'GraduationCap', priorityIndia: true, sampleQueries: ['education apps', 'learning app', 'unacademy', 'byjus', 'khan academy'] },
  { id: 'jobs', name: 'Jobs', hindiName: 'जॉब्स व करियर', iconName: 'Briefcase', priorityIndia: true, sampleQueries: ['job apps', 'naukri', 'linkedin', 'apna app', 'internshala'] },
  { id: 'news', name: 'News', hindiName: 'समाचार व न्यूज़', iconName: 'Newspaper', priorityIndia: true, sampleQueries: ['news apps', 'inshorts', 'dailyhunt', 'hindi news'] },
  { id: 'sports', name: 'Sports', hindiName: 'स्पोर्ट्स व क्रिकेट', iconName: 'Trophy', priorityIndia: true, sampleQueries: ['sports apps', 'cricket score', 'cricbuzz', 'dream11'] },
  { id: 'ai', name: 'AI', hindiName: 'आर्टिफिशियल इंटेलिजेंस', iconName: 'Sparkles', priorityIndia: false, sampleQueries: ['ai apps', 'best ai apps', 'chatgpt', 'claude', 'gemini'] },
  { id: 'video_editing', name: 'Video Editing', hindiName: 'वीडियो एडिटिंग', iconName: 'Scissors', priorityIndia: false, sampleQueries: ['video editing apps', 'best video editor', 'capcut', 'vn editor', 'kinemaster'] },
  { id: 'photo_editing', name: 'Photo Editing', hindiName: 'फोटो एडिटिंग', iconName: 'Camera', priorityIndia: false, sampleQueries: ['photo editing apps', 'canva', 'picsart', 'snapseed', 'lightroom'] },
  { id: 'productivity', name: 'Productivity', hindiName: 'उत्पादकता व टूल्स', iconName: 'CheckSquare', priorityIndia: false, sampleQueries: ['productivity apps', 'notion', 'google keep', 'microsoft 365'] },
  { id: 'business', name: 'Business', hindiName: 'बिज़नेस व बहीखाता', iconName: 'Building', priorityIndia: true, sampleQueries: ['business apps', 'khatabook', 'okcredit', 'vyapar'] },
  { id: 'gaming', name: 'Gaming', hindiName: 'गेमिंग व मनोरंजन', iconName: 'Gamepad2', priorityIndia: false, sampleQueries: ['gaming apps', 'free fire', 'bgmi', 'chess'] },
  { id: 'dating', name: 'Dating', hindiName: 'डेटिंग व रिश्ते', iconName: 'Heart', priorityIndia: false, sampleQueries: ['dating apps', 'bumble', 'tinder', 'hinge'] },
  { id: 'health', name: 'Health', hindiName: 'स्वास्थ्य व डॉक्टर्स', iconName: 'HeartPulse', priorityIndia: true, sampleQueries: ['health apps', 'doctor consultation', 'practo', 'apollo 247'] },
  { id: 'fitness', name: 'Fitness', hindiName: 'फिटनेस व वर्कआउट', iconName: 'Activity', priorityIndia: false, sampleQueries: ['fitness apps', 'workout app', 'cult fit', 'step tracker'] },
  { id: 'maps', name: 'Maps', hindiName: 'मैप्स व नेविगेशन', iconName: 'MapPin', priorityIndia: true, sampleQueries: ['maps apps', 'google maps', 'mappls mapmyindia', 'navigation'] },
  { id: 'browser', name: 'Browser', hindiName: 'इंटरनेट ब्राउज़र', iconName: 'Compass', priorityIndia: false, sampleQueries: ['browser apps', 'chrome', 'brave browser', 'firefox'] },
  { id: 'cloud_storage', name: 'Cloud Storage', hindiName: 'क्लाउड स्टोरेज', iconName: 'Cloud', priorityIndia: false, sampleQueries: ['cloud storage apps', 'google drive', 'dropbox', 'onedrive'] },
  { id: 'developer_tools', name: 'Developer Tools', hindiName: 'डेवलपर टूल्स', iconName: 'Code', priorityIndia: false, sampleQueries: ['developer apps', 'github', 'termux', 'figma'] },
  { id: 'entertainment', name: 'Entertainment', hindiName: 'मनोरंजन', iconName: 'Tv', priorityIndia: false, sampleQueries: ['entertainment apps', 'bookmyshow', 'games'] },
  { id: 'books', name: 'Books', hindiName: 'किताबें व ई-बुक्स', iconName: 'Book', priorityIndia: false, sampleQueries: ['book apps', 'kindle', 'audiobooks'] },
  { id: 'communities', name: 'Communities', hindiName: 'कम्युनिटीज', iconName: 'Users', priorityIndia: false, sampleQueries: ['community apps', 'reddit', 'discord'] },
  { id: 'b2b', name: 'B2B', hindiName: 'बी2बी व्यापार', iconName: 'Package', priorityIndia: true, sampleQueries: ['b2b apps', 'indiamart', 'udaan', 'tradeindia'] },
  { id: 'local_services', name: 'Local Services', hindiName: 'लोकल सर्विसेज', iconName: 'Wrench', priorityIndia: true, sampleQueries: ['local services', 'urban company', 'house cleaning'] }
];

export class IndiaPrioritizer {
  /**
   * Detects if the user query is asking for a category or generic app discovery,
   * e.g., "best video editing apps", "upi apps", "indian shopping apps", "food delivery apps"
   */
  public static detectCategoryIntent(query: string): AppCategoryItem | null {
    const q = query.toLowerCase().trim();

    for (const cat of ALL_APP_CATEGORIES) {
      if (q === cat.name.toLowerCase() || q === `${cat.name.toLowerCase()} apps` || q === `best ${cat.name.toLowerCase()} apps`) {
        return cat;
      }
      if (cat.sampleQueries.some(sq => q.includes(sq) || sq.includes(q))) {
        return cat;
      }
    }

    // Keyword heuristics
    if (q.includes('video edit') || q.includes('video maker')) return ALL_APP_CATEGORIES.find(c => c.id === 'video_editing')!;
    if (q.includes('photo edit') || q.includes('image edit') || q.includes('filter app')) return ALL_APP_CATEGORIES.find(c => c.id === 'photo_editing')!;
    if (q.includes('upi') || q.includes('paytm') || q.includes('phonepe') || q.includes('gpay')) return ALL_APP_CATEGORIES.find(c => c.id === 'upi')!;
    if (q.includes('food') || q.includes('khana') || q.includes('zomato') || q.includes('swiggy')) return ALL_APP_CATEGORIES.find(c => c.id === 'food_delivery')!;
    if (q.includes('grocery') || q.includes('kirana') || q.includes('blinkit') || q.includes('zepto')) return ALL_APP_CATEGORIES.find(c => c.id === 'grocery')!;
    if (q.includes('shopping') || q.includes('buy online') || q.includes('flipkart') || q.includes('meesho')) return ALL_APP_CATEGORIES.find(c => c.id === 'shopping')!;
    if (q.includes('train') || q.includes('railway') || q.includes('irctc') || q.includes('ticket')) return ALL_APP_CATEGORIES.find(c => c.id === 'travel')!;
    if (q.includes('cab') || q.includes('taxi') || q.includes('ola') || q.includes('rapido')) return ALL_APP_CATEGORIES.find(c => c.id === 'cab')!;
    if (q.includes('govt') || q.includes('government') || q.includes('digilocker') || q.includes('sarkari')) return ALL_APP_CATEGORIES.find(c => c.id === 'govt_services')!;
    if (q.includes('ai app') || q.includes('artificial intelligence') || q.includes('gpt')) return ALL_APP_CATEGORIES.find(c => c.id === 'ai')!;
    if (q.includes('stock') || q.includes('share market') || q.includes('mutual fund') || q.includes('zerodha')) return ALL_APP_CATEGORIES.find(c => c.id === 'finance')!;
    if (q.includes('job') || q.includes('naukri') || q.includes('vacancy')) return ALL_APP_CATEGORIES.find(c => c.id === 'jobs')!;
    if (q.includes('music') || q.includes('song') || q.includes('gaana')) return ALL_APP_CATEGORIES.find(c => c.id === 'music')!;
    if (q.includes('ott') || q.includes('movie') || q.includes('cinema') || q.includes('hotstar')) return ALL_APP_CATEGORIES.find(c => c.id === 'ott')!;

    return null;
  }

  /**
   * Evaluates if query has high Indian affinity
   */
  public static isIndiaFocusedQuery(query: string): boolean {
    const q = query.toLowerCase();
    const indianKeywords = [
      'india', 'indian', 'bharat', 'upi', 'irctc', 'swiggy', 'zomato', 'blinkit', 'zepto',
      'flipkart', 'meesho', 'myntra', 'phonepe', 'paytm', 'bhim', 'jiocinema', 'hotstar',
      'ola', 'rapido', 'digilocker', 'umang', 'parivahan', 'zerodha', 'groww', 'upstox',
      'policybazaar', 'khatabook', 'inshorts', 'cricbuzz', 'naukri', 'byjus', 'unacademy',
      'indiamart', 'urban company'
    ];
    return indianKeywords.some(kw => q.includes(kw));
  }
}
