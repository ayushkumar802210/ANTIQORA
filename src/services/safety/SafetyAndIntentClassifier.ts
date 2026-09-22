/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * ANTIQORA Adult / Romantic / Intimacy & Zero-Tolerance Safety Classifier
 */

export interface QuerySafetyClassification {
  isBlocked: boolean;
  blockReason?: string;
  helplines?: Array<{ name: string; contact: string; url?: string }>;
  isAdult: boolean;
  isRomantic: boolean;
  isDatingRelationship: boolean;
  isHealthEducation: boolean;
  detectedRegion: 'india' | 'global';
  suggestedCategories: string[];
}

export interface CategoryCountInfo {
  id: string;
  label: string;
  count: number;
}

export class SafetyAndIntentClassifier {
  // STRICT ZERO-TOLERANCE PATTERNS: Minors, exploitation, non-consensual material, leaks
  private static ILLEGAL_PATTERNS = [
    /\b(child|minor|underage|teenager|infant|kid|toddler|schoolgirl|schoolboy|pedo|pedophil|cp|csam)\b.*\b(porn|sex|nude|naked|erotic|act|video|photo|strip)\b/i,
    /\b(porn|sex|nude|naked|erotic|strip)\b.*\b(child|minor|underage|teenager|infant|kid|toddler|schoolgirl|schoolboy|pedo|pedophil|cp|csam)\b/i,
    /\b(non[- ]?consensual|rape|assault|trafficking|forced sex|sexual violence)\b/i,
    /\b(leaked mms|stolen nudes|hacked private|revenge porn|hidden cam voyeur|up-skirt|upskirt|without consent)\b/i,
    /\b(under 18|under-18|below 18)\b.*\b(sex|porn|nude)\b/i,
    /\b(sex|porn|nude)\b.*\b(under 18|under-18|below 18)\b/i
  ];

  // ADULT / EXPLICIT PATTERNS (18+ only, legal consensual adult content)
  private static ADULT_PATTERNS = [
    /\b(porn|pornography|xxx|xvideos|pornhub|xnxx|redtube|erotica|erotic|nsfw|18\+|adult video|adult search|adult content|sex clips|hardcore|sensual adult)\b/i,
    /\b(adult relationship information|adult intimate|adult entertainment|erotic fiction|bdsm|adult toys|intimate wellness)\b/i
  ];

  // ROMANTIC & LOVE PATTERNS
  private static ROMANTIC_PATTERNS = [
    /\b(romantic|romance|love|couple|valentine|date night|romantic movies|romantic songs|love story|love quotes|romantic novel|romantic places|honeymoon|proposal|crush|heartbreak|flirting)\b/i,
    /\b(pyar|ishq|mohabbat|prem|suno na|dil|aashiqui|shikwa)\b/i
  ];

  // DATING & RELATIONSHIPS PATTERNS
  private static DATING_RELATIONSHIP_PATTERNS = [
    /\b(relationship|dating|dating advice|relationship advice|how to talk to a girl|how to talk to a boy|how to impress|marriage|matrimony|shaadi|jeevansathi|tinder|bumble|hinge|couples therapy|communication in relationship|breakup|long distance relationship|toxic relationship|healthy relationship|commitment|infidelity|partner)\b/i
  ];

  // HEALTH & EDUCATION / INTIMACY WELLNESS PATTERNS
  private static HEALTH_EDUCATION_PATTERNS = [
    /\b(intimacy health|sexual health|sex education|reproductive health|contraception|safe sex|sti|std|sexual wellness|puberty|gynecology|urology|fertility|menstruation|planned parenthood|who health|mayo clinic sexual|psychology of love|healthy intimacy)\b/i
  ];

  // REGIONAL / INDIA PATTERNS
  private static INDIA_PATTERNS = [
    /\b(india|indian|bollywood|desi|shaadi|jeevansathi|hindi|bhojpuri|tamil|telugu|punjabi|marathi|bengali|delhi|mumbai|bangalore)\b/i
  ];

  /**
   * Classifies user query with strict legal safety filtering, 18+ adult detection, romance & intimacy detection.
   */
  static classifyQuery(query: string): QuerySafetyClassification {
    const raw = (query || '').trim();
    const lower = raw.toLowerCase();

    // 1. Check for illegal, non-consensual, or minor-related material (ZERO TOLERANCE)
    for (const pattern of this.ILLEGAL_PATTERNS) {
      if (pattern.test(lower)) {
        return {
          isBlocked: true,
          blockReason: 'ANTIQORA Safety Policy: Queries involving minors, exploitation, human trafficking, non-consensual sexual material, or privacy violations are strictly blocked by law and search policy.',
          helplines: [
            { name: 'National Center for Missing & Exploited Children (NCMEC)', contact: '1-800-843-5678', url: 'https://report.cybertip.org' },
            { name: 'RAINN - National Sexual Assault Telephone Hotline', contact: '1-800-656-4673', url: 'https://www.rainn.org' },
            { name: 'National Human Trafficking Hotline', contact: '1-888-373-7888 / Text HELP to 233733', url: 'https://humantraffickinghotline.org' },
            { name: 'Cyber Crime Reporting Portal (India)', contact: 'Dial 1930 / cybercrime.gov.in', url: 'https://cybercrime.gov.in' },
            { name: 'Childline India (1098)', contact: 'Dial 1098', url: 'https://childlineindia.org' }
          ],
          isAdult: false,
          isRomantic: false,
          isDatingRelationship: false,
          isHealthEducation: false,
          detectedRegion: 'global',
          suggestedCategories: []
        };
      }
    }

    // 2. Detect adult/explicit query (Legal consensual 18+)
    const isAdult = this.ADULT_PATTERNS.some(p => p.test(lower));

    // 3. Detect romantic query
    const isRomantic = this.ROMANTIC_PATTERNS.some(p => p.test(lower));

    // 4. Detect dating & relationships query
    const isDatingRelationship = this.DATING_RELATIONSHIP_PATTERNS.some(p => p.test(lower));

    // 5. Detect health & sex education / intimacy wellness query
    const isHealthEducation = this.HEALTH_EDUCATION_PATTERNS.some(p => p.test(lower));

    // 6. Detect region (India vs Global)
    const detectedRegion = this.INDIA_PATTERNS.some(p => p.test(lower)) ? 'india' : 'global';

    // Categories to prioritize
    const suggestedCategories = ['all'];
    if (isRomantic) suggestedCategories.push('videos', 'articles', 'dating-relationships');
    if (isDatingRelationship) suggestedCategories.push('dating-relationships', 'articles', 'health-education', 'videos');
    if (isHealthEducation) suggestedCategories.push('health-education', 'articles', 'videos');
    if (isAdult) suggestedCategories.push('videos', 'images', 'health-education', 'articles');

    return {
      isBlocked: false,
      isAdult,
      isRomantic,
      isDatingRelationship,
      isHealthEducation,
      detectedRegion,
      suggestedCategories
    };
  }

  /**
   * Helper to determine item category dynamically
   */
  static categorizeResultItem(item: { title: string; url: string; domain: string; snippet?: string }): string {
    const text = `${item.title} ${item.snippet || ''} ${item.domain} ${item.url}`.toLowerCase();

    // Health & Education
    if (
      /\b(mayo clinic|webmd|healthline|planned parenthood|nhs\.uk|who\.int|cdc\.gov|medical|psychology|therapist|counseling|sex education|mental health)\b/i.test(text)
    ) {
      return 'health-education';
    }

    // Dating & Relationships
    if (
      /\b(dating|relationship|marriage|shaadi|jeevansathi|matrimon|tinder|bumble|hinge|couples|advice for couples|romance|love tips)\b/i.test(text)
    ) {
      return 'dating-relationships';
    }

    // Social Media
    if (
      /\b(reddit\.com|quora\.com|twitter\.com|x\.com|instagram\.com|facebook\.com|threads\.net|tiktok\.com)\b/i.test(text)
    ) {
      return 'social';
    }

    // People / Profiles
    if (
      /\b(biography|dr\.|psychologist|therapist|author|counselor|expert|actor|actress|profile|director)\b/i.test(text) &&
      (item.domain.includes('wikipedia.org') || item.domain.includes('imdb.com') || item.domain.includes('psychologytoday.com'))
    ) {
      return 'people';
    }

    // Articles & Longform
    if (
      /\b(article|essay|guide|deep dive|study|journal|magazine|medium\.com|substack\.com|theatlantic\.com|vox\.com|psychologytoday\.com)\b/i.test(text) ||
      (item.snippet && item.snippet.length > 120)
    ) {
      return 'articles';
    }

    // News
    if (
      /\b(news|times|chronicle|hindustan|bbc|reuters|apnews|thehindu|indianexpress|post|daily)\b/i.test(item.domain)
    ) {
      return 'news';
    }

    // Default to general web
    return 'web';
  }
}
