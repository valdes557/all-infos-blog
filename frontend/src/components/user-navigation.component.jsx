import { useContext } from "react";
import AnimationWrapper from "../common/page-animation";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { removeFromSession } from "../common/session";
import { useLanguage } from "../common/LanguageContext";

const UserNavigationPanel = () => {

    const { t } = useLanguage();
    const { userAuth: { username, isAdmin }, setUserAuth } = useContext(UserContext);

    const signOutUser = () => {
        removeFromSession("user");
        setUserAuth({ access_token: null })
    }

    return (
        <AnimationWrapper 
            className="absolute right-0 top-14 z-50"
            transition={{ duration: 0.2 }}
        >

            <div className="bg-white/95 backdrop-blur-xl rounded-2xl border border-grey/50 w-64 
                          shadow-elevated overflow-hidden">

                {/* User Info Header */}
                <div className="p-4 bg-gradient-to-r from-purple/5 to-secondary/5 border-b border-grey/30">
                    <p className="font-medium text-black">@{username}</p>
                </div>

                {/* Menu Items */}
                <div className="p-2">
                    {
                        isAdmin ? 
                        <Link to="/editor" className="flex items-center gap-3 px-4 py-3 rounded-xl
                                                     text-dark-grey hover:bg-purple/5 hover:text-purple
                                                     transition-all duration-200 md:hidden">
                            <i className="fi fi-rr-edit text-lg"></i>
                            <span>{t('userMenu.write')}</span>
                        </Link> : ""
                    }

                    <Link to={`/user/${username}`} className="flex items-center gap-3 px-4 py-3 rounded-xl
                                                              text-dark-grey hover:bg-purple/5 hover:text-purple
                                                              transition-all duration-200">
                        <i className="fi fi-rr-user text-lg"></i>
                        <span>{t('userMenu.profile')}</span>
                    </Link>

                    <Link to="/dashboard/blogs" className="flex items-center gap-3 px-4 py-3 rounded-xl
                                                           text-dark-grey hover:bg-purple/5 hover:text-purple
                                                           transition-all duration-200">
                        <i className="fi fi-rr-apps text-lg"></i>
                        <span>{t('userMenu.dashboard')}</span>
                    </Link>

                    <Link to="/settings/edit-profile" className="flex items-center gap-3 px-4 py-3 rounded-xl
                                                                  text-dark-grey hover:bg-purple/5 hover:text-purple
                                                                  transition-all duration-200">
                        <i className="fi fi-rr-settings text-lg"></i>
                        <span>{t('userMenu.settings')}</span>
                    </Link>
                </div>

                {/* Sign Out */}
                <div className="p-2 border-t border-grey/30">
                    <button className="flex items-center gap-3 w-full px-4 py-3 rounded-xl
                                     text-red hover:bg-red/5 transition-all duration-200"
                        onClick={signOutUser}
                    >
                        <i className="fi fi-rr-sign-out-alt text-lg"></i>
                        <span className="font-medium">{t('userMenu.signOut')}</span>
                    </button>
                </div>

            </div>

        </AnimationWrapper>
    )

}

export default UserNavigationPanel;