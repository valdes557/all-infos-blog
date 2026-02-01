import { useContext, useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { ThemeContext, UserContext } from '../App';
import UserNavigationPanel from "./user-navigation.component";
import axios from "axios";
import { storeInSession } from "../common/session";
import { useLanguage } from "../common/LanguageContext";

const Navbar = () => {

    const [ searchBoxVisibility, setSearchBoxVisibility ] = useState(false)
    const [ userNavPanel, setUserNavPanel ] = useState(false);
    const [ scrolled, setScrolled ] = useState(false);

    let { theme, setTheme } = useContext(ThemeContext);
    const { language, toggleLanguage, t } = useLanguage();

    let navigate = useNavigate();

    const { userAuth, userAuth: { access_token, profile_img, new_notification_available, isAdmin }, setUserAuth } = useContext(UserContext);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {

        if(access_token){
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/new-notification", {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data }) => {
                setUserAuth({ ...userAuth, ...data })
            })
            .catch(err => {
                console.log(err)
            })
        }

    }, [access_token])

    const handleUserNavPanel = () => {
        setUserNavPanel(currentVal => !currentVal);
    }

    const handleSearch = (e) => {
        let query = e.target.value;
        
        if(e.keyCode == 13 && query.length){
            navigate(`/search/${query}`);
        }
    }

    const handleBlur = () => {
        setTimeout(() => {
            setUserNavPanel(false);
        }, 200);
    }

    const changeTheme = () => {
        
        let newTheme = theme == "light" ? "dark" : "light";

        setTheme(newTheme);

        document.body.setAttribute("data-theme", newTheme);

        storeInSession("theme", newTheme);

    }

    return (
        <>
            <nav className={`navbar z-50 transition-all duration-300 ${scrolled ? 'shadow-card bg-white/90' : 'bg-white/80'}`}>

                {/* Logo */}
                <Link to="/" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-xl bg-gradient-primary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform duration-300">
                        <span className="text-white font-bold text-xl font-poppins">A</span>
                    </div>
                    <span className="hidden sm:block font-poppins font-bold text-2xl gradient-text">AllInfos</span>
                </Link>

                {/* Search Bar */}
                <div className={"absolute bg-white/95 backdrop-blur-xl w-full left-0 top-full mt-0.5 border-b border-grey/30 py-4 px-[5vw] md:border-0 md:block md:relative md:inset-0 md:p-0 md:w-auto md:bg-transparent md:backdrop-blur-none " + ( searchBoxVisibility ? "show shadow-soft" : "hide" )}>
                    <div className="relative">
                        <input 
                            type="text"
                            placeholder={t('nav.search')}
                            className="w-full md:w-[280px] lg:w-[350px] bg-grey/50 p-3 pl-12 pr-4 rounded-xl 
                                     placeholder:text-dark-grey/50 border border-transparent
                                     focus:border-purple/30 focus:bg-white focus:shadow-soft
                                     transition-all duration-300"
                            onKeyDown={handleSearch}
                        />
                        <i className="fi fi-rr-search absolute left-4 top-1/2 -translate-y-1/2 text-xl text-dark-grey/50"></i>
                    </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                    {/* Mobile Search Toggle */}
                    <button className="md:hidden w-11 h-11 rounded-xl bg-grey/50 flex items-center justify-center
                                     hover:bg-purple/10 hover:text-purple transition-all duration-300"
                    onClick={() => setSearchBoxVisibility(currentVal => !currentVal)}
                    >
                        <i className="fi fi-rr-search text-xl"></i>
                    </button>

                    {/* Write Button (Admin) */}
                    {
                        isAdmin ? 
                        <Link to="/editor" className="hidden md:flex items-center gap-2 px-5 py-2.5 rounded-xl
                                                     bg-gradient-primary text-white font-medium
                                                     hover:shadow-glow hover:scale-105 transition-all duration-300">
                            <i className="fi fi-rr-edit text-sm"></i>
                            <span>{t('nav.write')}</span>
                        </Link> : ""
                    }

                    {/* Language Toggle */}
                    <button className="w-11 h-11 rounded-xl bg-grey/50 flex items-center justify-center
                                     hover:bg-purple/10 hover:text-purple transition-all duration-300
                                     font-semibold text-sm" 
                            onClick={toggleLanguage}
                            title={language === 'fr' ? 'Switch to English' : 'Passer en Français'}>
                        <span className="uppercase">{language === 'fr' ? 'EN' : 'FR'}</span>
                    </button>

                    {/* Theme Toggle */}
                    <button className="w-11 h-11 rounded-xl bg-grey/50 flex items-center justify-center
                                     hover:bg-purple/10 hover:text-purple transition-all duration-300
                                     hover:rotate-12" 
                            onClick={changeTheme}>
                        <i className={"fi fi-rr-" + ( theme == "light" ?  "moon-stars" : "sun" ) + " text-xl" }></i>
                    </button>

                    {
                        access_token ? 
                        <>
                            {/* Notifications */}
                            <Link to="/dashboard/notifications">
                                <button className="w-11 h-11 rounded-xl bg-grey/50 flex items-center justify-center relative
                                                 hover:bg-purple/10 hover:text-purple transition-all duration-300">
                                    <i className="fi fi-rr-bell text-xl"></i>
                                    {
                                        new_notification_available ? 
                                        <span className="absolute top-2 right-2 w-3 h-3 bg-gradient-secondary rounded-full
                                                       animate-pulse shadow-lg"></span> : ""
                                    }
                                </button>
                            </Link>

                            {/* User Avatar */}
                            <div className="relative" onClick={handleUserNavPanel} onBlur={handleBlur}>
                                <button className="w-11 h-11 rounded-xl overflow-hidden ring-2 ring-transparent
                                                 hover:ring-purple/30 transition-all duration-300">
                                    <img src={profile_img} className="w-full h-full object-cover" />
                                </button>

                                {
                                    userNavPanel ? <UserNavigationPanel /> : ""
                                }

                            </div>
                        </>
                        :
                        <>
                            <Link className="btn-dark py-2.5 px-6 text-base" to="/signin">
                                {t('nav.signIn')}
                            </Link>
                            <Link className="btn-light py-2.5 px-6 text-base hidden md:block" to="/signup">
                                {t('nav.signUp')}
                            </Link>
                        </>
                    }

                </div>

            </nav>

            <Outlet />
        </>
    )
}

export default Navbar;