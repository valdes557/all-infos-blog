import { useLanguage } from "../common/LanguageContext";

const Loader = () => {
    const { t } = useLanguage();
    
    return (
        <div className="flex flex-col items-center justify-center py-12">
            {/* Modern Spinner */}
            <div className="relative w-14 h-14">
                {/* Outer ring */}
                <div className="absolute inset-0 rounded-full border-4 border-grey"></div>
                {/* Spinning gradient ring */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple border-r-secondary animate-spin"></div>
                {/* Inner glow */}
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-purple/10 to-secondary/10 animate-pulse"></div>
            </div>
            <p className="mt-4 text-dark-grey text-sm font-medium">{t('loader.loading')}</p>
        </div>
    )
}

export default Loader;