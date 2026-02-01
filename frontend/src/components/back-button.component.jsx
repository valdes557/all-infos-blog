import { useNavigate } from "react-router-dom";

const BackButton = ({ className = "" }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 text-dark-grey hover:text-black transition-colors ${className}`}
        >
            <i className="fi fi-rr-arrow-left"></i>
            <span>Retour</span>
        </button>
    );
};

export default BackButton;
