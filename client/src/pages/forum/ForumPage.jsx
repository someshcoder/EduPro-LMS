import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Plus, Filter, SlidersHorizontal, MessageSquare, Tag, X,
  RefreshCw, Inbox, ChevronDown, TrendingUp, Clock, Flame
} from 'lucide-react';
import { forumService } from '../../services/forumService';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';
import Button from '../../components/common/Button';
import QuestionCard from '../../components/forum/QuestionCard';
import AskQuestionModal from '../../components/forum/AskQuestionModal';
import ForumNavHeader from '../../components/forum/ForumNavHeader';
import { QuestionCardSkeleton } from '../../components/forum/ForumSkeleton';
import { cn } from '../../utils/cn';

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'discussed', label: 'Most Discussed', icon: MessageSquare },
  { value: 'upvoted', label: 'Most Upvoted', icon: TrendingUp },
];

const SOLVED_FILTERS = [
  { value: '', label: 'All Questions' },
  { value: 'false', label: 'Unsolved' },
  { value: 'true', label: 'Solved' },
];

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

const ForumPage = () => {
  const { isAuthenticated } = useAuthStore();
  const [questions, setQuestions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [sort, setSort] = useState('latest');
  const [selectedTag, setSelectedTag] = useState('');
  const [solvedFilter, setSolvedFilter] = useState('');
  const [popularTags, setPopularTags] = useState([]);
  const [showAskModal, setShowAskModal] = useState(false);

  const debouncedSearch = useDebounce(searchInput, 400);

  const fetchQuestions = useCallback(async (page = 1, append = false) => {
    if (page === 1) setIsLoading(true);
    else setIsLoadingMore(true);
    setError(null);
    try {
      const res = await forumService.getQuestions({
        page,
        limit: 12,
        sort,
        search: debouncedSearch,
        tag: selectedTag,
        solved: solvedFilter,
      });
      const newQs = res.data.questions;
      setQuestions((prev) => append ? [...prev, ...newQs] : newQs);
      setPagination(res.data.pagination);
    } catch (err) {
      setError('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [sort, debouncedSearch, selectedTag, solvedFilter]);

  useEffect(() => {
    fetchQuestions(1);
  }, [fetchQuestions]);

  useEffect(() => {
    forumService.getPopularTags()
      .then((res) => setPopularTags(res.data.tags || []))
      .catch(() => {});
  }, []);

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      fetchQuestions(pagination.page + 1, true);
    }
  };

  const handleQuestionCreated = (newQuestion) => {
    setQuestions((prev) => [{ ...newQuestion, author: newQuestion.author, hasUpvoted: false }, ...prev]);
    setPagination((prev) => ({ ...prev, total: prev.total + 1 }));
  };

  const handleUpvoteChange = (questionId, newCount, newVoted) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === questionId ? { ...q, upvoteCount: newCount, hasUpvoted: newVoted } : q
      )
    );
  };

  const clearFilters = () => {
    setSearchInput('');
    setSelectedTag('');
    setSolvedFilter('');
    setSort('latest');
  };

  const hasActiveFilters = debouncedSearch || selectedTag || solvedFilter;

  return (
    <div className="space-y-6">
      <ForumNavHeader onAskClick={() => setShowAskModal(true)} />

      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#1E293B]">
            Community Forum 💬
          </h1>
          <p className="text-[#64748B] text-sm mt-1">
            Ask questions, share knowledge, and earn Forum Coins.
          </p>
        </div>
        {/* {isAuthenticated && (
          <Button
            onClick={() => setShowAskModal(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="shrink-0"
          >
            Ask Question
          </Button>
        )} */}
      </motion.div>

      {/* Stats bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center gap-4 text-sm text-[#64748B]"
      >
        <span className="font-semibold text-[#1E293B]">{pagination.total.toLocaleString()}</span> questions
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 text-rose-500 hover:text-rose-600 text-xs font-medium transition-colors"
          >
            <X className="w-3 h-3" /> Clear filters
          </button>
        )}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar: filters */}
        <motion.aside
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-1 space-y-4"
        >
          {/* Search */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <div className="flex items-center gap-2 bg-slate-50 border border-[#E2E8F0] rounded-xl px-3 py-2 focus-within:border-[#06B6D4] focus-within:ring-2 focus-within:ring-cyan-100 transition-all">
              <Search className="w-4 h-4 text-[#64748B] flex-shrink-0" />
              <input
                id="forum-search"
                name="q"
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search questions..."
                className="bg-transparent text-sm text-[#1E293B] placeholder-slate-400 focus:outline-none flex-1"
              />
              {searchInput && (
                <button onClick={() => setSearchInput('')} className="text-[#94A3B8] hover:text-[#64748B]">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Sort */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" /> Sort By
            </p>
            <div className="space-y-1">
              {SORT_OPTIONS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setSort(value)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    sort === value
                      ? 'bg-cyan-50 text-[#06B6D4] border border-cyan-200'
                      : 'text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Solved filter */}
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
            <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5" /> Status
            </p>
            <div className="space-y-1">
              {SOLVED_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setSolvedFilter(value)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    solvedFilter === value
                      ? 'bg-cyan-50 text-[#06B6D4] border border-cyan-200'
                      : 'text-[#64748B] hover:bg-slate-50 hover:text-[#1E293B]'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-xs">
              <p className="text-xs font-bold text-[#64748B] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Popular Tags
              </p>
              <div className="flex flex-wrap gap-1.5">
                {popularTags.map(({ _id: tag, count }) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? '' : tag)}
                    className={cn(
                      'inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-all font-medium',
                      selectedTag === tag
                        ? 'bg-[#06B6D4] text-white'
                        : 'bg-cyan-50 text-[#06B6D4] border border-cyan-100 hover:bg-cyan-100'
                    )}
                  >
                    #{tag}
                    <span className={cn(
                      'text-[10px] font-normal',
                      selectedTag === tag ? 'text-cyan-100' : 'text-[#94A3B8]'
                    )}>
                      {count}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.aside>

        {/* Main feed */}
        <div className="lg:col-span-3 space-y-4">
          {/* Error state */}
          {error && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-center">
              <p className="text-rose-600 text-sm mb-3">{error}</p>
              <Button size="sm" variant="danger" onClick={() => fetchQuestions(1)} leftIcon={<RefreshCw className="w-4 h-4" />}>
                Retry
              </Button>
            </div>
          )}

          {/* Loading skeletons */}
          {isLoading && (
            <div className="space-y-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <QuestionCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Questions */}
          {!isLoading && !error && (
            <>
              {questions.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-[#E2E8F0] rounded-2xl p-12 text-center"
                >
                  <Inbox className="w-14 h-14 text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#1E293B] mb-2">No questions found</h3>
                  <p className="text-[#64748B] text-sm mb-6">
                    {hasActiveFilters
                      ? 'No questions match your current filters. Try adjusting or clearing them.'
                      : 'Be the first to ask a question in the community!'}
                  </p>
                  {hasActiveFilters && (
                    <Button variant="secondary" size="sm" onClick={clearFilters}>
                      Clear Filters
                    </Button>
                  )}
                  {!hasActiveFilters && isAuthenticated && (
                    <Button onClick={() => setShowAskModal(true)} leftIcon={<Plus className="w-4 h-4" />}>
                      Ask a Question
                    </Button>
                  )}
                </motion.div>
              ) : (
                <AnimatePresence mode="popLayout">
                  {questions.map((question) => (
                    <QuestionCard
                      key={question._id}
                      question={question}
                      onUpvoteChange={handleUpvoteChange}
                    />
                  ))}
                </AnimatePresence>
              )}

              {/* Load More */}
              {pagination.page < pagination.pages && (
                <div className="text-center pt-2">
                  <Button
                    variant="secondary"
                    onClick={handleLoadMore}
                    isLoading={isLoadingMore}
                    leftIcon={<ChevronDown className="w-4 h-4" />}
                  >
                    Load More ({pagination.total - questions.length} remaining)
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Ask Question Modal */}
      <AskQuestionModal
        isOpen={showAskModal}
        onClose={() => setShowAskModal(false)}
        onSuccess={handleQuestionCreated}
      />
    </div>
  );
};

export default ForumPage;

