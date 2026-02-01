import { useContext, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../App";
import AnimationWrapper from "../common/page-animation";
import Loader from "../components/loader.component";
import { Toaster, toast } from "react-hot-toast";
import { getDay } from "../common/date";
import BackButton from "../components/back-button.component";

const ManageCategories = () => {
    const { userAuth: { access_token, isAdmin } } = useContext(UserContext);
    const [categories, setCategories] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editCategory, setEditCategory] = useState(null);
    const [formData, setFormData] = useState({ name: "", description: "" });
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (access_token && isAdmin) {
            fetchCategories();
        }
    }, [access_token, isAdmin]);

    const fetchCategories = async () => {
        try {
            const { data } = await axios.get(
                import.meta.env.VITE_SERVER_DOMAIN + "/admin/categories",
                {
                    headers: { Authorization: `Bearer ${access_token}` }
                }
            );
            setCategories(data.categories);
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to load categories");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.name || formData.name.length < 2) {
            return toast.error("Category name must be at least 2 characters");
        }

        setSubmitting(true);

        try {
            if (editCategory) {
                await axios.post(
                    import.meta.env.VITE_SERVER_DOMAIN + "/update-category",
                    { categoryId: editCategory._id, ...formData },
                    { headers: { Authorization: `Bearer ${access_token}` } }
                );
                toast.success("Category updated successfully");
            } else {
                await axios.post(
                    import.meta.env.VITE_SERVER_DOMAIN + "/create-category",
                    formData,
                    { headers: { Authorization: `Bearer ${access_token}` } }
                );
                toast.success("Category created successfully");
            }
            fetchCategories();
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.error || "Something went wrong");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (categoryId) => {
        if (!window.confirm("Are you sure you want to delete this category?")) {
            return;
        }

        try {
            await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/delete-category",
                { categoryId },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );
            toast.success("Category deleted successfully");
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to delete category");
        }
    };

    const handleToggleActive = async (category) => {
        try {
            await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/update-category",
                { categoryId: category._id, isActive: !category.isActive },
                { headers: { Authorization: `Bearer ${access_token}` } }
            );
            toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
            fetchCategories();
        } catch (err) {
            toast.error(err.response?.data?.error || "Failed to update category");
        }
    };

    const openModal = (category = null) => {
        if (category) {
            setEditCategory(category);
            setFormData({ name: category.name, description: category.description || "" });
        } else {
            setEditCategory(null);
            setFormData({ name: "", description: "" });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditCategory(null);
        setFormData({ name: "", description: "" });
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
                        <h1 className="text-3xl font-bold">Manage Categories</h1>
                        <p className="text-dark-grey mt-1">Create and manage blog categories</p>
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="btn-dark py-2 px-4"
                    >
                        <i className="fi fi-rr-plus mr-2"></i>
                        New Category
                    </button>
                </div>

                {loading ? (
                    <Loader />
                ) : categories && categories.length ? (
                    <div className="card overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-grey/30">
                                <tr className="text-left">
                                    <th className="p-4 font-medium">Name</th>
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium text-center">Blogs</th>
                                    <th className="p-4 font-medium text-center">Status</th>
                                    <th className="p-4 font-medium">Created</th>
                                    <th className="p-4 font-medium text-center">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {categories.map((category, i) => (
                                    <tr key={i} className="border-t border-grey/50 hover:bg-grey/10">
                                        <td className="p-4">
                                            <span className="font-medium capitalize">{category.name}</span>
                                            <p className="text-dark-grey text-sm">/{category.slug}</p>
                                        </td>
                                        <td className="p-4 text-dark-grey max-w-xs truncate">
                                            {category.description || "-"}
                                        </td>
                                        <td className="p-4 text-center">{category.blogCount}</td>
                                        <td className="p-4 text-center">
                                            <span className={`px-3 py-1 rounded-full text-sm ${
                                                category.isActive 
                                                    ? 'bg-green/10 text-green' 
                                                    : 'bg-red/10 text-red'
                                            }`}>
                                                {category.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-dark-grey text-sm">
                                            {getDay(category.createdAt)}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => openModal(category)}
                                                    className="p-2 hover:bg-purple/10 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <i className="fi fi-rr-edit text-purple"></i>
                                                </button>
                                                <button
                                                    onClick={() => handleToggleActive(category)}
                                                    className="p-2 hover:bg-yellow-500/10 rounded-lg transition-colors"
                                                    title={category.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    <i className={`fi ${category.isActive ? 'fi-rr-eye-crossed' : 'fi-rr-eye'} text-yellow-600`}></i>
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(category._id)}
                                                    className="p-2 hover:bg-red/10 rounded-lg transition-colors"
                                                    title="Delete"
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
                ) : (
                    <div className="card p-10 text-center">
                        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-grey/30 flex items-center justify-center">
                            <i className="fi fi-rr-apps text-dark-grey text-3xl"></i>
                        </div>
                        <h3 className="text-xl font-medium mb-2">No categories yet</h3>
                        <p className="text-dark-grey mb-6">Create your first category to organize your blogs</p>
                        <button onClick={() => openModal()} className="btn-dark py-2 px-6">
                            Create Category
                        </button>
                    </div>
                )}

                {/* Modal */}
                {showModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="card p-6 w-full max-w-md animate-fade-in">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold">
                                    {editCategory ? 'Edit Category' : 'New Category'}
                                </h2>
                                <button
                                    onClick={closeModal}
                                    className="p-2 hover:bg-grey/30 rounded-lg"
                                >
                                    <i className="fi fi-rr-cross-small"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium mb-2">
                                        Category Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="input-box"
                                        placeholder="e.g., Technology"
                                    />
                                </div>

                                <div className="mb-6">
                                    <label className="block text-sm font-medium mb-2">
                                        Description
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="input-box resize-none h-24"
                                        placeholder="Brief description of the category"
                                        maxLength={200}
                                    />
                                    <p className="text-dark-grey text-xs mt-1">
                                        {formData.description.length}/200 characters
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="btn-light flex-1 py-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="btn-dark flex-1 py-3 flex items-center justify-center gap-2"
                                    >
                                        {submitting ? (
                                            <>
                                                <i className="fi fi-rr-spinner animate-spin"></i>
                                                Saving...
                                            </>
                                        ) : (
                                            editCategory ? 'Update' : 'Create'
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </AnimationWrapper>
    );
};

export default ManageCategories;
