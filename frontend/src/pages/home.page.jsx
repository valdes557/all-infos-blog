import axios from "axios";
import AnimationWrapper from "../common/page-animation";
import InPageNavigation from "../components/inpage-navigation.component";
import { useEffect, useState } from "react";
import Loader from "../components/loader.component";
import BlogPostCard from "../components/blog-post.component";
import MinimalBlogPost from "../components/nobanner-blog-post.component";
import { activeTabRef } from "../components/inpage-navigation.component";
import NoDataMessage from "../components/nodata.component";
import { filterPaginationData } from "../common/filter-pagination-data";
import LoadMoreDataBtn from "../components/load-more.component";
import { useLanguage } from "../common/LanguageContext";

const HomePage = () => {
    const { t } = useLanguage();
    let [blogs, setBlog] = useState(null);
    let [trendingBlogs, setTrendingBlog] = useState(null);
    let [pageState, setPageState] = useState("home");
    let [categories, setCategories] = useState([]);

    const fetchLatestBlogs = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/latest-blogs", { page })
            .then( async ({ data }) => {

                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/all-latest-blogs-count"
                })

                setBlog(formatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const fetchBlogsByCategory = ({ page = 1 }) => {
        axios
            .post(import.meta.env.VITE_SERVER_DOMAIN + "/search-blogs", { tag: pageState, page })
            .then( async ({ data }) => {
                
                let formatedData = await filterPaginationData({
                    state: blogs,
                    data: data.blogs,
                    page,
                    countRoute: "/search-blogs-count",
                    data_to_send: { tag: pageState }
                })

                setBlog(formatedData);
            })
            .catch((err) => {
                console.log(err);
            });
    }

    const fetchTrendingBlogs = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/trending-blogs")
            .then(({ data }) => {
                setTrendingBlog(data.blogs);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const fetchCategories = () => {
        axios
            .get(import.meta.env.VITE_SERVER_DOMAIN + "/categories")
            .then(({ data }) => {
                setCategories(data.categories);
            })
            .catch((err) => {
                console.log(err);
            });
    };

    const loadBlogByCategory = (e) => {
        
        let category = e.target.innerText.toLowerCase(); 

        setBlog(null);

        if(pageState == category){
            setPageState("home");
            return;
        }

        setPageState(category);

    }

    useEffect(() => {

        activeTabRef.current.click();

        if(pageState == "home"){
            fetchLatestBlogs({ page: 1 });
        } else {
            fetchBlogsByCategory({ page: 1 })
        }

        if(!trendingBlogs){
            fetchTrendingBlogs();
        }

        if(!categories.length){
            fetchCategories();
        }

    }, [pageState]);

    return (
        <AnimationWrapper>
            {/* Hero Section */}
            <section className="relative overflow-hidden bg-gradient-to-br from-purple/5 via-white to-secondary/5 py-16 md:py-24">
                {/* Background Decorations */}
                <div className="absolute top-0 left-0 w-72 h-72 bg-purple/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
                
                <div className="relative max-w-4xl mx-auto text-center px-4">
                    <span className="inline-block px-4 py-2 rounded-full bg-purple/10 text-purple font-medium text-sm mb-6 animate-fade-in">
                        {t('hero.welcome')}
                    </span>
                    <h1 className="font-poppins text-4xl md:text-5xl lg:text-6xl font-bold text-black mb-6 leading-tight animate-slide-up">
                        {t('hero.title')}
                        <span className="gradient-text block mt-2">{t('hero.titleHighlight')}</span>
                    </h1>
                    <p className="text-dark-grey text-xl md:text-2xl max-w-2xl mx-auto mb-10 animate-fade-in">
                        {t('hero.subtitle')}
                    </p>
                    
                    {/* Stats */}
                    <div className="flex flex-wrap justify-center gap-8 md:gap-16">
                        <div className="text-center animate-fade-in">
                            <span className="block text-3xl md:text-4xl font-bold gradient-text">500+</span>
                            <span className="text-dark-grey text-sm">{t('hero.articles')}</span>
                        </div>
                        <div className="text-center animate-fade-in">
                            <span className="block text-3xl md:text-4xl font-bold gradient-text">50K+</span>
                            <span className="text-dark-grey text-sm">{t('hero.readers')}</span>
                        </div>
                        <div className="text-center animate-fade-in">
                            <span className="block text-3xl md:text-4xl font-bold gradient-text">100+</span>
                            <span className="text-dark-grey text-sm">{t('hero.writers')}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="h-cover flex justify-center gap-10 py-10">
                {/* Latest Blogs */}
                <div className="w-full max-w-[900px]">
                    <InPageNavigation
                        routes={[ pageState === 'home' ? t('common.home') : pageState , t('common.trendingBlogs')]}
                        defaultHidden={[t('common.trendingBlogs')]}
                    >
                        <>
                            {blogs == null ? (
                                <Loader />
                            ) : (
                                blogs.results.length ? 
                                    blogs.results.map((blog, i) => {
                                        return (
                                            <AnimationWrapper
                                                transition={{
                                                    duration: 1,
                                                    delay: i * 0.1,
                                                }}
                                                key={i}
                                            >
                                                <BlogPostCard
                                                    content={blog}
                                                    author={
                                                        blog.author.personal_info
                                                    }
                                                />
                                            </AnimationWrapper>
                                        );
                                    })
                                : <NoDataMessage message={t('blog.noBlogs')} />
                            )}
                            <LoadMoreDataBtn state={blogs} fetchDataFun={( pageState == "home" ? fetchLatestBlogs : fetchBlogsByCategory )} />
                        </>

                        {trendingBlogs == null ? (
                            <Loader />
                        ) : (
                            trendingBlogs.length ?
                                trendingBlogs.map((blog, i) => {
                                    return (
                                        <AnimationWrapper
                                            transition={{
                                                duration: 1,
                                                delay: i * 0.1,
                                            }}
                                            key={i}
                                        >
                                            <MinimalBlogPost
                                                blog={blog}
                                                index={i}
                                            />
                                        </AnimationWrapper>
                                    );
                                })
                            : <NoDataMessage message={t('blog.noTrending')} />
                        )}
                    </InPageNavigation>
                </div>

                {/* Sidebar - Filters and Trending */}
                <div className="min-w-[40%] lg:min-w-[400px] max-w-min max-md:hidden">
                    <div className="sticky top-24 flex flex-col gap-10">
                        {/* Categories Card */}
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center">
                                    <i className="fi fi-rr-apps text-white"></i>
                                </div>
                                <h2 className="font-poppins font-semibold text-xl">
                                    {t('categories.title')}
                                </h2>
                            </div>

                            <div className="flex gap-3 flex-wrap">
                                {categories.length ? categories.map((category, i) => {
                                    return (
                                        <button 
                                            onClick={loadBlogByCategory} 
                                            className={"tag " + (pageState == category.name ? "bg-gradient-primary text-white border-transparent" : "")} 
                                            key={i}
                                        >
                                            {category.name}
                                        </button>
                                    );
                                }) : (
                                    <p className="text-dark-grey text-sm">No categories available</p>
                                )}
                            </div>
                        </div>

                        {/* Trending Card */}
                        <div className="card p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-gradient-secondary flex items-center justify-center">
                                    <i className="fi fi-rr-arrow-trend-up text-white"></i>
                                </div>
                                <h2 className="font-poppins font-semibold text-xl">
                                    {t('categories.trending')}
                                </h2>
                            </div>

                            {trendingBlogs == null ? (
                                <Loader />
                            ) : (
                                trendingBlogs.length ? 
                                    <div className="space-y-1">
                                        {trendingBlogs.map((blog, i) => {
                                            return (
                                                <AnimationWrapper
                                                    transition={{
                                                        duration: 1,
                                                        delay: i * 0.1,
                                                    }}
                                                    key={i}
                                                >
                                                    <MinimalBlogPost
                                                        blog={blog}
                                                        index={i}
                                                    />
                                                </AnimationWrapper>
                                            );
                                        })}
                                    </div>
                                : <NoDataMessage message={t('blog.noTrending')} />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );
};

export default HomePage;
