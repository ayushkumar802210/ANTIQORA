/**
 * FDroidProvider
 * 
 * Provides legal discovery of open-source and privacy-respecting Android applications
 * verified by the F-Droid open repository.
 */

export interface FDroidApp {
  packageName: string;
  name: string;
  summary: string;
  description?: string;
  developer: string;
  license: string;
  webUrl: string;
  icon: string;
  categories: string[];
}

// Curated verified F-Droid canonical apps for instant lookup and open-source verification
const F_DROID_SEED_APPS: FDroidApp[] = [
  {
    packageName: 'org.videolan.vlc',
    name: 'VLC',
    summary: 'The ultimate open-source media player for videos, audio and network streams',
    developer: 'VideoLAN Community',
    license: 'GPL-3.0',
    webUrl: 'https://f-droid.org/packages/org.videolan.vlc/',
    icon: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=128&auto=format&fit=crop&q=80',
    categories: ['Video', 'Music', 'Entertainment']
  },
  {
    packageName: 'org.thoughtcrime.securesms',
    name: 'Signal Private Messenger',
    summary: 'State-of-the-art end-to-end encrypted messaging and voice calls',
    developer: 'Signal Foundation',
    license: 'GPL-3.0',
    webUrl: 'https://signal.org',
    icon: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=128&auto=format&fit=crop&q=80',
    categories: ['Messaging', 'Social Media']
  },
  {
    packageName: 'org.telegram.messenger.web',
    name: 'Telegram-FOSS',
    summary: 'FOSS edition of Telegram with non-free dependencies removed',
    developer: 'Telegram FOSS Community',
    license: 'GPL-2.0',
    webUrl: 'https://f-droid.org/packages/org.telegram.messenger.web/',
    icon: 'https://images.unsplash.com/photo-1614680376593-902f749f7ffc?w=128&auto=format&fit=crop&q=80',
    categories: ['Messaging', 'Social Media']
  },
  {
    packageName: 'net.osmand',
    name: 'OsmAnd~',
    summary: 'Global offline mobile maps and turn-by-turn navigation based on OpenStreetMap',
    developer: 'OsmAnd Community',
    license: 'GPL-3.0',
    webUrl: 'https://osmand.net',
    icon: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?w=128&auto=format&fit=crop&q=80',
    categories: ['Maps', 'Travel']
  },
  {
    packageName: 'com.termux',
    name: 'Termux',
    summary: 'Terminal emulator and Linux environment Android application',
    developer: 'Fredrik Fornwall',
    license: 'GPL-3.0',
    webUrl: 'https://termux.dev',
    icon: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=128&auto=format&fit=crop&q=80',
    categories: ['Developer Tools', 'Productivity']
  },
  {
    packageName: 'net.cozic.joplin',
    name: 'Joplin',
    summary: 'Secure, open source note taking and to-do application with end-to-end encryption',
    developer: 'Laurent Cozic',
    license: 'AGPL-3.0',
    webUrl: 'https://joplinapp.org',
    icon: 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=128&auto=format&fit=crop&q=80',
    categories: ['Productivity', 'Books']
  }
];

export class FDroidProvider {
  public static search(query: string): FDroidApp[] {
    const q = query.toLowerCase().trim();
    if (!q) return [];
    return F_DROID_SEED_APPS.filter(app => 
      app.name.toLowerCase().includes(q) ||
      app.summary.toLowerCase().includes(q) ||
      app.packageName.toLowerCase().includes(q) ||
      app.categories.some(c => c.toLowerCase().includes(q))
    );
  }
}
