import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import InputBox from "../components/input.component";
import googleIcon from "../imgs/google.png";
import { Link, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import axios from "axios";
import { storeInSession } from "../common/session";
import { UserContext } from "../App";
import { authWithGoogle } from "../common/firebase";
import { useLanguage } from "../common/LanguageContext";

const UserAuthForm = ({ type }) => {

    const { t } = useLanguage();
    let { userAuth: { access_token }, setUserAuth } = useContext(UserContext)

    const userAuthThroughServer = (serverRoute, formData) => {

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + serverRoute, formData)
        .then(({ data }) => {
            storeInSession("user", JSON.stringify(data))
            
            setUserAuth(data)
        })
        .catch(({ response }) => {
            toast.error(response.data.error)
        })

    }

    const handleSubmit = (e) => {

        e.preventDefault();

        let serverRoute = type == "sign-in" ? "/signin" : "/signup";

        let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email

        // formData
        let form = new FormData(formElement);
        let formData = {};

        for(let [key, value] of form.entries()){
            formData[key] = value;
        }

        let { fullname, email, password } = formData;

        // form validation

        if(fullname){
            if(fullname.length < 3){
                return toast.error("Fullname must be at least 3 letters long")
           }
        }
       if(!email.length){
            return toast.error("Enter Email" )
       }
       if(!emailRegex.test(email)){
            return toast.error("Email is invalid" )
       }
       if(!password || password.length < 3){
            return toast.error("Password must be at least 3 characters long")
       }

       userAuthThroughServer(serverRoute, formData)

    }

    const handleGoogleAuth = (e) => {

        e.preventDefault();

        authWithGoogle().then(user => {
            
            let serverRoute = "/google-auth";

            let formData = {
                access_token: user.accessToken
            }

            userAuthThroughServer(serverRoute, formData)

        })
        .catch(err => {
            toast.error('trouble login through google');
            return console.log(err)
        })

    }

    return (
        access_token ?
        <Navigate to="/" />
        :
        <AnimationWrapper keyValue={type}>
            <section className="h-cover flex items-center justify-center py-10">
                <Toaster />
                
                {/* Auth Card */}
                <div className="w-[90%] max-w-[450px]">
                    {/* Decorative Background */}
                    <div className="relative">
                        <div className="absolute -top-20 -left-20 w-40 h-40 bg-purple/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-secondary/10 rounded-full blur-3xl"></div>
                    </div>
                    
                    <form id="formElement" className="relative card p-8 md:p-10">
                        {/* Logo */}
                        <div className="flex justify-center mb-8">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-glow">
                                <span className="text-white font-bold text-3xl font-poppins">A</span>
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-poppins font-bold text-center mb-3">
                            {type == "sign-in" ? t('auth.welcomeBack') : t('auth.joinUs') }
                        </h1>
                        <p className="text-dark-grey text-center mb-10">
                            {type == "sign-in" ? t('auth.signInSubtitle') : t('auth.signUpSubtitle') }
                        </p>

                        {/* Form Fields */}
                        {
                            type != "sign-in" ?
                            <InputBox
                                name="fullname"
                                type="text"
                                placeholder={t('auth.fullName')}
                                icon="fi-rr-user"
                            />
                            : ""
                        }

                        <InputBox
                            name="email"
                            type="email"
                            placeholder={t('auth.email')}
                            icon="fi-rr-envelope"
                        />

                        <InputBox
                            name="password"
                            type="password"
                            placeholder={t('auth.password')}
                            icon="fi-rr-key"
                        />

                        {/* Submit Button */}
                        <button
                            className="btn-dark w-full mt-8 py-4"
                            type="submit"
                            onClick={handleSubmit}
                        >   
                            { type == "sign-in" ? t('auth.signInBtn') : t('auth.createAccount') }
                        </button>

                        {/* Divider */}
                        <div className="relative w-full flex items-center gap-4 my-8">
                            <hr className="flex-1 border-grey" />
                            <span className="text-dark-grey text-sm uppercase font-medium">{t('auth.or')}</span>
                            <hr className="flex-1 border-grey" />
                        </div>

                        {/* Google Button */}
                        <button className="btn-light flex items-center justify-center gap-3 w-full py-4
                                         border-2 border-grey hover:border-purple/30"
                            onClick={handleGoogleAuth}
                        >
                            <img src={googleIcon} className="w-5 h-5" />
                            <span>{t('auth.continueGoogle')}</span>
                        </button>

                        {/* Forgot Password Link */}
                        {
                            type == "sign-in" ?
                            <p className="mt-4 text-center">
                                <Link to="/forgot-password" className="text-dark-grey hover:text-purple hover:underline text-sm">
                                    Forgot your password?
                                </Link>
                            </p>
                            : ""
                        }

                        {/* Switch Auth Type */}
                        {
                            type == "sign-in" ?
                            <p className="mt-4 text-dark-grey text-center">
                                {t('auth.noAccount')}
                                <Link to="/signup" className="text-purple font-medium ml-1 hover:underline" >
                                    {t('auth.signUpLink')}
                                </Link>  
                            </p>
                            :
                            <p className="mt-8 text-dark-grey text-center">
                                {t('auth.hasAccount')}
                                <Link to="/signin" className="text-purple font-medium ml-1 hover:underline" >
                                    {t('auth.signInLink')}
                                </Link>  
                            </p>
                        }

                    </form>
                </div>
            </section>
        </AnimationWrapper>
    )
}

export default UserAuthForm;