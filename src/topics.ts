// サイドバー・ホーム・コマンドパレット・前後ナビで共有するトピック定義
export type TopicKey =
  | 'tTest'
  | 'anova'
  | 'regression'
  | 'coinFlip'
  | 'mcmc'
  | 'hierarchical'
  | 'irt'
  | 'survival'
  | 'hmm';

export type Category = 'classical' | 'bayes' | 'discovery';

export type Topic = {
  key: TopicKey;
  path: string;
  icon: string;
  category: Category;
  level: 1 | 2 | 3;
  missions: number;
};

export const topics: Topic[] = [
  { key: 'tTest', path: '/classical/t-test', icon: '⚖️', category: 'classical', level: 1, missions: 3 },
  { key: 'anova', path: '/classical/anova', icon: '📦', category: 'classical', level: 1, missions: 3 },
  { key: 'regression', path: '/classical/regression', icon: '📈', category: 'classical', level: 2, missions: 3 },
  { key: 'coinFlip', path: '/bayesian/coin-flip', icon: '🪙', category: 'bayes', level: 1, missions: 3 },
  { key: 'mcmc', path: '/bayesian/mcmc', icon: '⛓️', category: 'bayes', level: 3, missions: 3 },
  { key: 'hierarchical', path: '/bayesian/hierarchical', icon: '🏛️', category: 'bayes', level: 3, missions: 3 },
  { key: 'irt', path: '/discovery/irt', icon: '📝', category: 'discovery', level: 2, missions: 3 },
  { key: 'survival', path: '/discovery/survival', icon: '⏳', category: 'discovery', level: 2, missions: 3 },
  { key: 'hmm', path: '/discovery/hmm', icon: '🎭', category: 'discovery', level: 3, missions: 3 },
];

export const categories: Category[] = ['classical', 'bayes', 'discovery'];

export const totalMissions = topics.reduce((s, t) => s + t.missions, 0);

export function topicByPath(path: string): Topic | undefined {
  return topics.find((t) => t.path === path);
}
