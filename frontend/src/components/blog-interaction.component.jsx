import { useContext, useEffect } from "react";
import { BlogContext } from "../pages/blog.page";
import { Link } from "react-router-dom";
import { UserContext } from "../App";
import { toast } from "react-hot-toast";
import axios from "axios";

const BlogInteraction = () => {

    let { blog, blog: { _id, title, blog_id, activity, activity: { total_likes, total_comments }, author: { personal_info: { username: author_username } }  }, setBlog, islikedByUser, setLikedByUser, setCommentsWrapper } = useContext(BlogContext);

    let { userAuth: { username, access_token } } = useContext(UserContext);

    useEffect(() => {

        if( access_token ){
            // make request to server to get like information
            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/isliked-by-user", { _id }, {
                headers: {
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data: { result } }) => {
                setLikedByUser(Boolean(result))
            })
            .catch(err => {
                console.log(err);
            })
        }

    }, [])

    const handleLike = () => {

        if(access_token){
            // like the blog
            setLikedByUser(preVal => !preVal);

            !islikedByUser ? total_likes++ : total_likes--;

            setBlog({ ...blog, activity: { ...activity, total_likes } })

            axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/like-blog", { _id, islikedByUser }, {
                headers: { 
                    'Authorization': `Bearer ${access_token}`
                }
            })
            .then(({ data }) => {
                console.log(data);
            })
            .catch(err =>{
                console.log(err);
            })
            
        } 
        else{
            // not logged in
            toast.error("please login to like this blog")
        }

    }

    return (
        <>
            <hr className="border-grey my-2" />

            <div className="flex gap-6 justify-between">
                <div className="flex gap-3 items-center">
                    <button
                        type="button"
                        onClick={handleLike}
                        className={"w-10 h-10 rounded-full flex items-center justify-center " + ( islikedByUser ? "bg-red/20 text-red" : "bg-grey/80" )}
                    >
                        <i className={"fi " + ( islikedByUser ? "fi-sr-heart" : "fi-rr-heart" )}></i>
                    </button>
                    <p className="text-xl text-dark-grey">{ total_likes }</p>

                    <button
                        type="button"
                        onClick={() => setCommentsWrapper(preVal => !preVal)}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-grey/80"
                    >
                        <i className="fi fi-rr-comment-dots"></i>
                    </button>
                    <p className="text-xl text-dark-grey">{ total_comments }</p>
                </div>

                <div className="flex gap-6 items-center">

                    {
                        username == author_username ? 
                        <Link to={`/editor/${blog_id}`} className="underline hover:text-purple">Edit</Link> : ""
                    }

                    <a 
                        href={`https://wa.me/?text=${encodeURIComponent(title + ' - ' + location.href)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-green-500/20 hover:bg-green-500/40 transition-colors"
                        title="Partager sur WhatsApp"
                    >
                        <i className="fi fi-brands-whatsapp text-xl text-green-600"></i>
                    </a>

                    <a 
                        href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(location.href)}&quote=${encodeURIComponent(title)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-500/20 hover:bg-blue-500/40 transition-colors"
                        title="Partager sur Facebook"
                    >
                        <i className="fi fi-brands-facebook text-xl text-blue-600"></i>
                    </a>

                    <Link to={`https://twitter.com/intent/tweet?text=Read ${title}&url=${location.href}`}><i className="fi fi-brands-twitter text-xl hover:text-twitter"></i></Link>
                </div>
            </div>

            <hr className="border-grey my-2" />
        </>
    )
}

export default BlogInteraction;