// Translations for the blog platform
// Default language: French

export const translations = {
    fr: {
        // Navbar
        nav: {
            search: "Rechercher des articles...",
            write: "Écrire",
            signIn: "Connexion",
            signUp: "Inscription",
        },
        
        // Hero Section
        hero: {
            welcome: "Bienvenue sur AllInfos",
            title: "Découvrez des Histoires qui",
            titleHighlight: "Inspirent & Informent",
            subtitle: "Explorez des articles pertinents sur la technologie, le lifestyle et la créativité par des auteurs passionnés du monde entier.",
            articles: "Articles",
            readers: "Lecteurs",
            writers: "Auteurs",
        },
        
        // Categories
        categories: {
            title: "Explorer les Sujets",
            trending: "Tendances",
            programming: "programmation",
            hollywood: "hollywood",
            filmMaking: "cinéma",
            socialMedia: "réseaux sociaux",
            cooking: "cuisine",
            tech: "tech",
            finance: "finance",
            travel: "voyage",
        },
        
        // Blog
        blog: {
            noBlogs: "Aucun article publié",
            noTrending: "Aucun article tendance",
            loadMore: "Charger plus",
            likes: "J'aime",
            comments: "Commentaires",
            readTime: "min de lecture",
        },
        
        // Auth
        auth: {
            welcomeBack: "Bon retour",
            joinUs: "Rejoignez-nous",
            signInSubtitle: "Connectez-vous pour accéder à votre compte",
            signUpSubtitle: "Créez votre compte pour commencer",
            fullName: "Nom complet",
            email: "Email",
            password: "Mot de passe",
            signInBtn: "Se connecter",
            createAccount: "Créer un compte",
            or: "ou",
            continueGoogle: "Continuer avec Google",
            noAccount: "Vous n'avez pas de compte ?",
            hasAccount: "Vous avez déjà un compte ?",
            signUpLink: "S'inscrire",
            signInLink: "Se connecter",
        },
        
        // User Menu
        userMenu: {
            profile: "Profil",
            dashboard: "Tableau de bord",
            settings: "Paramètres",
            signOut: "Déconnexion",
            write: "Écrire",
        },
        
        // Loader
        loader: {
            loading: "Chargement...",
        },
        
        // Editor
        editor: {
            title: "Titre de l'article",
            publish: "Publier",
            saveDraft: "Brouillon",
            banner: "Bannière du blog",
        },
        
        // Profile
        profile: {
            joined: "Inscrit le",
            blogs: "Articles",
            reads: "Lectures",
        },
        
        // Dashboard
        dashboard: {
            blogs: "Articles",
            notifications: "Notifications",
            editProfile: "Modifier le profil",
            changePassword: "Changer le mot de passe",
        },
        
        // Common
        common: {
            home: "Accueil",
            trendingBlogs: "articles tendances",
            search: "Rechercher",
        },
    },
    
    en: {
        // Navbar
        nav: {
            search: "Search articles...",
            write: "Write",
            signIn: "Sign In",
            signUp: "Sign Up",
        },
        
        // Hero Section
        hero: {
            welcome: "Welcome to AllInfos",
            title: "Discover Stories That",
            titleHighlight: "Inspire & Inform",
            subtitle: "Explore insightful articles on technology, lifestyle, and creativity from passionate writers around the world.",
            articles: "Articles",
            readers: "Readers",
            writers: "Writers",
        },
        
        // Categories
        categories: {
            title: "Explore Topics",
            trending: "Trending Now",
            programming: "programming",
            hollywood: "hollywood",
            filmMaking: "film making",
            socialMedia: "social media",
            cooking: "cooking",
            tech: "tech",
            finance: "finance",
            travel: "travel",
        },
        
        // Blog
        blog: {
            noBlogs: "No blogs published",
            noTrending: "No trending blogs",
            loadMore: "Load More",
            likes: "Likes",
            comments: "Comments",
            readTime: "min read",
        },
        
        // Auth
        auth: {
            welcomeBack: "Welcome back",
            joinUs: "Join us today",
            signInSubtitle: "Sign in to continue to your account",
            signUpSubtitle: "Create your account to get started",
            fullName: "Full Name",
            email: "Email",
            password: "Password",
            signInBtn: "Sign In",
            createAccount: "Create Account",
            or: "or",
            continueGoogle: "Continue with Google",
            noAccount: "Don't have an account?",
            hasAccount: "Already have an account?",
            signUpLink: "Sign up",
            signInLink: "Sign in",
        },
        
        // User Menu
        userMenu: {
            profile: "Profile",
            dashboard: "Dashboard",
            settings: "Settings",
            signOut: "Sign Out",
            write: "Write",
        },
        
        // Loader
        loader: {
            loading: "Loading...",
        },
        
        // Editor
        editor: {
            title: "Article Title",
            publish: "Publish",
            saveDraft: "Save Draft",
            banner: "Blog Banner",
        },
        
        // Profile
        profile: {
            joined: "Joined on",
            blogs: "Blogs",
            reads: "Reads",
        },
        
        // Dashboard
        dashboard: {
            blogs: "Blogs",
            notifications: "Notifications",
            editProfile: "Edit Profile",
            changePassword: "Change Password",
        },
        
        // Common
        common: {
            home: "home",
            trendingBlogs: "trending blogs",
            search: "Search",
        },
    },
};

export const getTranslation = (lang, path) => {
    const keys = path.split('.');
    let result = translations[lang];
    
    for (const key of keys) {
        if (result && result[key]) {
            result = result[key];
        } else {
            // Fallback to French
            result = translations['fr'];
            for (const k of keys) {
                if (result && result[k]) {
                    result = result[k];
                } else {
                    return path; // Return path if not found
                }
            }
        }
    }
    
    return result;
};
