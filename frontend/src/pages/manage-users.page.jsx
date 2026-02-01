import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import { getDay } from "../common/date";
import BackButton from "../components/back-button.component";
import NoDataMessage from "../components/nodata.component";

const ManageUsers = () => {
    const { userAuth: { access_token, isAdmin, username: currentUsername } } = useContext(UserContext);
    const [users, setUsers] = useState(null);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalDocs, setTotalDocs] = useState(0);
    const [query, setQuery] = useState("");
    const [filter, setFilter] = useState("all");
    const [searchTimeout, setSearchTimeout] = useState(null);

    useEffect(() => {
        if (access_token && isAdmin) {
            fetchUsers();
        }
    }, [access_token, isAdmin, page, filter]);

    const fetchUsers = async (searchQuery = query) => {
        setLoading(true);
        try {
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/admin/users",
                { page, query: searchQuery, filter },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );
            setUsers(data.users);
            setTotalDocs(data.totalDocs);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        const searchQuery = e.target.value;
        setQuery(searchQuery);

        if (searchTimeout) {
            clearTimeout(searchTimeout);
        }

        setSearchTimeout(
            setTimeout(() => {
                setPage(1);
                fetchUsers(searchQuery);
            }, 500)
        );
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setPage(1);
    };

    const handleToggleAdmin = async (user) => {
        if (user.personal_info.username === currentUsername) {
            return toast.error("You cannot change your own role");
        }

        const action = user.admin ? "remove admin rights from" : "make admin";
        if (!window.confirm(`Are you sure you want to ${action} ${user.personal_info.username}?`)) {
            return;
        }

        try {
            await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/admin/update-user-role",
                { userId: user._id, isAdmin: !user.admin },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );
            toast.success(`User role updated successfully`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update user role");
        }
    };

    const handleDeleteUser = async (user) => {
        if (user.personal_info.username === currentUsername) {
            return toast.error("You cannot delete your own account");
        }

        if (!window.confirm(`Are you sure you want to delete ${user.personal_info.username}? This will also delete all their blogs and comments.`)) {
            return;
        }

        try {
            await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/admin/delete-user",
                { userId: user._id },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete user");
        }
    };

    const maxPages = Math.ceil(totalDocs / 10);

    if (!isAdmin) {
        return <Navigate to="/" />;
    }

    return (
        <AnimationWrapper>
            <Toaster />
            <div className="w-full">
                <BackButton className="mb-6" />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold">Manage Users</h1>
                        <p className="text-dark-grey mt-1">{totalDocs} total users</p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative">
                            <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-dark-grey"></i>
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={query}
                                onChange={handleSearch}
                                className="input-box pl-11 pr-4 py-2 w-full sm:w-64"
                            />
                        </div>

                        {/* Filter */}
                        <select
                            value={filter}
                            onChange={(e) => handleFilterChange(e.target.value)}
                            className="input-box py-2 px-4"
                        >
                            <option value="all">All Users</option>
                            <option value="admin">Admins Only</option>
                            <option value="user">Users Only</option>
                        </select>
                    </div>
                </div>

                {loading ? (
                    <Loader />
                ) : users && users.length ? (
                    <>
                        <div className="card overflow-x-auto">
                            <table className="w-full min-w-[800px]">
                                <thead className="bg-grey/30">
                                    <tr className="text-left">
                                        <th className="p-4 font-medium">User</th>
                                        <th className="p-4 font-medium">Email</th>
                                        <th className="p-4 font-medium text-center">Posts</th>
                                        <th className="p-4 font-medium text-center">Reads</th>
                                        <th className="p-4 font-medium text-center">Role</th>
                                        <th className="p-4 font-medium">Joined</th>
                                        <th className="p-4 font-medium text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user, i) => (
                                        <tr key={i} className="border-t border-grey/50 hover:bg-grey/10">
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={user.personal_info.profile_img}
                                                        className="w-10 h-10 rounded-full"
                                                        alt={user.personal_info.username}
                                                    />
                                                    <div>
                                                        <p className="font-medium capitalize">
                                                            {user.personal_info.fullname}
                                                        </p>
                                                        <p className="text-dark-grey text-sm">
                                                            @{user.personal_info.username}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-dark-grey">
                                                {user.personal_info.email}
                                                {user.google_auth && (
                                                    <span className="ml-2 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                                                        Google
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-4 text-center">
                                                {user.account_info.total_posts}
                                            </td>
                                            <td className="p-4 text-center">
                                                {user.account_info.total_reads}
                                            </td>
                                            <td className="p-4 text-center">
                                                <span className={`px-3 py-1 rounded-full text-sm ${
                                                    user.admin 
                                                        ? 'bg-purple/10 text-purple' 
                                                        : 'bg-grey text-dark-grey'
                                                }`}>
                                                    {user.admin ? 'Admin' : 'User'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-dark-grey text-sm">
                                                {getDay(user.joinedAt)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleAdmin(user)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            user.personal_info.username === currentUsername
                                                                ? 'opacity-50 cursor-not-allowed'
                                                                : 'hover:bg-purple/10'
                                                        }`}
                                                        title={user.admin ? 'Remove Admin' : 'Make Admin'}
                                                        disabled={user.personal_info.username === currentUsername}
                                                    >
                                                        <i className={`fi ${user.admin ? 'fi-rr-shield-check' : 'fi-rr-shield'} text-purple`}></i>
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className={`p-2 rounded-lg transition-colors ${
                                                            user.personal_info.username === currentUsername
                                                                ? 'opacity-50 cursor-not-allowed'
                                                                : 'hover:bg-red/10'
                                                        }`}
                                                        title="Delete User"
                                                        disabled={user.personal_info.username === currentUsername}
                                                    >
                                                        <i className="fi fi-rr-trash text-red"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {maxPages > 1 && (
                            <div className="flex items-center justify-center gap-2 mt-6">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="btn-light py-2 px-4 disabled:opacity-50"
                                >
                                    <i className="fi fi-rr-arrow-left"></i>
                                </button>
                                <span className="px-4 py-2 text-dark-grey">
                                    Page {page} of {maxPages}
                                </span>
                                <button
                                    onClick={() => setPage(p => Math.min(maxPages, p + 1))}
                                    disabled={page === maxPages}
                                    className="btn-light py-2 px-4 disabled:opacity-50"
                                >
                                    <i className="fi fi-rr-arrow-right"></i>
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <NoDataMessage message="No users found" />
                )}
            </div>
        </AnimationWrapper>
    );
};

export default ManageUsers;
