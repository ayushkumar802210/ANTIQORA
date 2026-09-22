export interface RegionalSongItem {
  id: string;
  title: string;
  artist: string;
  channel: string;
  channelHandle: string;
  genre: 'Bhojpuri' | 'Punjabi' | 'Haryanvi' | 'Gujarati' | 'Hindi' | 'Remix';
  duration: string;
  youtubeId: string;
  youtubeUrl: string;
  embedUrl: string;
  thumbnail: string;
  description: string;
  year?: string;
  views?: string;
  officialSite?: string;
}

export interface RegionalChannel {
  id: string;
  name: string;
  handle: string;
  genre: 'Bhojpuri' | 'Punjabi' | 'Haryanvi' | 'Gujarati' | 'Hindi' | 'Remix';
  subscribers: string;
  videosCount: string;
  officialWebsite: string;
  youtubeUrl: string;
  bannerImage: string;
  avatarImage: string;
  description: string;
  aliases: string[];
  topSongs: RegionalSongItem[];
}

export const REGIONAL_CHANNELS: RegionalChannel[] = [
  {
    id: "worldwide-records-bhojpuri",
    name: "Worldwide Records Bhojpuri",
    handle: "@WorldwideRecordsBhojpuri",
    genre: "Bhojpuri",
    subscribers: "14.8M Subscribers",
    videosCount: "4,200+ Videos",
    officialWebsite: "http://wwrindia.com/home_controller",
    youtubeUrl: "https://www.youtube.com/@WorldwideRecordsBhojpuri",
    bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    avatarImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    description: "Official YouTube Channel of Worldwide Records Bhojpuri - No. 1 Music & Cinema Destination for Bhojpuri Superhit Songs, Pawan Singh, Khesari Lal, Shilpi Raj, and Blockbuster Movies.",
    aliases: [
      "@worldwiderecordsbhojpuri",
      "worldwiderecordsbhojpuri",
      "worldwide records bhojpuri",
      "wwr bhojpuri",
      "wwrindia bhojpuri",
      "worldwide bhojpuri",
      "worldwide records bhojpuri song",
      "worldwide records bhojpuri movie"
    ],
    topSongs: [
      {
        id: "wwr-bhoj-1",
        title: "Lollipop Lagelu (Original Power Hit)",
        artist: "Pawan Singh",
        channel: "Worldwide Records Bhojpuri",
        channelHandle: "@WorldwideRecordsBhojpuri",
        genre: "Bhojpuri",
        duration: "04:15",
        youtubeId: "0I647GU3Jsc",
        youtubeUrl: "https://www.youtube.com/watch?v=0I647GU3Jsc",
        embedUrl: "https://www.youtube-nocookie.com/embed/0I647GU3Jsc?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/0I647GU3Jsc/hqdefault.jpg",
        description: "Watch the globally acclaimed superhit Bhojpuri anthem 'Lollipop Lagelu' sung by Power Star Pawan Singh on Worldwide Records Bhojpuri.",
        year: "2008",
        views: "180M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-bhoj-2",
        title: "Pudina Ae Haseena (Blockbuster Single)",
        artist: "Pawan Singh, Anupama Yadav",
        channel: "Worldwide Records Bhojpuri",
        channelHandle: "@WorldwideRecordsBhojpuri",
        genre: "Bhojpuri",
        duration: "03:52",
        youtubeId: "3R-33fUpU0k",
        youtubeUrl: "https://www.youtube.com/watch?v=3R-33fUpU0k",
        embedUrl: "https://www.youtube-nocookie.com/embed/3R-33fUpU0k?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/3R-33fUpU0k/hqdefault.jpg",
        description: "Official Video for the viral track 'Pudina Ae Haseena' starring Pawan Singh. Stream full song in 1080p Ultra HD.",
        year: "2021",
        views: "450M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-bhoj-3",
        title: "Hari Hari Odhani (Trending Superhit)",
        artist: "Pawan Singh, Anupama Yadav",
        channel: "Worldwide Records Bhojpuri",
        channelHandle: "@WorldwideRecordsBhojpuri",
        genre: "Bhojpuri",
        duration: "03:40",
        youtubeId: "qE41eS4I5kM",
        youtubeUrl: "https://www.youtube.com/watch?v=qE41eS4I5kM",
        embedUrl: "https://www.youtube-nocookie.com/embed/qE41eS4I5kM?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/qE41eS4I5kM/hqdefault.jpg",
        description: "Trending number 1 worldwide, 'Hari Hari Odhani' by Pawan Singh. High definition audio and video stream.",
        year: "2022",
        views: "320M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-bhoj-4",
        title: "Nathuniya (Trendsetter Khesari Hit)",
        artist: "Khesari Lal Yadav, Priyanka Singh",
        channel: "Worldwide Records Bhojpuri",
        channelHandle: "@WorldwideRecordsBhojpuri",
        genre: "Bhojpuri",
        duration: "03:35",
        youtubeId: "8YQ7gP0N3vA",
        youtubeUrl: "https://www.youtube.com/watch?v=8YQ7gP0N3vA",
        embedUrl: "https://www.youtube-nocookie.com/embed/8YQ7gP0N3vA?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/8YQ7gP0N3vA/hqdefault.jpg",
        description: "Khesari Lal Yadav & Arshiya Arshi in blockbuster superhit video 'Nathuniya'.",
        year: "2022",
        views: "290M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-bhoj-5",
        title: "Dhibari Me Rahue Na Tel",
        artist: "Pawan Singh, Shilpi Raj",
        channel: "Worldwide Records Bhojpuri",
        channelHandle: "@WorldwideRecordsBhojpuri",
        genre: "Bhojpuri",
        duration: "04:02",
        youtubeId: "kXm8a_1_g4Y",
        youtubeUrl: "https://www.youtube.com/watch?v=kXm8a_1_g4Y",
        embedUrl: "https://www.youtube-nocookie.com/embed/kXm8a_1_g4Y?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/kXm8a_1_g4Y/hqdefault.jpg",
        description: "Pawan Singh & Shilpi Raj superhit duet 'Dhibari Me Rahue Na Tel' on Worldwide Records Bhojpuri.",
        year: "2023",
        views: "150M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-bhoj-6",
        title: "Raja Ji Khoon Kaida",
        artist: "Shilpi Raj, Khesari Lal Yadav",
        channel: "Worldwide Records Bhojpuri",
        channelHandle: "@WorldwideRecordsBhojpuri",
        genre: "Bhojpuri",
        duration: "03:28",
        youtubeId: "uLq1kH6i0XQ",
        youtubeUrl: "https://www.youtube.com/watch?v=uLq1kH6i0XQ",
        embedUrl: "https://www.youtube-nocookie.com/embed/uLq1kH6i0XQ?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/uLq1kH6i0XQ/hqdefault.jpg",
        description: "Shilpi Raj blockbuster energetic dance track 'Raja Ji Khoon Kaida'.",
        year: "2023",
        views: "110M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      }
    ]
  },

  {
    id: "bhojpuri-my-remix",
    name: "Bhojpuri My ReMix",
    handle: "@BhojpuriMyReMix",
    genre: "Remix",
    subscribers: "3.2M Subscribers",
    videosCount: "1,500+ DJ Mixes",
    officialWebsite: "http://wwrindia.com/home_controller",
    youtubeUrl: "https://www.youtube.com/@BhojpuriMyReMix",
    bannerImage: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80",
    avatarImage: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=400&q=80",
    description: "Official Channel for Bhojpuri My ReMix - Premium High Bass Bhojpuri DJ Remixes, Electro Party Mashups, Hard Dholki Mixes, and Nonstop Club Tracks.",
    aliases: [
      "@bhojpurimyremix",
      "bhojpurimyremix",
      "bhojpuri my remix",
      "bhojpuri remix",
      "bhojpuri dj mix",
      "bhojpuri dj remix",
      "bhojpuri dj song",
      "bhojpuri mashup",
      "bhojpuri bass remix"
    ],
    topSongs: [
      {
        id: "bmr-1",
        title: "Nonstop Bhojpuri DJ Remix Mashup 2026 (Hard Bass Mix)",
        artist: "Bhojpuri My ReMix / DJ Club",
        channel: "Bhojpuri My ReMix",
        channelHandle: "@BhojpuriMyReMix",
        genre: "Remix",
        duration: "18:45",
        youtubeId: "3R-33fUpU0k",
        youtubeUrl: "https://www.youtube.com/watch?v=3R-33fUpU0k",
        embedUrl: "https://www.youtube-nocookie.com/embed/3R-33fUpU0k?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/3R-33fUpU0k/hqdefault.jpg",
        description: "Full Nonstop Bhojpuri DJ Dance Mashup 2026. High Bass Club Mix featuring Pawan Singh, Khesari Lal, and Shilpi Raj.",
        year: "2026",
        views: "85M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "bmr-2",
        title: "Pawan Singh Superhit DJ Electro Bass Remix",
        artist: "Bhojpuri My ReMix",
        channel: "Bhojpuri My ReMix",
        channelHandle: "@BhojpuriMyReMix",
        genre: "Remix",
        duration: "04:30",
        youtubeId: "0I647GU3Jsc",
        youtubeUrl: "https://www.youtube.com/watch?v=0I647GU3Jsc",
        embedUrl: "https://www.youtube-nocookie.com/embed/0I647GU3Jsc?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/0I647GU3Jsc/hqdefault.jpg",
        description: "Official Electro Bass Remix by Bhojpuri My ReMix. High fidelity 320kbps audio & HD video visuals.",
        year: "2025",
        views: "42M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "bmr-3",
        title: "Khesari Lal Yadav Dance Dhamaka DJ Mix",
        artist: "Bhojpuri My ReMix / DJ Beats",
        channel: "Bhojpuri My ReMix",
        channelHandle: "@BhojpuriMyReMix",
        genre: "Remix",
        duration: "05:10",
        youtubeId: "5jE-V3aB9lY",
        youtubeUrl: "https://www.youtube.com/watch?v=5jE-V3aB9lY",
        embedUrl: "https://www.youtube-nocookie.com/embed/5jE-V3aB9lY?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/5jE-V3aB9lY/hqdefault.jpg",
        description: "Party Dance Floor DJ Remix of top Khesari Lal tracks by Bhojpuri My ReMix.",
        year: "2025",
        views: "38M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "bmr-4",
        title: "Shilpi Raj Trending Viral DJ Remix Dhamaka",
        artist: "Bhojpuri My ReMix",
        channel: "Bhojpuri My ReMix",
        channelHandle: "@BhojpuriMyReMix",
        genre: "Remix",
        duration: "04:15",
        youtubeId: "8YQ7gP0N3vA",
        youtubeUrl: "https://www.youtube.com/watch?v=8YQ7gP0N3vA",
        embedUrl: "https://www.youtube-nocookie.com/embed/8YQ7gP0N3vA?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/8YQ7gP0N3vA/hqdefault.jpg",
        description: "Viral Dholki Bass remix of Shilpi Raj chartbusters.",
        year: "2025",
        views: "29M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      }
    ]
  },

  {
    id: "worldwide-records-punjabi",
    name: "Worldwide Records Punjabi",
    handle: "@WorldwideRecordsPUNJABI",
    genre: "Punjabi",
    subscribers: "5.6M Subscribers",
    videosCount: "2,100+ Punjabi Hits",
    officialWebsite: "http://wwrindia.com/home_controller",
    youtubeUrl: "https://www.youtube.com/@WorldwideRecordsPUNJABI",
    bannerImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    avatarImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
    description: "Official Channel for Worldwide Records Punjabi. Stream latest Punjabi Songs, Punjabi Bhangra Beats, Desi Hip Hop, Punjabi Music Videos, and Wedding Mashups.",
    aliases: [
      "@worldwiderecordspunjabi",
      "worldwiderecordspunjabi",
      "worldwide records punjabi",
      "wwr punjabi",
      "worldwide punjabi",
      "punjabi song",
      "punjabi songs",
      "punjabi bhangra",
      "punjabi music video",
      "punjabi hit songs"
    ],
    topSongs: [
      {
        id: "wwr-punj-1",
        title: "High Rated Gabru & Punjabi Bhangra Beats",
        artist: "Worldwide Records Punjabi",
        channel: "Worldwide Records Punjabi",
        channelHandle: "@WorldwideRecordsPUNJABI",
        genre: "Punjabi",
        duration: "03:45",
        youtubeId: "dZ0fwJojhrs",
        youtubeUrl: "https://www.youtube.com/watch?v=dZ0fwJojhrs",
        embedUrl: "https://www.youtube-nocookie.com/embed/dZ0fwJojhrs?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/dZ0fwJojhrs/hqdefault.jpg",
        description: "Official Punjabi Bhangra Anthem on Worldwide Records Punjabi. High-energy beats & authentic Punjabi lyrics.",
        year: "2024",
        views: "95M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-punj-2",
        title: "Desi Jatt Swagger Punjabi Video Song",
        artist: "WWR Punjabi Stars",
        channel: "Worldwide Records Punjabi",
        channelHandle: "@WorldwideRecordsPUNJABI",
        genre: "Punjabi",
        duration: "04:10",
        youtubeId: "1o30Ps-_8is",
        youtubeUrl: "https://www.youtube.com/watch?v=1o30Ps-_8is",
        embedUrl: "https://www.youtube-nocookie.com/embed/1o30Ps-_8is?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/1o30Ps-_8is/hqdefault.jpg",
        description: "Latest Punjabi single released exclusively on Worldwide Records Punjabi channel.",
        year: "2024",
        views: "62M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-punj-3",
        title: "Sidhu Tribute Nonstop Punjabi Beats",
        artist: "Worldwide Records Punjabi",
        channel: "Worldwide Records Punjabi",
        channelHandle: "@WorldwideRecordsPUNJABI",
        genre: "Punjabi",
        duration: "12:30",
        youtubeId: "sa0RUmGTCYY",
        youtubeUrl: "https://www.youtube.com/watch?v=sa0RUmGTCYY",
        embedUrl: "https://www.youtube-nocookie.com/embed/sa0RUmGTCYY?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/sa0RUmGTCYY/hqdefault.jpg",
        description: "Nonstop tribute and powerful Punjabi folk & urban fusion playlist.",
        year: "2023",
        views: "44M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-punj-4",
        title: "Gaddi Kaali Punjabi Hit Single",
        artist: "WWR Punjabi",
        channel: "Worldwide Records Punjabi",
        channelHandle: "@WorldwideRecordsPUNJABI",
        genre: "Punjabi",
        duration: "03:20",
        youtubeId: "0pdqf4P9MB8",
        youtubeUrl: "https://www.youtube.com/watch?v=0pdqf4P9MB8",
        embedUrl: "https://www.youtube-nocookie.com/embed/0pdqf4P9MB8?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/0pdqf4P9MB8/hqdefault.jpg",
        description: "Official Music Video in 4K resolution on Worldwide Records Punjabi.",
        year: "2024",
        views: "31M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      }
    ]
  },

  {
    id: "worldwide-records-haryanvi",
    name: "Worldwide Records Haryanvi",
    handle: "@WorldwideRecordsHaryanvi",
    genre: "Haryanvi",
    subscribers: "4.8M Subscribers",
    videosCount: "1,850+ Haryanvi Tracks",
    officialWebsite: "http://wwrindia.com/home_controller",
    youtubeUrl: "https://www.youtube.com/@WorldwideRecordsHaryanvi",
    bannerImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
    avatarImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
    description: "Official Channel for Worldwide Records Haryanvi - Home to Best Haryanvi Songs, Desi Ragni, Danka, Sapna Choudhary Stage Hits, and Haryanvi Dance Videos.",
    aliases: [
      "@worldwiderecordsharyanvi",
      "worldwiderecordsharyanvi",
      "worldwide records haryanvi",
      "wwr haryanvi",
      "worldwide haryanvi",
      "haryanvi song",
      "haryanvi songs",
      "haryanvi ragni",
      "haryanvi danka",
      "haryanvi dance"
    ],
    topSongs: [
      {
        id: "wwr-har-1",
        title: "52 Gaj Ka Daman (Haryanvi Folk Blockbuster)",
        artist: "Renuka Panwar / WWR Haryanvi",
        channel: "Worldwide Records Haryanvi",
        channelHandle: "@WorldwideRecordsHaryanvi",
        genre: "Haryanvi",
        duration: "03:15",
        youtubeId: "CZt-rVn2BJs",
        youtubeUrl: "https://www.youtube.com/watch?v=CZt-rVn2BJs",
        embedUrl: "https://www.youtube-nocookie.com/embed/CZt-rVn2BJs?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/CZt-rVn2BJs/hqdefault.jpg",
        description: "The historic all-time blockbuster Haryanvi folk anthem '52 Gaj Ka Daman' on Worldwide Records Haryanvi.",
        year: "2020",
        views: "1.4B+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-har-2",
        title: "Dada Lakhmi Haryanvi Ragni & Danka",
        artist: "Worldwide Records Haryanvi",
        channel: "Worldwide Records Haryanvi",
        channelHandle: "@WorldwideRecordsHaryanvi",
        genre: "Haryanvi",
        duration: "06:40",
        youtubeId: "qE41eS4I5kM",
        youtubeUrl: "https://www.youtube.com/watch?v=qE41eS4I5kM",
        embedUrl: "https://www.youtube-nocookie.com/embed/qE41eS4I5kM?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/qE41eS4I5kM/hqdefault.jpg",
        description: "Traditional Haryanvi Ragni & Cultural Danka performance in pristine audio.",
        year: "2023",
        views: "18M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-har-3",
        title: "Haryanvi Mashup Superhit Dance Video",
        artist: "WWR Haryanvi / Desi Crew",
        channel: "Worldwide Records Haryanvi",
        channelHandle: "@WorldwideRecordsHaryanvi",
        genre: "Haryanvi",
        duration: "05:12",
        youtubeId: "3R-33fUpU0k",
        youtubeUrl: "https://www.youtube.com/watch?v=3R-33fUpU0k",
        embedUrl: "https://www.youtube-nocookie.com/embed/3R-33fUpU0k?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/3R-33fUpU0k/hqdefault.jpg",
        description: "High-voltage Haryanvi party dance mashup featuring top folk instruments and modern beats.",
        year: "2024",
        views: "52M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-har-4",
        title: "Goli Chal Javegi Haryanvi Hit",
        artist: "Worldwide Records Haryanvi",
        channel: "Worldwide Records Haryanvi",
        channelHandle: "@WorldwideRecordsHaryanvi",
        genre: "Haryanvi",
        duration: "03:50",
        youtubeId: "IJq0yyWug1k",
        youtubeUrl: "https://www.youtube.com/watch?v=IJq0yyWug1k",
        embedUrl: "https://www.youtube-nocookie.com/embed/IJq0yyWug1k?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/IJq0yyWug1k/hqdefault.jpg",
        description: "Popular Haryanvi single on Worldwide Records Haryanvi.",
        year: "2023",
        views: "35M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      }
    ]
  },

  {
    id: "worldwide-records-gujarati",
    name: "Worldwide Records Gujarati",
    handle: "@WWRGujarati",
    genre: "Gujarati",
    subscribers: "3.9M Subscribers",
    videosCount: "1,600+ Garba & Songs",
    officialWebsite: "http://wwrindia.com/home_controller",
    youtubeUrl: "https://www.youtube.com/@WWRGujarati",
    bannerImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80",
    avatarImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
    description: "Official Channel for Worldwide Records Gujarati (@WWRGujarati). Stream Nonstop Garba, Dandiya Raas, Gujarati Lagna Geet, Kinjal Dave, Geeta Rabari, and Folk Singles.",
    aliases: [
      "@wwrgujarati",
      "wwrgujarati",
      "@worldwiderecordsgujarati",
      "worldwide records gujarati",
      "wwr gujarati",
      "worldwide gujarati",
      "gujarati song",
      "gujarati songs",
      "gujarati garba",
      "gujarati dandiya",
      "gujarati lagna geet",
      "gujarati music"
    ],
    topSongs: [
      {
        id: "wwr-guj-1",
        title: "Nonstop Garba Raas Superhit Dhol Mix",
        artist: "Worldwide Records Gujarati",
        channel: "Worldwide Records Gujarati",
        channelHandle: "@WWRGujarati",
        genre: "Gujarati",
        duration: "24:15",
        youtubeId: "qE41eS4I5kM",
        youtubeUrl: "https://www.youtube.com/watch?v=qE41eS4I5kM",
        embedUrl: "https://www.youtube-nocookie.com/embed/qE41eS4I5kM?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/qE41eS4I5kM/hqdefault.jpg",
        description: "Official Nonstop Navratri Garba Raas Dhol Beats on Worldwide Records Gujarati (@WWRGujarati).",
        year: "2024",
        views: "72M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-guj-2",
        title: "Char Char Bangdi Vali Gadi (Superhit Folk Single)",
        artist: "Kinjal Dave / WWR Gujarati",
        channel: "Worldwide Records Gujarati",
        channelHandle: "@WWRGujarati",
        genre: "Gujarati",
        duration: "04:20",
        youtubeId: "uLq1kH6i0XQ",
        youtubeUrl: "https://www.youtube.com/watch?v=uLq1kH6i0XQ",
        embedUrl: "https://www.youtube-nocookie.com/embed/uLq1kH6i0XQ?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/uLq1kH6i0XQ/hqdefault.jpg",
        description: "Kinjal Dave's iconic Gujarati song 'Char Char Bangdi Vali Gadi' on Worldwide Records Gujarati.",
        year: "2017",
        views: "120M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-guj-3",
        title: "Tara Vina Shyam Mane Ekladu Lage",
        artist: "Geeta Rabari / WWR Gujarati",
        channel: "Worldwide Records Gujarati",
        channelHandle: "@WWRGujarati",
        genre: "Gujarati",
        duration: "05:45",
        youtubeId: "5jE-V3aB9lY",
        youtubeUrl: "https://www.youtube.com/watch?v=5jE-V3aB9lY",
        embedUrl: "https://www.youtube-nocookie.com/embed/5jE-V3aB9lY?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/5jE-V3aB9lY/hqdefault.jpg",
        description: "Devotional Gujarati Garba by Geeta Rabari on Worldwide Records Gujarati.",
        year: "2023",
        views: "65M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-guj-4",
        title: "Gujarati Lagna Geet & Folk Dhamaka",
        artist: "Worldwide Records Gujarati",
        channel: "Worldwide Records Gujarati",
        channelHandle: "@WWRGujarati",
        genre: "Gujarati",
        duration: "15:30",
        youtubeId: "8YQ7gP0N3vA",
        youtubeUrl: "https://www.youtube.com/watch?v=8YQ7gP0N3vA",
        embedUrl: "https://www.youtube-nocookie.com/embed/8YQ7gP0N3vA?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/8YQ7gP0N3vA/hqdefault.jpg",
        description: "Traditional Gujarati Wedding & Mandap songs collection on @WWRGujarati.",
        year: "2024",
        views: "28M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      }
    ]
  },

  {
    id: "worldwide-records-india",
    name: "Worldwide Records India",
    handle: "@WorldwideRecordsIndia",
    genre: "Hindi",
    subscribers: "8.1M Subscribers",
    videosCount: "3,500+ Releases",
    officialWebsite: "http://wwrindia.com/home_controller",
    youtubeUrl: "https://www.youtube.com/@WorldwideRecordsIndia",
    bannerImage: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    avatarImage: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    description: "Worldwide Records India (wwrindia.com) is a pioneer music record company and entertainment powerhouse established in 1999, managing leading regional music labels.",
    aliases: [
      "@worldwiderecordsindia",
      "worldwiderecordsindia",
      "worldwide records india",
      "worldwide records",
      "wwr india",
      "wwrindia",
      "wwrindia.com",
      "wwrindia.com/home_controller",
      "worldwide records label"
    ],
    topSongs: [
      {
        id: "wwr-ind-1",
        title: "Worldwide Records Official Superhit Showcase",
        artist: "Worldwide Records India",
        channel: "Worldwide Records India",
        channelHandle: "@WorldwideRecordsIndia",
        genre: "Hindi",
        duration: "04:50",
        youtubeId: "IJq0yyWug1k",
        youtubeUrl: "https://www.youtube.com/watch?v=IJq0yyWug1k",
        embedUrl: "https://www.youtube-nocookie.com/embed/IJq0yyWug1k?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/IJq0yyWug1k/hqdefault.jpg",
        description: "Official channel showcase of Worldwide Records India. Visit http://wwrindia.com/home_controller for catalogs.",
        year: "2024",
        views: "50M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      },
      {
        id: "wwr-ind-2",
        title: "Classic Indian Melodies & Indie Pop Releases",
        artist: "Worldwide Records India",
        channel: "Worldwide Records India",
        channelHandle: "@WorldwideRecordsIndia",
        genre: "Hindi",
        duration: "05:15",
        youtubeId: "0I647GU3Jsc",
        youtubeUrl: "https://www.youtube.com/watch?v=0I647GU3Jsc",
        embedUrl: "https://www.youtube-nocookie.com/embed/0I647GU3Jsc?autoplay=1&rel=0",
        thumbnail: "https://i.ytimg.com/vi/0I647GU3Jsc/hqdefault.jpg",
        description: "Indie Pop, Ghazals, and timeless melodies from the Worldwide Records archive.",
        year: "2023",
        views: "35M+ Views",
        officialSite: "http://wwrindia.com/home_controller"
      }
    ]
  }
];

export function findRegionalChannel(query: string): RegionalChannel | null {
  const q = query.toLowerCase().trim().replace(/https?:\/\/(www\.)?youtube\.com\//, '').replace(/https?:\/\/(www\.)?wwrindia\.com\S*/, 'wwrindia.com');
  if (!q) return null;

  for (const ch of REGIONAL_CHANNELS) {
    if (
      ch.handle.toLowerCase() === q ||
      q.includes(ch.handle.toLowerCase()) ||
      ch.aliases.some(a => q === a || q.includes(a) || a.includes(q)) ||
      ch.name.toLowerCase().includes(q) ||
      q.includes(ch.name.toLowerCase())
    ) {
      return ch;
    }
  }

  // Handle URL redirect query specifically
  if (q.includes("wwrindia.com") || q.includes("worldwide records") || q.includes("wwrindia")) {
    return REGIONAL_CHANNELS[0]; // Worldwide Records
  }

  return null;
}

export function isRegionalMusicQuery(query: string): boolean {
  const q = query.toLowerCase().trim();
  const keywords = [
    "@worldwiderecordsbhojpuri",
    "@bhojpurimyremix",
    "@worldwiderecordspunjabi",
    "@worldwiderecordsharyanvi",
    "@wwrgujarati",
    "@worldwiderecordsindia",
    "worldwiderecords",
    "worldwide records",
    "wwrindia",
    "wwrindia.com",
    "bhojpuri remix",
    "bhojpuri dj",
    "bhojpuri song",
    "bhojpuri video",
    "punjabi song",
    "punjabi video",
    "haryanvi song",
    "haryanvi ragni",
    "haryanvi danka",
    "gujarati song",
    "gujarati garba",
    "kinjal dave",
    "pawan singh",
    "khesari",
    "shilpi raj"
  ];
  return keywords.some(kw => q.includes(kw));
}

export function searchRegionalContent(query: string): { channels: RegionalChannel[]; songs: RegionalSongItem[] } {
  const q = query.toLowerCase().trim();
  const matchedChannels: RegionalChannel[] = [];
  const matchedSongs: RegionalSongItem[] = [];

  for (const ch of REGIONAL_CHANNELS) {
    const channelMatch = 
      ch.handle.toLowerCase().includes(q) ||
      q.includes(ch.handle.toLowerCase()) ||
      ch.aliases.some(a => q.includes(a) || a.includes(q)) ||
      ch.name.toLowerCase().includes(q) ||
      ch.genre.toLowerCase() === q;

    if (channelMatch) {
      matchedChannels.push(ch);
      matchedSongs.push(...ch.topSongs);
    } else {
      // Check songs inside channel
      for (const song of ch.topSongs) {
        if (
          song.title.toLowerCase().includes(q) ||
          song.artist.toLowerCase().includes(q) ||
          song.genre.toLowerCase().includes(q) ||
          q.includes(song.artist.toLowerCase()) ||
          q.includes(song.title.toLowerCase())
        ) {
          if (!matchedSongs.some(s => s.id === song.id)) {
            matchedSongs.push(song);
          }
        }
      }
    }
  }

  // If query is broad (e.g. "@worldwiderecords" or general music), ensure top songs from all channels are returned
  if (matchedSongs.length === 0 && (q.includes("song") || q.includes("video") || q.includes("music") || q.includes("youtube") || q.includes("worldwide") || q.includes("wwr"))) {
    REGIONAL_CHANNELS.forEach(ch => {
      matchedSongs.push(...ch.topSongs.slice(0, 2));
    });
  }

  return {
    channels: matchedChannels.length > 0 ? matchedChannels : REGIONAL_CHANNELS.slice(0, 3),
    songs: matchedSongs.length > 0 ? matchedSongs : REGIONAL_CHANNELS.flatMap(c => c.topSongs)
  };
}
