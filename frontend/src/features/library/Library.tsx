import React, { useMemo, useState } from 'react';

type Category =
  | 'All Articles'
  | 'Nutrition'
  | 'Exercise'
  | 'Mental Health'
  | 'Cycle Education'
  | 'Wellness'
  | 'Pain Management';

type Article = {
  id: string;
  title: string;
  category: Exclude<Category, 'All Articles'>;
  readMinutes: number;
  summary: string;
  tags: string[];
  imageUrl: string;
};

const categories: Category[] = [
  'All Articles',
  'Nutrition',
  'Exercise',
  'Mental Health',
  'Cycle Education',
  'Wellness',
  'Pain Management',
];

const articles: Article[] = [
  {
    id: 'cycle-phases',
    title: 'Understanding Your Menstrual Cycle Phases',
    category: 'Cycle Education',
    readMinutes: 5,
    summary: 'Learn what happens in each phase and how hormones shape your energy, mood, and flow.',
    tags: ['basics', 'hormones', 'phases'],
    imageUrl:
      'https://images.unsplash.com/photo-1584515933487-779824d29309?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'period-foods',
    title: 'Best Foods to Eat During Your Period',
    category: 'Nutrition',
    readMinutes: 4,
    summary: 'Support your body with iron-rich meals, hydration, and anti-inflammatory ingredients.',
    tags: ['diet', 'menstruation', 'iron'],
    imageUrl:
      'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'cramp-remedies',
    title: 'Natural Remedies for Period Cramps',
    category: 'Pain Management',
    readMinutes: 6,
    summary: 'Try practical, drug-free techniques to reduce discomfort and recover faster.',
    tags: ['cramps', 'relief', 'self-care'],
    imageUrl:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'stress-cycle',
    title: 'How Stress Can Affect Your Cycle',
    category: 'Mental Health',
    readMinutes: 5,
    summary: 'Understand stress-cycle links and build routines that stabilize mood and sleep.',
    tags: ['stress', 'mood', 'sleep'],
    imageUrl:
      'https://images.unsplash.com/photo-1474418397713-7ede21d49118?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'exercise-by-phase',
    title: 'Training by Phase: Smarter Cycle-Aware Workouts',
    category: 'Exercise',
    readMinutes: 7,
    summary: 'Adjust intensity and recovery windows across your cycle to perform better.',
    tags: ['training', 'energy', 'recovery'],
    imageUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1200&q=80',
  },
  {
    id: 'sleep-wellness',
    title: 'Sleep and Wellness Habits That Ease PMS',
    category: 'Wellness',
    readMinutes: 5,
    summary: 'Use simple nightly rituals to improve rest, reduce irritability, and boost focus.',
    tags: ['pms', 'sleep', 'habits'],
    imageUrl:
      'https://images.unsplash.com/photo-1511295742362-92c96b5adb93?auto=format&fit=crop&w=1200&q=80',
  },
];

const SearchIcon: React.FC<{ className?: string }> = ({ className = 'h-6 w-6' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

const ClockIcon: React.FC<{ className?: string }> = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={className}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5l3 2" />
  </svg>
);

const categoryBadgeStyle = (category: Article['category']): string => {
  switch (category) {
    case 'Nutrition':
      return 'bg-[#dbf4e7] text-[#137a51]';
    case 'Exercise':
      return 'bg-[#ddebff] text-[#2f62c6]';
    case 'Mental Health':
      return 'bg-[#ece2ff] text-[#6f38d4]';
    case 'Cycle Education':
      return 'bg-[#f9e8ef] text-[#a23d6b]';
    case 'Wellness':
      return 'bg-[#fff2cb] text-[#9a5f00]';
    case 'Pain Management':
      return 'bg-[#fde5e5] text-[#b64646]';
    default:
      return 'bg-[#eff2f7] text-muted';
  }
};

const Library: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All Articles');

  const filteredArticles = useMemo(() => {
    const loweredQuery = query.toLowerCase().trim();

    return articles.filter((article) => {
      const categoryMatch = activeCategory === 'All Articles' || article.category === activeCategory;
      if (!categoryMatch) {
        return false;
      }

      if (!loweredQuery) {
        return true;
      }

      const searchText = `${article.title} ${article.summary} ${article.category} ${article.tags.join(' ')}`.toLowerCase();
      return searchText.includes(loweredQuery);
    });
  }, [activeCategory, query]);

  return (
    <div className="space-y-6 animate-fadeInUp">
      <header>
        <h1 className="page-title">Tips & Articles</h1>
        <p className="page-subtitle">Learn about menstrual health and wellness</p>
      </header>

      <section className="bloom-card p-4 sm:p-5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-6 w-6 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Search articles, tips, tags..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-14 w-full rounded-2xl border border-line bg-[#fbfcff] pl-14 pr-4 text-[0.98rem] font-medium text-ink outline-none transition focus:border-rose-quartz focus:ring-2 focus:ring-rose-quartz/25"
          />
        </div>

        <div className="mt-4 overflow-x-auto">
          <div className="inline-flex min-w-full gap-2 rounded-2xl bg-[#f4f6fa] p-2">
            {categories.map((category) => {
              const isActive = category === activeCategory;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  className={`whitespace-nowrap rounded-xl px-4 py-2 text-[0.9rem] font-semibold transition ${
                    isActive ? 'bg-white text-ink shadow-soft' : 'text-muted hover:text-ink'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {filteredArticles.length === 0 ? (
        <section className="bloom-card p-10 text-center">
          <h2 className="section-title">No articles found</h2>
          <p className="card-meta mt-2">Try a different keyword or category filter.</p>
        </section>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredArticles.map((article) => (
            <article
              key={article.id}
              className="group overflow-hidden rounded-3xl border border-line bg-white shadow-soft transition duration-250 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(31,47,70,0.14)]"
            >
              <div className="h-52 overflow-hidden">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex rounded-xl px-3 py-1 text-sm font-bold uppercase tracking-[0.08em] ${categoryBadgeStyle(article.category)}`}
                  >
                    {article.category}
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-muted">
                    <ClockIcon />
                    {article.readMinutes} min
                  </span>
                </div>

                <h3 className="font-display text-[1.45rem] leading-[1.22] tracking-tight text-ink sm:text-[1.55rem]">
                  {article.title}
                </h3>
                <p className="text-[0.98rem] leading-7 text-muted">{article.summary}</p>

                <div className="flex flex-wrap gap-2 pt-1">
                  {article.tags.map((tag) => (
                    <span
                      key={`${article.id}-${tag}`}
                      className="rounded-lg border border-line bg-[#f7f9fd] px-2.5 py-1 text-[0.9rem] font-semibold text-muted"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      )}
    </div>
  );
};

export default Library;
