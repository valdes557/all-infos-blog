import { useEffect } from "react";

const AdSense = ({ adSlot, adFormat = "auto", fullWidthResponsive = true, className = "" }) => {
    useEffect(() => {
        try {
            if (window.adsbygoogle) {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (err) {
            console.log("AdSense error:", err);
        }
    }, []);

    return (
        <div className={`ad-container ${className}`}>
            <ins
                className="adsbygoogle"
                style={{ display: "block" }}
                data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            />
        </div>
    );
};

export const AdBanner = ({ className = "" }) => (
    <div className={`w-full my-6 ${className}`}>
        <AdSense adSlot="1234567890" adFormat="horizontal" />
    </div>
);

export const AdSidebar = ({ className = "" }) => (
    <div className={`w-full ${className}`}>
        <AdSense adSlot="0987654321" adFormat="vertical" />
    </div>
);

export const AdInArticle = ({ className = "" }) => (
    <div className={`w-full my-8 ${className}`}>
        <AdSense adSlot="1122334455" adFormat="fluid" />
    </div>
);

export default AdSense;
