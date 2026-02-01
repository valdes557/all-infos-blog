/* eslint-disable react/prop-types */
import { getDay } from "../common/date";
import { Link } from "react-router-dom";

const BlogPostCard = ({ content, author }) => {

    let { publishedAt, tags, title, des, banner, activity: { total_likes }, blog_id: id } = content;
    let { fullname, profile_img, username } = author;

    return ( 
        <Link to={`/blog/${id}`} className="group card card-hover flex gap-6 items-center p-5 mb-6">
            <div className="w-full">
                {/* Author Info */}
                <div className="flex gap-3 items-center mb-4">
                    <img src={profile_img} className="w-8 h-8 rounded-full ring-2 ring-purple/20" />
                    <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-black line-clamp-1">{fullname}</p>
                        <span className="text-dark-grey text-sm">@{username}</span>
                        <span className="w-1 h-1 rounded-full bg-dark-grey/50"></span>
                        <p className="text-dark-grey text-sm">{ getDay(publishedAt) }</p>
                    </div>
                </div>

                {/* Title */}
                <h1 className="blog-title group-hover:text-purple transition-colors duration-300">{title}</h1>

                {/* Description */}
                <p className="my-3 text-dark-grey text-base leading-6 max-sm:hidden md:max-[1100px]:hidden line-clamp-2">{des}</p>

                {/* Tags & Likes */}
                <div className="flex items-center gap-4 mt-5">
                    <span className="tag py-1.5 px-4 text-sm">{tags[0]}</span>
                    <span className="flex items-center gap-2 text-dark-grey text-sm">
                        <i className="fi fi-rr-heart text-base group-hover:text-red transition-colors"></i>
                        { total_likes }
                    </span>
                </div>

            </div>
            
            {/* Banner Image */}
            <div className="h-32 w-32 min-w-[8rem] rounded-xl overflow-hidden bg-grey shadow-soft">
                <img src={banner} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
            </div>

        </Link>
    )
}

export default BlogPostCard;