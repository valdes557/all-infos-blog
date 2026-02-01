import { useState } from "react";
import { Link } from "react-router-dom";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import BackButton from "../components/back-button.component";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

        if (!email.length) {
            return toast.error("Please enter your email");
        }
        if (!emailRegex.test(email)) {
            return toast.error("Please enter a valid email");
        }

        setLoading(true);

        try {
            const { data } = await axios.post(
                import.meta.env.VITE_SERVER_DOMAIN + "/forgot-password",
                { email }
            );
            toast.success(data.message);
            setEmailSent(true);
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
                                <i className="fi fi-rr-key text-white text-2xl"></i>
                            </div>
                        </div>

                        <h1 className="text-3xl font-poppins font-bold text-center mb-3">
                            Forgot Password?
                        </h1>
                        <p className="text-dark-grey text-center mb-10">
                            {emailSent
                                ? "Check your email for reset instructions"
                                : "Enter your email and we'll send you a reset link"}
                        </p>

                        {!emailSent ? (
                            <form onSubmit={handleSubmit}>
                                <InputBox
                                    name="email"
                                    type="email"
                                    placeholder="Email address"
                                    icon="fi-rr-envelope"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />

                                <button
                                    className="btn-dark w-full mt-8 py-4 flex items-center justify-center gap-2"
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <>
                                            <i className="fi fi-rr-spinner animate-spin"></i>
                                            Sending...
                                        </>
                                    ) : (
                                        "Send Reset Link"
                                    )}
                                </button>
                            </form>
                        ) : (
                            <div className="text-center">
                                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green/10 flex items-center justify-center">
                                    <i className="fi fi-rr-check text-green text-3xl"></i>
                                </div>
                                <p className="text-dark-grey mb-6">
                                    We've sent a password reset link to{" "}
                                    <span className="font-medium text-black">{email}</span>
                                </p>
                                <button
                                    onClick={() => {
                                        setEmailSent(false);
                                        setEmail("");
                                    }}
                                    className="text-purple hover:underline"
                                >
                                    Try another email
                                </button>
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

export default ForgotPassword;
