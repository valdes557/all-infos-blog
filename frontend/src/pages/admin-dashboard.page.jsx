import { useContext, useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import { getDay } from "../common/date";
import BackButton from "../components/back-button.component";

const StatCard = ({ icon, label, value, trend, trendUp, bgColor }) => (
    <div className="card p-6 hover:shadow-lg transition-shadow">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-dark-grey text-sm mb-1">{label}</p>
                <h3 className="text-3xl font-bold">{value?.toLocaleString() || 0}</h3>
                {trend !== undefined && (
                    <p className={`text-sm mt-2 flex items-center gap-1 ${trendUp ? 'text-green' : 'text-red'}`}>
                        <i className={`fi ${trendUp ? 'fi-rr-arrow-trend-up' : 'fi-rr-arrow-trend-down'}`}></i>
                        {trend} this week
                    </p>
                )}
            </div>
            <div className={`w-14 h-14 rounded-2xl ${bgColor} flex items-center justify-center`}>
                <i className={`fi ${icon} text-white text-xl`}></i>
            </div>
        </div>
    </div>
);

const AdminDashboard = () => {
    const { userAuth: { access_token, isAdmin } } = useContext(UserContext);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (access_token && isAdmin) {
            fetchAnalytics();
        }
    }, [access_token, isAdmin]);

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN + "/admin/analytics",
                {
                    headers: { Authorization: `Bearer ${access_token}` }
                }
            );
            setAnalytics(data);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to load analytics");
        } finally {
            setLoading(false);
        }
    };

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return (
        <AnimationWrapper>
            <Toaster />
            <div className="w-full">
                <BackButton className="mb-6" />
                
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                        <p className="text-dark-grey mt-1">Overview of your platform</p>
                    </div>
                    <div className="flex gap-3">
                        <Link to="/admin/users" className="btn-light py-2 px-4">
                            <i className="fi fi-rr-users mr-2"></i>
                            Manage Users
                        </Link>
                        <Link to="/admin/categories" className="btn-dark py-2 px-4">
                            <i className="fi fi-rr-apps mr-2"></i>
                            Categories
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : analytics ? (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                icon="fi-rr-users"
                                label="Total Users"
                                value={analytics.stats.totalUsers}
                                trend={`+${analytics.stats.newUsersThisWeek}`}
                                trendUp={true}
                                bgColor="bg-gradient-primary"
                            />
                            <StatCard
                                icon="fi-rr-document"
                                label="Published Blogs"
                                value={analytics.stats.totalBlogs}
                                trend={`+${analytics.stats.newBlogsThisWeek}`}
                                trendUp={true}
                                bgColor="bg-gradient-secondary"
                            />
                            <StatCard
                                icon="fi-rr-eye"
                                label="Total Reads"
                                value={analytics.stats.totalReads}
                                bgColor="bg-blue-500"
                            />
                            <StatCard
                                icon="fi-rr-heart"
                                label="Total Likes"
                                value={analytics.stats.totalLikes}
                                bgColor="bg-red"
                            />
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                icon="fi-rr-comment-dots"
                                label="Total Comments"
                                value={analytics.stats.totalComments}
                                bgColor="bg-yellow-500"
                            />
                            <StatCard
                                icon="fi-rr-apps"
                                label="Categories"
                                value={analytics.stats.totalCategories}
                                bgColor="bg-green"
                            />
                            <StatCard
                                icon="fi-rr-file-edit"
                                label="Drafts"
                                value={analytics.stats.totalDrafts}
                                bgColor="bg-dark-grey"
                            />
                        </div>

                        {/* Tables */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Recent Users */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Recent Users</h2>
                                    <Link to="/admin/users" className="text-purple hover:underline text-sm">
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {analytics.recentUsers.map((user, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-grey/30 transition-colors">
                                            <img
                                                src={user.personal_info.profile_img}
                                                className="w-10 h-10 rounded-full"
                                                alt={user.personal_info.username}
                                            />
                                            <div className="flex-1">
                                                <p className="font-medium capitalize">{user.personal_info.fullname}</p>
                                                <p className="text-dark-grey text-sm">@{user.personal_info.username}</p>
                                            </div>
                                            <span className="text-dark-grey text-sm">{getDay(user.joinedAt)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Recent Blogs */}
                            <div className="card p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Recent Blogs</h2>
                                    <Link to="/dashboard/blogs" className="text-purple hover:underline text-sm">
                                        View All
                                    </Link>
                                </div>
                                <div className="space-y-4">
                                    {analytics.recentBlogs.map((blog, i) => (
                                        <Link 
                                            key={i} 
                                            to={`/blog/${blog.blog_id}`}
                                            className="flex items-center gap-4 p-3 rounded-xl hover:bg-grey/30 transition-colors"
                                        >
                                            <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center">
                                                <i className="fi fi-rr-document text-purple"></i>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium line-clamp-1">{blog.title}</p>
                                                <p className="text-dark-grey text-sm">
                                                    by @{blog.author.personal_info.username}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm flex items-center gap-1">
                                                    <i className="fi fi-rr-eye text-dark-grey"></i>
                                                    {blog.activity.total_reads}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Top Blogs */}
                            <div className="card p-6 lg:col-span-2">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold">Top Performing Blogs</h2>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="text-left text-dark-grey border-b border-grey">
                                                <th className="pb-4 font-medium">Title</th>
                                                <th className="pb-4 font-medium">Author</th>
                                                <th className="pb-4 font-medium text-center">Reads</th>
                                                <th className="pb-4 font-medium text-center">Likes</th>
                                                <th className="pb-4 font-medium text-center">Comments</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {analytics.topBlogs.map((blog, i) => (
                                                <tr key={i} className="border-b border-grey/50 hover:bg-grey/20">
                                                    <td className="py-4">
                                                        <Link to={`/blog/${blog.blog_id}`} className="hover:text-purple line-clamp-1">
                                                            {blog.title}
                                                        </Link>
                                                    </td>
                                                    <td className="py-4 text-dark-grey">
                                                        @{blog.author.personal_info.username}
                                                    </td>
                                                    <td className="py-4 text-center">{blog.activity.total_reads}</td>
                                                    <td className="py-4 text-center">{blog.activity.total_likes}</td>
                                                    <td className="py-4 text-center">{blog.activity.total_comments}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-dark-grey text-center py-10">Failed to load analytics</p>
                )}
            </div>
        </AnimationWrapper>
    );
};

export default AdminDashboard;
