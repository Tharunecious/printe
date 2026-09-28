import React, { useEffect, useState } from "react";
import { getsubcat } from "../../helper/api_helper";
import _ from "lodash";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useNavigate } from "react-router-dom";
import { BsArrowRight } from "react-icons/bs";

const BrowseAll = () => {
  const [data, setData] = useState([]);
  const navigation = useNavigate();

  const fetchData = async () => {
    try {
      const result = await getsubcat();
      const subcategories = _.get(result, "data.data", []);
      setData(subcategories);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filterCat = data.filter((cat) => cat.show === true);

  return (
    <section className="py-10 sm:py-14 md:py-16 px-4 sm:px-8 bg-white text-black overflow-hidden flex justify-center">
      <div className="max-w-[2000px] w-full flex flex-col lg:flex-row items-center gap-8 lg:gap-10">
        {/* ---------- LEFT SIDE: Text Content + View All Button ---------- */}
        <div className="w-full lg:w-1/4 flex flex-col justify-center items-start text-left shrink-0">
          <span className="inline-block text-[#f2c41a] text-xs sm:text-sm font-bold tracking-wider uppercase mb-1">
            ------ EXPLORE OUR COLLECTION
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-[1.7rem] font-bowlby text-gray-900 mb-2 leading-tight">
            Shop By Category
          </h2>
          <span className="text-sm  text-gray-500 mb-5 leading-relaxed">
            Discover unique and personalized gifts made to make every moment memorable.
          </span>
          <button
            type="button"
            onClick={() => navigation("/all-categories")}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#f2c41a] hover:bg-[#e0b316] text-black font-bold text-xs sm:text-sm shadow-sm transition-all duration-200 cursor-pointer active:scale-95"
          >
            <span>View All Categories</span>
            <BsArrowRight className="text-sm" />
          </button>
        </div>

        {/* ---------- RIGHT SIDE: Category Carousel ---------- */}
        <div className="w-full lg:w-3/4 overflow-hidden min-w-0">
          <Swiper
            loop={true}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            modules={[Autoplay]}
            spaceBetween={16}
            breakpoints={{
              320: { slidesPerView: 2, spaceBetween: 12 },
              480: { slidesPerView: 2.5, spaceBetween: 14 },
              640: { slidesPerView: 3, spaceBetween: 16 },
              800: { slidesPerView: 4, spaceBetween: 16 },
              1280: { slidesPerView: 4.5, spaceBetween: 18 },
              1600: { slidesPerView: 5.5, spaceBetween: 20 },
              1920: { slidesPerView: 6.5, spaceBetween: 20 },
            }}
            className="w-full py-1"
          >
            {filterCat.map((category) => (
              <SwiperSlide key={category._id} className="!h-auto flex">
                <div
                  onClick={() =>
                    navigation(
                      `/category/${category.main_category_details?.[0]?.slug || "all"}/${_.get(
                        category,
                        "slug"
                      )}`
                    )
                  }
                  className="bg-[#FCF8ED] border border-amber-200/50 rounded-2xl p-3 sm:p-4 flex flex-col justify-between w-full h-full group transition-all duration-300 cursor-pointer select-none"
                >
                  {/* Image on top — bounded size */}
                  <div className="w-full aspect-square max-w-[180px] mx-auto rounded-xl overflow-hidden mb-3 bg-amber-100/30 flex items-center justify-center shrink-0">
                    <img
                      fetchpriority="high"
                      loading="eager"
                      src={category.sub_category_image}
                      alt={category.sub_category_name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Category Name + Arrow on bottom */}
                  <div className="flex items-center justify-between gap-2 pt-1 mt-auto">
                    <h3 className="text-xs sm:text-sm font-bold text-gray-900 capitalize group-hover:text-[#d4a005] transition-colors line-clamp-2 leading-tight">
                      {String(category.sub_category_name).toLowerCase()}
                    </h3>

                    <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-200/60 group-hover:bg-[#f2c41a] flex items-center justify-center text-gray-800 group-hover:text-black shrink-0 transition-all duration-300">
                      <BsArrowRight className="text-xs sm:text-sm group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
};

export default BrowseAll;
