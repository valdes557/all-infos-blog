import { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import BackButton from "../components/back-button.component";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!password.length || password.length < 3) {
            return toast.error("Password must be at least 3 characters long");
        }
        if (password !== confirmPassword) {
            return toast.error("Passwords do not match");
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + `/reset-password/${token}`,
                { password }
            );
            toast.success(data.message);
            setResetSuccess(true);
            setTimeout(() => {
                navigate("/signin");
            }, 3000);
        } catch (err) {
            toast.error(err.response?.data?.error || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimationWrapper>
            <section className="h-cover flex items-center justify-center py-10">
                <Toaster />

                <div className="w-[90%] max-w-[450px]">
                    <div className="relative">
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
                    </div>

                    <div className="relative card p-8 md:p-10">
                        <BackButton className="mb-6" />

                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                                <i className="fi fi-rr-lock text-white text-2xl"></i>
                            </div>
                        </div>

                        <h1 className="text-3xl font-poppins font-bold text-center mb-3">
                            Reset Password
                        </h1>
                        <p className="text-dark-grey text-center mb-10">
                            {resetSuccess
                                ? "Your password has been reset successfully!"
                                : "Enter your new password below"}
                        </p>

                        {!resetSuccess ? (
                            <form onSubmit={handleSubmit}>
                                <InputBox
                                    name="password"
                                    type="password"
                                    placeholder="New Password"
                                    icon="fi-rr-key"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />

                                <InputBox
                                    name="confirmPassword"
                                    type="password"
                                    placeholder="Confirm New Password"
                                    icon="fi-rr-lock"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />

                                <button
                                    className="btn-dark w-full mt-8 py-4 flex items-center justify-center gap-2"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fi fi-rr-spinner animate-spin"></i>
                                            Resetting...
                                        </>
                                    ) : (
                                        "Reset Password"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green/10 flex items-center justify-center">
                                    <i className="fi fi-rr-check text-green text-3xl"></i>
                                </div>
                                <p className="text-dark-grey mb-6">
                                    Redirecting to sign in page...
                                </p>
                            </div>
                        )}

                        <p className="mt-8 text-dark-grey text-center">
                            Remember your password?
                            <Link
                                to="/signin"
                                className="text-purple font-medium ml-1 hover:underline"
                            >
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </section>
        </AnimationWrapper>
    );
};

export default ResetPassword;
