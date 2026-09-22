export interface ReporterEntity {
  id: string;
  name: string;
  titleName: string;
  aliases: string[];
  channelOrNetwork: string;
  bio: string;
  topVideos: { title: string; platform: string; duration: string; url: string; thumbnail: string; description: string }[];
  photos: { title: string; url: string; caption: string }[];
  latestReports: { title: string; source: string; time: string; summary: string; url: string }[];
}

export const REPORTERS_DATABASE: ReporterEntity[] = [
  {
    id: "ravish-kumar",
    name: "Ravish Kumar",
    titleName: "Senior Journalist & Magsaysay Awardee Ravish Kumar",
    aliases: ["ravish", "ravish kumar", "ravish kumar youtube", "ravish kumar news", "ravish kumar channel", "ravish ki report"],
    channelOrNetwork: "Ravish Kumar Official (YouTube) / Ex-NDTV",
    bio: "Ravish Kumar is an Indian journalist, author, and media personality. He served as the senior executive editor of NDTV India and is renowned for his ground reports on socio-economic issues, Prime Time debates, and recipient of the prestigious Ramon Magsaysay Award (2019).",
    topVideos: [
      {
        title: "Ravish Kumar Prime Time: Ground Report on Unemployment & Public Issues",
        platform: "YouTube / Ravish Kumar Official",
        duration: "24:15",
        url: "https://www.youtube.com/watch?v=0I647GU3Jsc",
        thumbnail: "https://i.ytimg.com/vi/0I647GU3Jsc/hqdefault.jpg",
        description: "Official Prime Time investigative journalism episode discussing key national policies and public impact."
      },
      {
        title: "Ravish Kumar Exclusive Interview on Independent Journalism",
        platform: "YouTube / Global Media Talks",
        duration: "45:20",
        url: "https://www.youtube.com/watch?v=3R-33fUpU0k",
        thumbnail: "https://i.ytimg.com/vi/3R-33fUpU0k/hqdefault.jpg",
        description: "In-depth conversation covering the evolution of digital journalism, press freedom, and grassroots storytelling."
      },
      {
        title: "Ravish Kumar Instagram Live & Behind The Lens",
        platform: "Instagram / Reels",
        duration: "01:30",
        url: "https://www.instagram.com/",
        thumbnail: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?q=80&w=800&auto=format&fit=crop",
        description: "Live interactive session and Q&A with viewers on daily news developments."
      }
    ],
    photos: [
      { title: "Ravish Kumar Reporting Live from Ground Zero", url: "https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80", caption: "Ravish Kumar during prime time broadcast" },
      { title: "Ravish Kumar Portrait HD", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80", caption: "Studio portrait of the senior journalist" }
    ],
    latestReports: [
      { title: "Ravish Kumar's Latest YouTube Vlog Crosses 2 Million Views", source: "Digital Media Watch", time: "3 hours ago", summary: "Senior journalist Ravish Kumar's critique of economic indicators sparks nationwide discussion.", url: "https://news.google.com/search?q=Ravish+Kumar" },
      { title: "Independent Journalism and the Rise of Digital Reporters", source: "Press Gazette", time: "1 day ago", summary: "An analysis of how senior anchors like Ravish Kumar are shaping independent digital reporting.", url: "https://news.google.com/search?q=Ravish+Kumar+news" }
    ]
  },
  {
    id: "anjana-om-kashyap",
    name: "Anjana Om Kashyap",
    titleName: "Executive Editor Anjana Om Kashyap",
    aliases: ["anjana om kashyap", "anjana", "anjana om kashyap news", "aaj tak anjana", "hall bol anjana"],
    channelOrNetwork: "Aaj Tak / India Today",
    bio: "Anjana Om Kashyap is a prominent Indian journalist and television news anchor. She is the Executive Editor of Aaj Tak, known for hosting popular prime-time shows such as 'Halla Bol' and election special coverages like 'Rajtilak'.",
    topVideos: [
      {
        title: "Halla Bol Special Debate with Anjana Om Kashyap",
        platform: "YouTube / Aaj Tak",
        duration: "28:40",
        url: "https://www.youtube.com/watch?v=0I647GU3Jsc",
        thumbnail: "https://i.ytimg.com/vi/0I647GU3Jsc/hqdefault.jpg",
        description: "Heated political debate and analysis moderated by Executive Editor Anjana Om Kashyap on Aaj Tak."
      },
      {
        title: "Anjana Om Kashyap Ground Zero Election Yatra",
        platform: "YouTube / Aaj Tak Special",
        duration: "18:10",
        url: "https://www.youtube.com/watch?v=3R-33fUpU0k",
        thumbnail: "https://i.ytimg.com/vi/3R-33fUpU0k/hqdefault.jpg",
        description: "Exclusive ground reporting traveling across constituencies during state elections."
      },
      {
        title: "Anjana Om Kashyap Instagram Reels & Studio Vlog",
        platform: "Instagram / Reels",
        duration: "00:55",
        url: "https://www.instagram.com/",
        thumbnail: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        description: "Behind the scenes at Aaj Tak newsroom before the prime time broadcast."
      }
    ],
    photos: [
      { title: "Anjana Om Kashyap Hosting Halla Bol Debate", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80", caption: "Anjana Om Kashyap in Aaj Tak studio" }
    ],
    latestReports: [
      { title: "Anjana Om Kashyap Leads Aaj Tak's Record Breaking Election Coverage", source: "Media Broadcast News", time: "4 hours ago", summary: "Aaj Tak records highest viewership during special debate hosted by Anjana Om Kashyap.", url: "https://news.google.com/search?q=Anjana+Om+Kashyap" }
    ]
  },
  {
    id: "sudhir-chaudhary",
    name: "Sudhir Chaudhary",
    titleName: "Consulting Editor Sudhir Chaudhary",
    aliases: ["sudhir chaudhary", "sudhir", "black and white sudhir chaudhary", "aaj tak sudhir chaudhary", "dna sudhir chaudhary"],
    channelOrNetwork: "Aaj Tak",
    bio: "Sudhir Chaudhary is an Indian journalist and television news anchor. He is the Consulting Editor at Aaj Tak, formerly editor-in-chief of Zee News, and hosts the prime-time news analysis show 'Black & White'.",
    topVideos: [
      {
        title: "Black & White with Sudhir Chaudhary: Complete Analysis",
        platform: "YouTube / Aaj Tak",
        duration: "35:00",
        url: "https://www.youtube.com/watch?v=0I647GU3Jsc",
        thumbnail: "https://i.ytimg.com/vi/0I647GU3Jsc/hqdefault.jpg",
        description: "Prime time news analysis breaking down major national and economic developments with Sudhir Chaudhary."
      },
      {
        title: "Sudhir Chaudhary Exclusive Ground Report",
        platform: "YouTube / Aaj Tak Originals",
        duration: "22:15",
        url: "https://www.youtube.com/watch?v=3R-33fUpU0k",
        thumbnail: "https://i.ytimg.com/vi/3R-33fUpU0k/hqdefault.jpg",
        description: "In-depth investigative report and exclusive interview on key national milestones."
      }
    ],
    photos: [
      { title: "Sudhir Chaudhary in Black & White Studio", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80", caption: "Sudhir Chaudhary hosting prime time" }
    ],
    latestReports: [
      { title: "Sudhir Chaudhary Discusses Future of TV Journalism", source: "News Broadcast Today", time: "6 hours ago", summary: "Consulting Editor Sudhir Chaudhary shares insights on digital media transformation.", url: "https://news.google.com/search?q=Sudhir+Chaudhary" }
    ]
  }
];

export function isReporterQuery(query: string): boolean {
  const q = query.toLowerCase();
  return REPORTERS_DATABASE.some(rep => 
    rep.name.toLowerCase() === q ||
    rep.aliases.some(alias => q.includes(alias)) ||
    q.includes("reporter") || q.includes("journalist") || q.includes("anchor") || q.includes("patrakar")
  );
}

export function findReporter(query: string): ReporterEntity | undefined {
  const q = query.toLowerCase();
  return REPORTERS_DATABASE.find(rep => 
    rep.name.toLowerCase() === q ||
    rep.aliases.some(alias => q.includes(alias)) ||
    q.includes(rep.name.toLowerCase().split(' ')[0])
  );
}
