import React, { useMemo, useState } from 'react';
import { BookOpen, ExternalLink, Search } from 'lucide-react';

type Category = 'All' | 'Cycle Basics' | 'Privacy' | 'Symptoms' | 'Care Planning';

type Article = {
  title: string;
  category: Exclude<Category, 'All'>;
  source: string;
  readMinutes: number;
  summary: string;
  tags: string[];
};

const categories: Category[] = ['All', 'Cycle Basics', 'Privacy', 'Symptoms', 'Care Planning'];

const articles: Article[] = [
  {
    title: 'How cycle tracking predictions should be read',
    category: 'Cycle Basics',
    source: 'Flowelle clinical notes',
    readMinutes: 4,
    summary: 'Understand the difference between logged period starts and estimated future windows.',
    tags: ['prediction', 'confidence', 'calendar'],
  },
  {
    title: 'Sensitive health app privacy checklist',
    category: 'Privacy',
    source: 'FTC mobile health guidance',
    readMinutes: 6,
    summary: 'A practical checklist for consent, sharing, deletion, and export controls in health apps.',
    tags: ['privacy', 'consent', 'export'],
  },
  {
    title: 'Preparing a useful symptom summary',
    category: 'Care Planning',
    source: 'Flowelle clinician-summary format',
    readMinutes: 5,
    summary: 'Turn repeated symptoms, timing, severity, and notes into a concise care conversation.',
    tags: ['appointment', 'symptoms', 'summary'],
  },
  {
    title: 'When period pain needs professional attention',
    category: 'Symptoms',
    source: 'Health education review',
    readMinutes: 5,
    summary: 'Learn which symptom patterns should be escalated instead of handled as routine tracking.',
    tags: ['pain', 'bleeding', 'care'],
  },
  {
    title: 'Private AI and reviewed drafts',
    category: 'Privacy',
    source: 'Flowelle AI policy',
    readMinutes: 3,
    summary: 'How AI coach and voice drafts work without automatic saving or diagnosis.',
    tags: ['ai', 'voice', 'review'],
  },
];

const Library: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredArticles = useMemo(() => {
    const loweredQuery = query.toLowerCase().trim();
    return articles.filter((article) => {
      const categoryMatch = activeCategory === 'All' || article.category === activeCategory;
      const queryMatch =
        !loweredQuery ||
        `${article.title} ${article.summary} ${article.tags.join(' ')} ${article.source}`
          .toLowerCase()
          .includes(loweredQuery);
      return categoryMatch && queryMatch;
    });
  }, [activeCategory, query]);

  return (
    <div className="flow-page">
      <header>
        <p className="card-label">Education</p>
        <h1 className="page-title">Library</h1>
        <p className="page-subtitle">
          Short, source-labeled guidance. Educational content does not replace medical advice.
        </p>
      </header>

      <section className="flow-card p-4 sm:p-5">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
          <span className="sr-only">Search library</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search privacy, symptoms, predictions..."
            className="flow-input mt-0 pl-11"
          />
        </label>
        <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`flow-chip whitespace-nowrap ${activeCategory === category ? 'flow-chip-active' : ''}`}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredArticles.map((article) => (
          <article key={article.title} className="flow-card p-5">
            <div className="flex items-start justify-between gap-3">
              <BookOpen className="h-5 w-5 text-clinical-blue" aria-hidden="true" />
              <span className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-muted">
                {article.readMinutes} min
              </span>
            </div>
            <p className="card-label mt-4">{article.category}</p>
            <h2 className="mt-2 text-lg font-extrabold leading-tight text-ink">{article.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-muted">{article.summary}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span key={`${article.title}-${tag}`} className="rounded-full bg-mist px-2.5 py-1 text-xs font-bold text-muted">
                  #{tag}
                </span>
              ))}
            </div>
            <p className="mt-4 inline-flex items-center gap-2 text-sm font-extrabold text-clinical-blue">
              {article.source}
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </p>
          </article>
        ))}
      </section>
    </div>
  );
};

export default Library;
