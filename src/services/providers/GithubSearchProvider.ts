/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface GitHubRepositoryItem {
  id: number | string;
  name: string;
  full_name: string;
  description: string;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  updated_at: string;
  owner: {
    login: string;
    avatar_url: string;
  };
}

export interface GitHubIssueItem {
  id: number | string;
  title: string;
  html_url: string;
  state: 'open' | 'closed';
  number: number;
  repository_url: string;
  created_at: string;
  user: {
    login: string;
  };
}

export interface GitHubSearchResult {
  repositories: GitHubRepositoryItem[];
  issues: GitHubIssueItem[];
  totalCount: number;
  isRealApi: boolean;
}

export class GithubSearchProvider {
  /**
   * Search GitHub repositories and issues via the secure server-side API or fallback mock data.
   */
  static async search(query: string): Promise<GitHubSearchResult> {
    try {
      const trimmed = (query || '').trim();
      const encoded = encodeURIComponent(trimmed || 'typescript react');
      const res = await fetch(`/api/github?q=${encoded}`);
      if (res.ok) {
        const data = await res.json();
        return data;
      }
    } catch (e) {
      console.warn("GitHub search provider network error, falling back to local simulation:", e);
    }

    // Resilient fallback repository and issue index
    const qLower = (query || '').toLowerCase();
    const fallbackRepos: GitHubRepositoryItem[] = [
      {
        id: 101,
        name: "antiqora-core",
        full_name: "antiqora/antiqora-core",
        description: `High-performance multi-temporal search engine and neural knowledge synthesis platform for ${query || 'modern web'}`,
        html_url: "https://github.com/antiqora/antiqora-core",
        stargazers_count: 1450,
        forks_count: 210,
        language: "TypeScript",
        updated_at: new Date().toISOString(),
        owner: { login: "antiqora", avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" }
      },
      {
        id: 102,
        name: "ev-matlab-simulation",
        full_name: "open-electric/ev-matlab-simulation",
        description: `Advanced electric vehicle powertrain modeling, battery management systems, and MATLAB/Simulink integration for ${query || 'EV projects'}`,
        html_url: "https://github.com/open-electric/ev-matlab-simulation",
        stargazers_count: 890,
        forks_count: 145,
        language: "MATLAB",
        updated_at: new Date().toISOString(),
        owner: { login: "open-electric", avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" }
      },
      {
        id: 103,
        name: "neural-search-engine",
        full_name: "ai-research/neural-search-engine",
        description: `Open-source semantic vector retrieval and neural ranking framework matching queries like "${query || 'search'}".`,
        html_url: "https://github.com/ai-research/neural-search-engine",
        stargazers_count: 3420,
        forks_count: 512,
        language: "Python",
        updated_at: new Date().toISOString(),
        owner: { login: "ai-research", avatar_url: "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" }
      }
    ];

    const fallbackIssues: GitHubIssueItem[] = [
      {
        id: 201,
        title: `Feature request: enhanced support for ${query || 'query processing'}`,
        html_url: "https://github.com/antiqora/antiqora-core/issues/42",
        state: "open",
        number: 42,
        repository_url: "https://api.github.com/repos/antiqora/antiqora-core",
        created_at: new Date().toISOString(),
        user: { login: "developer-alpha" }
      },
      {
        id: 202,
        title: `Bug: intermittent timeout during heavy batch retrieval`,
        html_url: "https://github.com/antiqora/antiqora-core/issues/38",
        state: "closed",
        number: 38,
        repository_url: "https://api.github.com/repos/antiqora/antiqora-core",
        created_at: new Date().toISOString(),
        user: { login: "contributor-beta" }
      }
    ];

    const filteredRepos = qLower 
      ? fallbackRepos.filter(r => r.name.toLowerCase().includes(qLower) || r.description.toLowerCase().includes(qLower) || r.language.toLowerCase().includes(qLower))
      : fallbackRepos;

    return {
      repositories: filteredRepos.length > 0 ? filteredRepos : fallbackRepos,
      issues: fallbackIssues,
      totalCount: filteredRepos.length > 0 ? filteredRepos.length : fallbackRepos.length,
      isRealApi: false
    };
  }
}
