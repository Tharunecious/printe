import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Rate } from "antd";
import { BsXLg } from "react-icons/bs";

// ═══════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════

const getRelativeTime = (dateStr) => {
  if (!dateStr) return "";
  const now = new Date();
  const past = new Date(dateStr);
  const diffMs = now - past;
  if (diffMs < 0) return "just now";

  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years}y ago`;
  if (months > 0) return `${months}mo ago`;
  if (weeks > 0) return `${weeks}w ago`;
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "just now";
};

const REVIEWS_API = "https://data.accentapi.com/feed/25717205.json";

// ═══════════════════════════════════════════════════
// Sub-components
// ═══════════════════════════════════════════════════

/** Avatar with image fallback to first-letter circle */
const AvatarDisplay = ({ photoUrl, name, size = "sm" }) => {
  const [imgError, setImgError] = useState(false);
  const firstLetter = name ? name.charAt(0).toUpperCase() : "?";

  const sizeClasses =
    size === "lg"
      ? "w-14 h-14 sm:w-16 sm:h-16"
      : "w-10 h-10 sm:w-12 sm:h-12";

  if (photoUrl && !imgError) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={`${sizeClasses} rounded-full object-cover shrink-0 ring-2 ring-[#f2c41a]/60 shadow-sm`}
        loading="lazy"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} rounded-full shrink-0 ring-2 ring-[#f2c41a]/60 shadow-sm bg-[#f2c41a] flex items-center justify-center`}
    >
      <span className="text-lg sm:text-xl font-bold text-white">
        {firstLetter}
      </span>
    </div>
  );
};

/** Single review card with accurate 5-line overflow detection */
const ReviewCard = ({ review, onSeeMore }) => {
  const textRef = useRef(null);
  const [isClamped, setIsClamped] = useState(false);

  useEffect(() => {
    const checkClamp = () => {
      if (textRef.current) {
        // scrollHeight strictly greater than clientHeight means text exceeds 5 lines
        const hasOverflow =
          textRef.current.scrollHeight > textRef.current.clientHeight + 1;
        setIsClamped(hasOverflow);
      }
    };

    checkClamp();

    window.addEventListener("resize", checkClamp);
    if (document.fonts?.ready) {
      document.fonts.ready.then(checkClamp);
    }

    return () => window.removeEventListener("resize", checkClamp);
  }, [review.review_text]);

  return (
    <div className="flex flex-row md:flex-col 2xl:flex-row items-start gap-3 sm:gap-3.5 bg-[#FCF8ED] rounded-2xl p-3.5 sm:p-4 shadow-sm overflow-hidden h-full">
      {/* Avatar */}
      <AvatarDisplay
        photoUrl={review.reviewer_photo_link}
        name={review.reviewer_name}
      />

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between h-full overflow-hidden">
        <div>
          {/* Stars */}
          <div className="flex items-center mb-1">
            <Rate
              disabled
              defaultValue={review.rating}
              className="!text-xs sm:!text-sm !text-yellow-400"
            />
          </div>

          {/* Review text — clamped to 5 lines */}
          <p
            ref={textRef}
            className="text-xs sm:text-sm text-gray-700 font-medium leading-relaxed line-clamp-5 italic"
          >
            &ldquo;{review.review_text}&rdquo;
          </p>

          {/* See more (only shown when text strictly exceeds 5 lines) */}
          {isClamped && (
            <button
              type="button"
              onClick={() => onSeeMore(review)}
              className="text-xs sm:text-sm text-[#d4a005] hover:text-[#b88700] font-semibold hover:underline mt-0.5 cursor-pointer bg-transparent border-none p-0 inline-block transition-colors"
            >
              See more
            </button>
          )}
        </div>

        {/* Name + Time */}
        <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 mt-2.5">
          <span className="text-xs sm:text-sm font-extrabold text-black leading-snug break-words">
            — {review.reviewer_name}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-400 shrink-0">
            {getRelativeTime(review.created_time)}
          </span>
        </div>
      </div>
    </div>
  );
};

/** Review detail modal */
const ReviewModal = ({ review, onClose }) => {
  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!review) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative bg-[#FCF8ED] rounded-2xl p-5 sm:p-6 w-full max-w-md max-h-[80vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 w-7 h-7 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-gray-600 transition-colors"
          aria-label="Close"
        >
          <BsXLg className="text-xs" />
        </button>

        {/* Header: Avatar + Name + Time */}
        <div className="flex items-center gap-3 mb-4">
          <AvatarDisplay
            photoUrl={review.reviewer_photo_link}
            name={review.reviewer_name}
            size="lg"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-extrabold text-black leading-snug break-words">
              {review.reviewer_name}
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">
              {getRelativeTime(review.created_time)}
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="mb-3">
          <Rate
            disabled
            defaultValue={review.rating}
            className="!text-sm !text-yellow-400"
          />
        </div>

        {/* Full review text */}
        <p className="text-sm sm:text-base text-gray-800 font-medium leading-relaxed italic">
          &ldquo;{review.review_text}&rdquo;
        </p>
      </motion.div>
    </motion.div>
  );
};

/** Carousel pagination dots */
const CarouselDots = ({ totalPages, currentPage, onChange }) => (
  <div className="flex items-center justify-center gap-1 sm:gap-1.5">
    {Array.from({ length: totalPages }).map((_, idx) => (
      <button
        key={idx}
        type="button"
        onClick={() => onChange(idx)}
        className="border-none outline-none focus:outline-none focus:ring-0 bg-transparent transition-all duration-300 flex items-center justify-center p-1 cursor-pointer select-none"
        style={{
          outline: "none",
          border: "none",
          boxShadow: "none",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label={`Go to reviews set ${idx + 1}`}
      >
        {currentPage === idx ? (
          <span className="w-5 sm:w-7 h-2 bg-[#f2c41a] rounded-full transition-all duration-300 shadow-sm" />
        ) : (
          <span className="w-2 h-2 bg-black/25 hover:bg-black/50 rounded-full transition-all duration-300" />
        )}
      </button>
    ))}
  </div>
);

// ═══════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════

const CustomerReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [modalReview, setModalReview] = useState(null);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < 768 : false
  );

  // ── Fetch reviews ──
  const fetchReviews = useCallback(async () => {
    try {
      const res = await fetch(REVIEWS_API);
      const data = await res.json();
      if (data?.reviews && Array.isArray(data.reviews)) {
        const filtered = data.reviews
          .filter((r) => r.rating >= 4.5 && r.review_text?.trim())
          .slice(0, 9);
        setReviews(filtered);
      }
    } catch (err) {
      console.error("Failed to fetch Google reviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  // ── Responsive ──
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const itemsPerPage = isMobile ? 1 : 3;
  const totalPages = Math.ceil(reviews.length / itemsPerPage);

  useEffect(() => {
    setCurrentPage((prev) => (prev >= totalPages ? 0 : prev));
  }, [totalPages]);

  // ── Auto-scroll (paused on hover) ──
  useEffect(() => {
    if (isHovered || totalPages <= 1) return;
    const timer = setInterval(() => {
      setCurrentPage((prev) => (prev + 1) % totalPages);
    }, 5000);
    return () => clearInterval(timer);
  }, [totalPages, isHovered]);

  const currentReviews = reviews.slice(
    currentPage * itemsPerPage,
    currentPage * itemsPerPage + itemsPerPage
  );

  // ── Loading skeleton ──
  if (loading) {
    return (
      <div className="w-full bg-[#fcf2d4ff] py-6 md:py-8 lg:py-12 px-4 sm:px-6 lg:px-10 xl:px-16 font-primary overflow-hidden shadow-md animate-pulse">
        <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-10">
          <div className="w-40 h-20 bg-amber-200/40 rounded-xl" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-amber-200/30 rounded-2xl" />
            ))}
          </div>
          <div className="w-32 h-24 bg-amber-200/40 rounded-xl" />
        </div>
      </div>
    );
  }

  if (reviews.length === 0) return null;

  return (
    <>
      <div className="w-full bg-[#fcf2d4ff] flex justify-center py-6 md:py-8 lg:py-12 px-4 sm:px-6 lg:px-10 xl:px-16 font-primary relative overflow-hidden shadow-md">
        <div className="relative z-10">
          <div className="w-full flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-10 max-w-[2000px]">

            {/* ══════ LEFT: Cursive Text ══════ */}
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left shrink-0 select-none">
              <span className="text-4xl lg:text-5xl xl:text-6xl text-black font-yesteryear leading-none transform -rotate-3">
                Real People
              </span>
              <span className="text-4xl lg:text-5xl xl:text-6xl text-black font-yesteryear leading-tight transform -rotate-1 mt-1">
                Real Moments
              </span>
            </div>

            {/* ══════ MIDDLE: Reviews Carousel ══════ */}
            <div
              className="w-full flex-1 flex flex-col justify-center overflow-hidden"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <div className="w-full overflow-hidden min-h-[140px] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${isMobile ? "m" : "d"}-${currentPage}`}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.45, ease: [0.25, 1, 0.5, 1] }}
                    className={`grid ${
                      isMobile
                        ? "grid-cols-1 max-w-xl mx-auto"
                        : "grid-cols-1 md:grid-cols-3"
                    } gap-4 md:gap-5 lg:gap-6 w-full`}
                  >
                    {currentReviews.map((review) => (
                      <ReviewCard
                        key={review.review_id || review.id}
                        review={review}
                        onSeeMore={setModalReview}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Carousel dots — mobile/tablet */}
              <div className="lg:hidden mt-4 sm:mt-5 w-full flex justify-center">
                <CarouselDots
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onChange={setCurrentPage}
                />
              </div>
            </div>

            {/* ══════ RIGHT: 1000+ Happy Customers ══════ */}
            <div className="flex flex-col items-center justify-center text-center shrink-0 select-none rounded-2xl sm:px-2 sm:py-2 min-w-[150px]">
              <div className="flex items-center gap-1 text-[#d4a005] text-sm mb-0.5">
                <span>✦</span>
                <span className="text-xl sm:text-3xl text-gray-800 font-yesteryear">
                  Over
                </span>
                <span>✦</span>
              </div>
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bowlby text-black tracking-tight leading-none my-0.5">
                1000+
              </div>
              <div className="text-2xl sm:text-3xl text-gray-800 font-yesteryear leading-tight mb-4 sm:mb-0">
                Happy Customers
              </div>
            </div>
          </div>

          {/* Carousel dots — desktop */}
          <div className="hidden lg:flex items-center justify-center mt-6 sm:mt-8">
            <CarouselDots
              totalPages={totalPages}
              currentPage={currentPage}
              onChange={setCurrentPage}
            />
          </div>
        </div>
      </div>

      {/* ══════ Review Detail Modal ══════ */}
      <AnimatePresence>
        {modalReview && (
          <ReviewModal
            review={modalReview}
            onClose={() => setModalReview(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default CustomerReviews;
