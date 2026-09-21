export interface BhojpuriActor {
  id: string;
  name: string;
  titleName: string;
  aliases: string[];
  role: string;
  bio: string;
  topSongs: { title: string; movie?: string; label: string; year: string; youtubeUrl: string; thumbnail: string }[];
  topMovies: { title: string; coStars: string; year: string; imdbUrl: string; poster: string }[];
  photos: { title: string; url: string; caption: string }[];
  latestNews: { title: string; source: string; time: string; summary: string; url: string }[];
}

export const BHOJPURI_ACTORS: BhojpuriActor[] = [
  {
    id: "pawan-singh",
    name: "Pawan Singh",
    titleName: "Power Star Pawan Singh",
    aliases: ["pawan", "pawan singh", "power star", "pawan singh song", "pawan singh movie", "pawan singh photo"],
    role: "Superstar Actor, Playback Singer & Musician",
    bio: "Pawan Singh is a leading Indian playback singer, actor, and music composer in Bhojpuri cinema, celebrated as 'Power Star'. Famous for international hit 'Lollipop Lagelu' and blockbuster movies like Pratigya and Crack Fighter.",
    topSongs: [
      { title: "Lollipop Lagelu (Original Hit)", label: "Wave Music", year: "2008", youtubeUrl: "https://www.youtube.com/watch?v=0I647GU3Jsc", thumbnail: "https://i.ytimg.com/vi/0I647GU3Jsc/hqdefault.jpg" },
      { title: "Pudina Ae Haseena (Blockbuster Single)", label: "Wave Music", year: "2021", youtubeUrl: "https://www.youtube.com/watch?v=3R-33fUpU0k", thumbnail: "https://i.ytimg.com/vi/3R-33fUpU0k/hqdefault.jpg" },
      { title: "Hari Hari Odhani", label: "Global Music Junction", year: "2022", youtubeUrl: "https://www.youtube.com/watch?v=qE41eS4I5kM", thumbnail: "https://i.ytimg.com/vi/qE41eS4I5kM/hqdefault.jpg" },
      { title: "Kamariya Toriya", movie: "Crack Fighter", label: "Wave Music", year: "2019", youtubeUrl: "https://www.youtube.com/watch?v=P1E4_xM8RkM", thumbnail: "https://i.ytimg.com/vi/P1E4_xM8RkM/hqdefault.jpg" },
      { title: "Lagal Baate Aag", movie: "Pratigya", label: "Worldwide Records Bhojpuri", year: "2008", youtubeUrl: "https://www.youtube.com/watch?v=9S_v5N7W1K0", thumbnail: "https://i.ytimg.com/vi/9S_v5N7W1K0/hqdefault.jpg" }
    ],
    topMovies: [
      { title: "Pratigya", coStars: "Dinesh Lal Yadav, Monalisa", year: "2008", imdbUrl: "https://www.imdb.com/find?q=Pratigya+Pawan+Singh", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { title: "Crack Fighter", coStars: "Sanchita Banerjee, Nidhi Jha", year: "2019", imdbUrl: "https://www.imdb.com/find?q=Crack+Fighter+Pawan+Singh", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80" },
      { title: "Devra Bada Satawela", coStars: "Ravi Kishan, Khesari Lal Yadav", year: "2010", imdbUrl: "https://www.imdb.com/find?q=Devra+Bada+Satawela", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80" },
      { title: "Pawan Raja", coStars: "Akshara Singh, Monalisa", year: "2017", imdbUrl: "https://www.imdb.com/find?q=Pawan+Raja", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80" },
      { title: "Mera Bharat Mahan", coStars: "Ravi Kishan, Garima Parihar", year: "2022", imdbUrl: "https://www.imdb.com/find?q=Mera+Bharat+Mahan+Pawan+Singh", poster: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80" }
    ],
    photos: [
      { title: "Power Star Pawan Singh HD Stage Performance", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80", caption: "Pawan Singh performing live in concert" },
      { title: "Pawan Singh Movie Still - Action Sequence", url: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1200&q=80", caption: "Official movie poster photoshoot" },
      { title: "Pawan Singh Portrait HD Wallpaper", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80", caption: "HD Studio Portrait of Pawan Singh" }
    ],
    latestNews: [
      { title: "Pawan Singh's New Single Crosses 50 Million Views on YouTube", source: "Bhojpuri Cinema News", time: "2 hours ago", summary: "Power Star Pawan Singh's latest music video trends #1 on YouTube India.", url: "https://news.google.com/search?q=Pawan+Singh" },
      { title: "Pawan Singh Announces Next High-Octane Action Film", source: "Times of India Filmfare", time: "1 day ago", summary: "Production begins for Pawan Singh's upcoming mega budget film.", url: "https://news.google.com/search?q=Pawan+Singh+movie" }
    ]
  },

  {
    id: "khesari-lal-yadav",
    name: "Khesari Lal Yadav",
    titleName: "Trendsetter Khesari Lal Yadav",
    aliases: ["khesari", "khesari lal", "khesari lal yadav", "khesari song", "khesari movie", "khesari photo"],
    role: "Megastar Actor, Playback Singer & Dancer",
    bio: "Khesari Lal Yadav is one of the biggest superstars in Bhojpuri cinema. Awarded Best Actor for Sangharsh, he has delivered hundreds of superhit songs like 'Thik Hai' and 'Nathuniya'.",
    topSongs: [
      { title: "Thik Hai (Superhit Anthem)", label: "Speed Records Bhojpuri", year: "2018", youtubeUrl: "https://www.youtube.com/watch?v=RIn2A70fEHQ", thumbnail: "https://i.ytimg.com/vi/RIn2A70fEHQ/hqdefault.jpg" },
      { title: "Nathuniya", label: "Saregama Hum Bhojpuri", year: "2022", youtubeUrl: "https://www.youtube.com/watch?v=2v-p5v8f2c0", thumbnail: "https://i.ytimg.com/vi/2v-p5v8f2c0/hqdefault.jpg" },
      { title: "Saiya Ke Roti", label: "Wave Music", year: "2020", youtubeUrl: "https://www.youtube.com/watch?v=i9Yf6rGfU2A", thumbnail: "https://i.ytimg.com/vi/i9Yf6rGfU2A/hqdefault.jpg" },
      { title: "Lal Ghaghra (Duet with Shilpi Raj)", label: "Saregama Hum Bhojpuri", year: "2022", youtubeUrl: "https://www.youtube.com/watch?v=kYJ7w4f50lI", thumbnail: "https://i.ytimg.com/vi/kYJ7w4f50lI/hqdefault.jpg" }
    ],
    topMovies: [
      { title: "Sangharsh 1 & 2", coStars: "Kajal Raghwani, Megha Shree", year: "2018-2023", imdbUrl: "https://www.imdb.com/find?q=Sangharsh+Khesari+Lal", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80" },
      { title: "Saajan Chale Sasural", coStars: "Smriti Sinha", year: "2011", imdbUrl: "https://www.imdb.com/find?q=Saajan+Chale+Sasural+Khesari", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { title: "Mehandi Laga Ke Rakhna", coStars: "Kajal Raghwani", year: "2017", imdbUrl: "https://www.imdb.com/find?q=Mehandi+Laga+Ke+Rakhna", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80" },
      { title: "Coolie No. 1", coStars: "Kajal Raghwani", year: "2019", imdbUrl: "https://www.imdb.com/find?q=Coolie+No+1+Khesari", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=80" }
    ],
    photos: [
      { title: "Khesari Lal Yadav HD Concert & Dance Still", url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80", caption: "Khesari Lal Yadav live stage performance" },
      { title: "Khesari Lal Yadav Movie Poster HD", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&q=80", caption: "Official promotional poster" }
    ],
    latestNews: [
      { title: "Khesari Lal Yadav's Sangharsh 2 Sets New Box Office Record", source: "Bhojpuri Express", time: "3 hours ago", summary: "High praise for Khesari's action sequence and emotional performance.", url: "https://news.google.com/search?q=Khesari+Lal+Yadav" }
    ]
  },

  {
    id: "dinesh-lal-yadav-nirahua",
    name: "Dinesh Lal Yadav (Nirahua)",
    titleName: "Jubilee Star Nirahua",
    aliases: ["nirahua", "dinesh lal yadav", "dinesh lal", "nirahua song", "nirahua movie", "nirahua photo"],
    role: "Megastar Actor, Singer, Producer & MP",
    bio: "Dinesh Lal Yadav, popularly known as 'Nirahua', is a legendary Bhojpuri film actor, singer, and television presenter with over 50 blockbuster movies including Nirahua Hindustani and Border.",
    topSongs: [
      { title: "Nirahua Satawela", label: "Wave Music", year: "2006", youtubeUrl: "https://www.youtube.com/results?search_query=Nirahua+Satawela", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" },
      { title: "Katore Katore", movie: "Nirahua Hindustani", label: "Nirahua Music World", year: "2014", youtubeUrl: "https://www.youtube.com/results?search_query=Nirahua+Katore+Katore", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" },
      { title: "Table Par Lavel Mili", movie: "Border", label: "Nirahua Music World", year: "2018", youtubeUrl: "https://www.youtube.com/results?search_query=Table+Par+Lavel+Mili+Nirahua", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80" }
    ],
    topMovies: [
      { title: "Nirahua Hindustani (1, 2 & 3)", coStars: "Amrapali Dubey", year: "2014-2018", imdbUrl: "https://www.imdb.com/find?q=Nirahua+Hindustani", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { title: "Border", coStars: "Amrapali Dubey, Parvesh Lal Yadav", year: "2018", imdbUrl: "https://www.imdb.com/find?q=Border+Bhojpuri+Movie", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80" },
      { title: "Patna Se Pakistan", coStars: "Amrapali Dubey, Kajal Raghwani", year: "2015", imdbUrl: "https://www.imdb.com/find?q=Patna+Se+Pakistan", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80" }
    ],
    photos: [
      { title: "Dinesh Lal Yadav Nirahua HD Photo", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80", caption: "Nirahua Official HD Portrait" }
    ],
    latestNews: [
      { title: "Nirahua's New Patriotic Film Announced for National Release", source: "Cinema Today", time: "5 hours ago", summary: "Jubilee Star Nirahua begins shooting in Lucknow.", url: "https://news.google.com/search?q=Nirahua" }
    ]
  },

  {
    id: "manoj-tiwari",
    name: "Manoj Tiwari",
    titleName: "Manoj Tiwari (Legendary Bhojpuri Singer & Actor)",
    aliases: ["manoj tiwari", "manoj tiwari song", "rinkiya ke papa", "manoj tiwari movie"],
    role: "Pioneer Actor, Singer & Politician",
    bio: "Manoj Tiwari revolutionized modern Bhojpuri music with timeless hits like 'Rinkiya Ke Papa' and 'Jiya Ho Bihar Ke Lala'. His movie 'Sasura Bada Paisawala' was a monumental landmark in Bhojpuri cinema history.",
    topSongs: [
      { title: "Rinkiya Ke Papa (Classic Hit)", label: "T-Series Hamar Bhojpuri", year: "2002", youtubeUrl: "https://www.youtube.com/results?search_query=Manoj+Tiwari+Rinkiya+Ke+Papa", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" },
      { title: "Jiya Ho Bihar Ke Lala", movie: "Gangs of Wasseypur", label: "T-Series", year: "2012", youtubeUrl: "https://www.youtube.com/results?search_query=Jiya+Ho+Bihar+Ke+Lala", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" },
      { title: "International Litti Chokha", label: "Wave Music", year: "2005", youtubeUrl: "https://www.youtube.com/results?search_query=Manoj+Tiwari+Litti+Chokha", thumbnail: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80" }
    ],
    topMovies: [
      { title: "Sasura Bada Paisawala", coStars: "Rani Chatterjee", year: "2004", imdbUrl: "https://www.imdb.com/find?q=Sasura+Bada+Paisawala", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { title: "Daroga Babu I Love You", coStars: "Rinku Ghosh", year: "2004", imdbUrl: "https://www.imdb.com/find?q=Daroga+Babu+I+Love+You", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80" }
    ],
    photos: [
      { title: "Manoj Tiwari Official HD Portrait", url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=1200&q=80", caption: "Manoj Tiwari studio photo" }
    ],
    latestNews: [
      { title: "Manoj Tiwari Celebrates 20 Years of Historic Blockbuster 'Sasura Bada Paisawala'", source: "National Media", time: "1 day ago", summary: "Tribute to the movie that revived modern Bhojpuri cinema.", url: "https://news.google.com/search?q=Manoj+Tiwari" }
    ]
  },

  {
    id: "ravi-kishan",
    name: "Ravi Kishan",
    titleName: "Ravi Kishan (Bhojpuri Megastar)",
    aliases: ["ravi kishan", "ravi kishan movie", "ravi kishan song", "ravi kishan photo"],
    role: "Megastar Actor, TV Host & MP",
    bio: "Ravi Kishan is an iconic Indian actor who has starred in over 300 Bhojpuri, Hindi, Tamil, and Telugu films. He hosted the famous show 'Ke Banal Ba Crorepati' and starred in blockbuster movies like Pandit Ji Batai Na Biyah Kab Hoi.",
    topSongs: [
      { title: "Pandit Ji Batai Na Biyah Kab Hoi", label: "T-Series Hamar Bhojpuri", year: "2005", youtubeUrl: "https://www.youtube.com/results?search_query=Pandit+Ji+Batai+Na+Biyah+Kab+Hoi", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" },
      { title: "Kattakata (Title Track)", label: "Wave Music", year: "2012", youtubeUrl: "https://www.youtube.com/results?search_query=Ravi+Kishan+Kattakata", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" }
    ],
    topMovies: [
      { title: "Pandit Ji Batai Na Biyah Kab Hoi", coStars: "Nagma", year: "2005", imdbUrl: "https://www.imdb.com/find?q=Pandit+Ji+Batai+Na+Biyah+Kab+Hoi", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { title: "Devra Bada Satawela", coStars: "Pawan Singh, Khesari Lal Yadav", year: "2010", imdbUrl: "https://www.imdb.com/find?q=Devra+Bada+Satawela", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80" }
    ],
    photos: [
      { title: "Ravi Kishan HD Studio Photo", url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=1200&q=80", caption: "Ravi Kishan HD Portrait" }
    ],
    latestNews: [
      { title: "Ravi Kishan Honored for Lifetime Contribution to Regional Cinema", source: "Indian Express", time: "2 days ago", summary: "Renowned actor Ravi Kishan speaks on expanding Bhojpuri cinema globally.", url: "https://news.google.com/search?q=Ravi+Kishan" }
    ]
  },

  {
    id: "akshara-singh",
    name: "Akshara Singh",
    titleName: "Akshara Singh (Bhojpuri Superstar Actress & Singer)",
    aliases: ["akshara", "akshara singh", "akshara singh song", "akshara singh movie", "akshara singh photo"],
    role: "Superstar Actress, Playback Singer & Performer",
    bio: "Akshara Singh is one of the highest-paid actresses in Bhojpuri cinema, famous for her commanding screen presence, versatile singing, and viral music tracks like 'Don't Touch My Hand'.",
    topSongs: [
      { title: "Don't Touch My Hand", label: "Akshara Singh Official", year: "2020", youtubeUrl: "https://www.youtube.com/results?search_query=Akshara+Singh+Dont+Touch+My+Hand", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" },
      { title: "Chhoti e Aashiqui", label: "Wave Music", year: "2021", youtubeUrl: "https://www.youtube.com/results?search_query=Akshara+Singh+Chhoti+e+Aashiqui", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" }
    ],
    topMovies: [
      { title: "Satya", coStars: "Pawan Singh", year: "2017", imdbUrl: "https://www.imdb.com/find?q=Satya+Bhojpuri", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { title: "Pawan Raja", coStars: "Pawan Singh, Monalisa", year: "2017", imdbUrl: "https://www.imdb.com/find?q=Pawan+Raja", poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=600&q=80" }
    ],
    photos: [
      { title: "Akshara Singh HD Photoshoot", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80", caption: "Akshara Singh HD Portrait" }
    ],
    latestNews: [
      { title: "Akshara Singh Releases Trending New Single", source: "Glamour Times", time: "4 hours ago", summary: "Akshara Singh's new track receives instant acclaim across social media platforms.", url: "https://news.google.com/search?q=Akshara+Singh" }
    ]
  },

  {
    id: "amrapali-dubey",
    name: "Amrapali Dubey",
    titleName: "Amrapali Dubey (Queen of Bhojpuri Cinema)",
    aliases: ["amrapali", "amrapali dubey", "amrapali dubey song", "amrapali dubey movie", "amrapali dubey photo"],
    role: "Leading Actress, Performer & Dancer",
    bio: "Amrapali Dubey made her blockbuster debut in 'Nirahua Hindustani' and quickly established herself as the top reigning actress in Bhojpuri cinema with dozens of superhit films.",
    topSongs: [
      { title: "Katore Katore", movie: "Nirahua Hindustani", label: "Nirahua Music World", year: "2014", youtubeUrl: "https://www.youtube.com/results?search_query=Katore+Katore+Amrapali+Dubey", thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=600&q=80" },
      { title: "Laga Ke Fair Lovely", movie: "Bam Bam Bol Raha Hai Kashi", label: "Worldwide Records", year: "2016", youtubeUrl: "https://www.youtube.com/results?search_query=Laga+Ke+Fair+Lovely+Amrapali", thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=600&q=80" }
    ],
    topMovies: [
      { title: "Nirahua Hindustani", coStars: "Dinesh Lal Yadav Nirahua", year: "2014", imdbUrl: "https://www.imdb.com/find?q=Nirahua+Hindustani", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80" },
      { title: "Patna Se Pakistan", coStars: "Dinesh Lal Yadav Nirahua", year: "2015", imdbUrl: "https://www.imdb.com/find?q=Patna+Se+Pakistan", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80" }
    ],
    photos: [
      { title: "Amrapali Dubey HD Wallpaper Photo", url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&q=80", caption: "Amrapali Dubey HD Movie Still" }
    ],
    latestNews: [
      { title: "Amrapali Dubey Stars in Upcoming Multi-Starrer Family Drama", source: "Bhojpuri Box Office", time: "6 hours ago", summary: "Amrapali Dubey completes shooting in Varanasi.", url: "https://news.google.com/search?q=Amrapali+Dubey" }
    ]
  }
];

export function findBhojpuriActor(query: string): BhojpuriActor | null {
  const q = query.toLowerCase().trim();
  if (!q) return null;

  for (const actor of BHOJPURI_ACTORS) {
    if (
      q.includes(actor.name.toLowerCase()) ||
      actor.aliases.some(alias => q.includes(alias)) ||
      actor.topSongs.some(s => q.includes(s.title.toLowerCase())) ||
      actor.topMovies.some(m => q.includes(m.title.toLowerCase()))
    ) {
      return actor;
    }
  }

  if (q.includes("bhojpuri") || q.includes("bhojpuri actor") || q.includes("bhojpuri song") || q.includes("bhojpuri movie")) {
    return BHOJPURI_ACTORS[0]; // Default to Pawan Singh / General Bhojpuri Star
  }

  return null;
}

export function isBhojpuriQuery(query: string): boolean {
  const q = query.toLowerCase();
  const keywords = [
    "bhojpuri", "pawan singh", "khesari", "nirahua", "manoj tiwari", "ravi kishan",
    "akshara", "amrapali", "kajal raghwani", "monalisa", "shilpi raj", "pramod premi",
    "samar singh", "chintu pandey", "gunjan singh", "yash kumar", "lollipop lagelu",
    "thik hai", "pudina ae haseena", "nathuniya", "rinkiya ke papa"
  ];
  return keywords.some(kw => q.includes(kw));
}
