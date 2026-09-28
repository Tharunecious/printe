import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  BsArrowRight,
  BsStarFill,
  BsCheckCircleFill,
  BsPlayFill,
  BsXLg,
  BsCameraVideoOffFill,
} from "react-icons/bs";
import { IoHeartOutline } from "react-icons/io5";



const DynamicHero = () => {
  const dispatch = useDispatch();
  const { banners, isGettingBanners } = useSelector((state) => state.publicSlice);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isExploreHovered, setIsExploreHovered] = useState(false);
  const [videoModal, setVideoModal] = useState({ open: false, url: "" });
  const autoPlayRef = useRef(null);
  const videoRef = useRef(null);

  // 1. Fetch dynamic banners from backend if not already loaded
  useEffect(() => {
    if (!banners || banners.length === 0) {
      dispatch({ type: "GET_BANNERS" });
    }
  }, [dispatch, banners]);

  // 2. Filter visible banners
  const activeBanners = useMemo(() => {
    if (banners && Array.isArray(banners) && banners.length > 0) {
      const visible = banners
        .filter((b) => {
          if (b.is_visible === false) return false;
          if (b.expiry_date) {
            const exp = new Date(b.expiry_date);
            if (exp <= new Date()) return false;
          }
          return true;
        })
        .sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

      return visible;
    }
    return [];
  }, [banners]);

  // Ensure index stays in bounds
  useEffect(() => {
    if (currentIndex >= (activeBanners?.length || 0)) {
      setCurrentIndex(0);
    }
  }, [activeBanners?.length, currentIndex]);

  // 3. Auto slide — always runs every 5s, no pause on hover/click
  useEffect(() => {
    if (!activeBanners || activeBanners.length <= 1) return;

    autoPlayRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
    }, 5000);

    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [activeBanners?.length]);

  const currentBanner = activeBanners?.[currentIndex] || activeBanners?.[0];

  // const handlePrev = () => {
  //   setCurrentIndex((prev) =>
  //     prev === 0 ? activeBanners.length - 1 : prev - 1
  //   );
  // };

  // const handleNext = () => {
  //   setCurrentIndex((prev) => (prev + 1) % activeBanners.length);
  // };

  const getTargetLink = (item) => {
    if (!item?.banner_slug) return "/all-categories";
    const slug = item.banner_slug.trim();
    return slug.startsWith("/") ? slug : `/${slug}`;
  };

  const openVideoModal = useCallback((url) => {

    console.log("VIDEO URL:", url);

    setVideoModal({ open: true, url: url || "" });
  }, []);

  const closeVideoModal = useCallback(() => {
    setVideoModal({ open: false, url: "" });
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  }, []);

  // Close modal on Escape key
  useEffect(() => {
    if (!videoModal.open) return;
    const handleKey = (e) => { if (e.key === "Escape") closeVideoModal(); };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [videoModal.open, closeVideoModal]);

  // First word = black, rest = yellow, all inline (no block)
  const formatHeading = (title = "") => {
    const words = title.trim().split(" ");
    if (words.length <= 1) {
      return <span className="text-[#111827]">{title}</span>;
    }
    const first = words[0];
    const rest = words.slice(1).join(" ");
    return (
      <>
        <span className="text-[#111827] font-blackops">{first} </span>
        <span className="text-[#F4B817] font-blackops">{rest}</span>
      </>
    );
  };

  if (isGettingBanners) {
    return (
      <div
        className="w-full h-full relative overflow-hidden flex items-center justify-center animate-pulse"
        style={{
          background: "linear-gradient(to right, #f5f2e7ff 0%, #f8f2ddff 50%, #fcf2d4ff 100%)",
        }}
      >
        <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <div className="h-6 w-36 bg-amber-200/50 rounded-full" />
            <div className="h-12 w-3/4 bg-amber-200/40 rounded-xl" />
            <div className="h-8 w-1/2 bg-amber-200/30 rounded-xl" />
            <div className="grid grid-cols-2 gap-3 pt-4">
              <div className="h-5 bg-amber-200/30 rounded-md" />
              <div className="h-5 bg-amber-200/30 rounded-md" />
              <div className="h-5 bg-amber-200/30 rounded-md" />
              <div className="h-5 bg-amber-200/30 rounded-md" />
            </div>
            <div className="pt-4 flex gap-4">
              <div className="h-11 w-36 bg-amber-300/40 rounded-full" />
              <div className="h-11 w-36 bg-amber-200/30 rounded-full" />
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center">
            <div className="w-80 h-80 rounded-2xl bg-amber-200/30" />
          </div>
        </div>
      </div>
    );
  }

  if (!currentBanner) {
    return null;
  }

  return (
    <>
      <div
        className="w-full h-full relative overflow-hidden select-none flex flex-col"
        style={{
          background: "linear-gradient(to right, #fcf2d4ff 0%, #eceae2ff 100%)",
        }}
      >

        {/* ── TOP LEFT blob ── */}
        <div
          className="absolute top-0 left-0 pointer-events-none select-none z-0 overflow-hidden w-28 h-28 sm:w-44 sm:h-44 md:w-60 md:h-60 lg:w-60 lg:h-60"
          aria-hidden="true"
        >
          <svg viewBox="0 0 400 400" fill="none" className="w-full h-full">
            <path
              d="M-50 -50 C90 -50 170 30 150 130 C130 210 60 250 -50 220 Z"
              fill="#f5d256ff"
            />
          </svg>
        </div>

        {/* ── BOTTOM LEFT blob ── */}
        <div
          className="hidden lg:block absolute bottom-0 left-0 pointer-events-none select-none z-0 overflow-hidden w-28 h-24 sm:w-44 sm:h-36 md:w-56 md:h-44 lg:w-40 lg:h-40"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path
              d="M200 200 C135 165 122 125 104 85 C88 53 60 38 0 40 L0 200 Z"
              fill="#f5d256ff"
              transform="translate(-40 0)"
            />
          </svg>
        </div>

        {/* ── BOTTOM RIGHT blob ── */}
        <div
          className="absolute bottom-0 right-0 pointer-events-none select-none z-20 overflow-hidden w-28 h-24 sm:w-44 sm:h-36 md:w-60 md:h-48 lg:w-40 lg:h-40"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" fill="none" className="w-full h-full">
            <path
              d="M0 200 C65 165 78 125 96 85 C112 53 140 38 200 40 L200 200 Z"
              fill="#f5d256ff"
              transform="translate(40 0)"
            />
          </svg>
        </div>

        {/* ══════════════════════════════════════════════════════════════
          MAIN CONTENT: LEFT (text) | RIGHT (image)
          ══════════════════════════════════════════════════════════════ */}
        {/* Prev / Next buttons — absolutely centered vertically over full hero */}
        {/* {activeBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={handlePrev}
            className="absolute left-3 lg:left-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-amber-300/60 flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-md backdrop-blur-sm"
            aria-label="Previous banner"
          >
            <BsChevronLeft className="text-base" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="absolute right-3 lg:right-5 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-white/80 hover:bg-white border border-amber-300/60 flex items-center justify-center text-gray-700 hover:text-gray-900 shadow-md backdrop-blur-sm"
            aria-label="Next banner"
          >
            <BsChevronRight className="text-base" />
          </button>
        </>
      )} */}

        <div className="flex-1 min-h-0 w-full flex items-center relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:max-w-[2000px] mx-auto w-full h-full">
            {/* LEFT SIDE — Text Content */}
            <div className="flex flex-col justify-center items-start gap-2 sm:gap-3 lg:gap-5 xl:gap-6 w-full px-4 sm:px-8 lg:px-12 py-4 sm:py-4 lg:py-0 lg:pr-8">

              {/* Tag / Badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`tag-${currentBanner._id || currentIndex}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 lg:px-4 py-1 sm:py-1.5 rounded-full border border-amber-400/60 bg-amber-50 text-[#92400E] text-[10px] sm:text-xs lg:text-sm font-semibold shadow-sm"
                >
                  <IoHeartOutline className="text-amber-600 text-sm sm:text-base stroke-[2]" />
                  <span>
                    {currentBanner.tag || "Make Moments Special"}
                  </span>
                </motion.div>
              </AnimatePresence>

              {/* Main Heading */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`title-${currentBanner._id || currentIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  <h1 className="text-xl sm:text-3xl md:text-4xl lg:text-[48px] xl:text-[60px] font-blackops text-[#111827] lg:leading-[50px] tracking-tight">
                    {formatHeading(currentBanner.banner_name)}
                  </h1>
                </motion.div>
              </AnimatePresence>



              <AnimatePresence mode="wait">
                <motion.div
                  key={`title-${currentBanner._id || currentIndex}`}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35 }}
                >
                  {/* Allow only 250 characters */}
                  <p className="block text-[#7a7979] font-inter leading-[1.50] tracking-tight text-[10px] sm:text-[12px] lg:text-[14px] xl:text-[15px]">
                    {currentBanner.banner_description}

                  </p>
                </motion.div>
              </AnimatePresence>

              {/* Feature Bullets */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`features-${currentBanner._id || currentIndex}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3, delay: 0.05 }}
                  className="w-full"
                >
                  {Array.isArray(currentBanner.feature) &&
                    currentBanner.feature.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-2 gap-y-2 sm:gap-y-1 md:gap-y-2  lg:gap-y-3 gap-x-1 lg:gap-x-4">
                      {currentBanner.feature.map((feat, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-sm lg:text-[13px] xl:text-base text-gray-700 font-medium"
                        >
                          <BsCheckCircleFill className="text-amber-500 text-xs sm:text-sm lg:text-base flex-shrink-0" />

                          <span className="line-clamp-2 ">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Transform your cherished memories into exquisite prints
                      and personalized keepsakes.
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>



              {/* Rating */}
              {currentBanner.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <BsStarFill
                        key={i}
                        className="text-xs sm:text-sm lg:text-base"
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-gray-800">
                    {currentBanner.rating}
                  </span>
                </div>
              )}

              {/* CTA + Video Button */}
              <div className="flex flex-wrap items-center gap-2 sm:gap-3 pt-0.5 sm:pt-1">

                {/* Explore Button */}
                <Link
                  to={getTargetLink(currentBanner)}
                  className="group inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-full bg-[#f2c41a] text-[#111827] hover:text-[#111827] font-bold text-xs sm:text-sm shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
                  onMouseEnter={() => setIsExploreHovered(true)}
                  onMouseLeave={() => setIsExploreHovered(false)}
                >
                  <span>Explore Collection</span>

                  <motion.span
                    animate={
                      isExploreHovered
                        ? { x: [0, 6, 0] }
                        : { x: 0 }
                    }
                    transition={
                      isExploreHovered
                        ? {
                          duration: 0.55,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }
                        : {
                          duration: 0.2,
                        }
                    }
                    className="flex items-center"
                  >
                    <BsArrowRight className="text-xs sm:text-sm lg:text-base" />
                  </motion.span>
                </Link>

                {/* Watch Video Button */}
                <div className="relative w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 flex items-center justify-center">

                  {/* Ping Animation */}
                  <span className="absolute inset-0 rounded-full bg-amber-400/60 animate-ping" />

                  {/* Button */}
                  <button
                    type="button"
                    onClick={() => openVideoModal(currentBanner.videoUrl)}
                    className="relative w-9 h-9 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-full bg-white/95 hover:bg-white border border-amber-300/70 flex items-center justify-center text-[#111827] shadow-md hover:shadow-lg transition-all duration-200 z-10"
                    aria-label="Watch video"
                  >
                    <BsPlayFill className="text-base sm:text-lg ml-0.5" />
                  </button>

                </div>
              </div>
            </div>


            {/* RIGHT SIDE — Product Image */}
            <div className="relative w-full h-full min-h-[280px] sm:min-h-[350px] md:min-h-[400px] lg:min-h-0 flex items-center justify-center p-4 sm:p-6 lg:p-8">

              {/* ── Animated Paint Splash — behind the product image ── */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`splat-${currentBanner._id || currentIndex}`}
                  initial={{ opacity: 0, scale: 0.4 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none"
                  aria-hidden="true"
                >
                  <motion.div
                    className="w-[65%] sm:w-[58%] lg:w-[65%] max-w-[270px] sm:max-w-[315px] lg:max-w-[360px] xl:max-w-[400px] aspect-square flex items-center justify-center"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 40, ease: "linear", repeat: Infinity }}
                  >
                    <svg viewBox="0 0 500 520" xmlns="http://www.w3.org/2000/svg" className="w-full h-auto">
                      <defs>
                        <radialGradient id="splatFill" cx="48%" cy="44%" r="50%">
                          <stop offset="0%" stopColor="#f5d256" stopOpacity="0.52" />
                          <stop offset="55%" stopColor="#f2c41a" stopOpacity="0.38" />
                          <stop offset="100%" stopColor="#fbbf24" stopOpacity="0.14" />
                        </radialGradient>
                      </defs> 

                      {/* Paint splash — fat blob center with thick curved arms */}
                      <path
                        fill="url(#splatFill)"
                        d="M248,135 C252,130 256,98 260,72 C264,46 270,22 280,25 C290,28 286,55 280,80 C274,105 268,128 278,135 C288,142 310,128 330,110 C350,92 368,70 378,76 C388,82 375,100 358,118 C341,136 320,152 322,162 C324,172 352,168 380,162 C408,156 438,148 442,158 C446,168 422,178 398,185 C374,192 350,196 348,208 C346,220 372,228 398,240 C424,252 448,262 445,275 C442,288 418,282 395,272 C372,262 348,248 340,260 C332,272 345,298 352,330 C359,362 362,392 355,398 C348,404 338,385 330,358 C322,331 318,298 310,288 C302,278 296,288 292,318 C288,348 286,390 282,418 C278,446 274,462 268,462 C262,462 260,446 260,418 C260,390 264,348 258,318 C252,288 240,296 232,322 C224,348 216,390 212,415 C208,440 208,458 202,455 C196,452 196,430 200,405 C204,380 215,345 210,318 C205,291 192,298 178,318 C164,338 148,372 140,388 C132,404 124,406 122,395 C120,384 128,362 140,338 C152,314 168,286 162,272 C156,258 135,264 112,275 C89,286 60,302 52,295 C44,288 62,272 85,258 C108,244 138,232 145,222 C152,212 132,206 108,200 C84,194 52,188 48,180 C44,172 65,170 90,170 C115,170 148,174 158,166 C168,158 148,142 132,128 C116,114 98,100 102,92 C106,84 122,95 140,110 C158,125 175,142 188,146 C201,150 206,130 210,105 C214,80 218,45 226,40 C234,35 238,68 240,95 C242,122 244,140 248,135 Z"
                      />

                      {/* Drip 1 — bottom-left */}
                      <path
                        fill="url(#splatFill)"
                        d="M202,455 C200,462 196,478 198,492 C200,506 206,512 204,500 C202,488 198,472 200,460 Z"
                      />
                      {/* Drip 2 — bottom-center */}
                      <path
                        fill="url(#splatFill)"
                        d="M268,462 C266,470 264,488 266,505 C268,522 274,528 272,515 C270,502 268,482 268,468 Z"
                      />
                      {/* Drip 3 — bottom-right */}
                      <path
                        fill="url(#splatFill)"
                        d="M355,398 C356,408 358,425 356,438 C354,451 348,455 350,445 C352,435 354,418 354,405 Z"
                      />

                      {/* Scattered droplets inside the SVG */}
                      <circle cx="108" cy="82" r="8" fill="url(#splatFill)" opacity="0.5" />
                      <circle cx="420" cy="110" r="6" fill="url(#splatFill)" opacity="0.45" />
                      <circle cx="465" cy="245" r="7" fill="url(#splatFill)" opacity="0.4" />
                      <circle cx="62" cy="345" r="6" fill="url(#splatFill)" opacity="0.45" />
                      <circle cx="175" cy="490" r="5" fill="url(#splatFill)" opacity="0.4" />
                      <circle cx="330" cy="480" r="5" fill="url(#splatFill)" opacity="0.42" />
                      <circle cx="30" cy="200" r="5" fill="url(#splatFill)" opacity="0.38" />
                      <circle cx="470" cy="355" r="4" fill="url(#splatFill)" opacity="0.4" />
                      <circle cx="310" cy="510" r="4" fill="url(#splatFill)" opacity="0.35" />
                      <circle cx="80" cy="440" r="5" fill="url(#splatFill)" opacity="0.4" />
                    </svg>
                  </motion.div>
                </motion.div>
              </AnimatePresence>

              {/* Product Image */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`image-${currentBanner._id || currentIndex}`}
                  initial={{
                    opacity: 0,
                    scale: 0.94,
                  }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.96,
                  }}
                  transition={{
                    duration: 0.5,
                    ease: "easeOut",
                  }}
                  className="relative z-10 w-full h-full flex items-center justify-center"
                >
                  <img
                    src={currentBanner.banner_image}
                    alt={currentBanner.banner_name || "Featured product"}
                    className="max-w-[65%] sm:max-w-[58%] lg:max-w-[65%] xl:max-w-[70%] max-h-[195px] sm:max-h-[255px] md:max-h-[315px] lg:max-h-[52vh] xl:max-h-[58vh] w-auto h-auto object-contain object-center drop-shadow-2xl select-none"
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>

            </div>

          </div>
        </div>

        {/* ── Pagination Dots — absolute bottom-center of the hero ── */}
        {activeBanners.length > 1 && (
          <div className="absolute bottom-3 sm:bottom-5 lg:bottom-6 left-1/2 -translate-x-1/2 z-30 flex justify-center items-center">
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full ">
              {activeBanners.map((_, index) => {
                const isActive = currentIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={`rounded-full transition-all duration-300 ${isActive
                      ? "w-7 h-2 bg-[#f2ca12] shadow-sm"
                      : "w-2 h-2 bg-gray-400 hover:bg-[#f2ca12]"
                      }`}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Video Modal ── */}
      <AnimatePresence>
        {videoModal.open && (
          <motion.div
            key="video-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[999] flex items-center justify-center bg-black/75 backdrop-blur-sm px-4"
            onClick={closeVideoModal}
          >
            <motion.div
              key="video-modal-content"
              initial={{ opacity: 0, scale: 0.92, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 24 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="relative w-full max-w-xs sm:max-w-lg md:max-w-2xl lg:max-w-4xl rounded-2xl overflow-hidden shadow-2xl bg-black"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={closeVideoModal}
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 flex items-center justify-center text-white transition-colors"
                aria-label="Close video"
              >
                <BsXLg className="text-xs sm:text-sm" />
              </button>

              {videoModal.url ? (
                <video
                  ref={videoRef}
                  src={videoModal.url}
                  controls
                  autoPlay
                  className="w-full aspect-video object-contain bg-black"
                />
              ) : (
                /* No Video Available */
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 aspect-video bg-[#111827] text-center px-6">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                    <BsCameraVideoOffFill className="text-2xl sm:text-3xl lg:text-4xl text-gray-500" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm sm:text-base lg:text-lg">No Video Available</p>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">No video has been added for this product yet.</p>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default DynamicHero;