import express from 'express';
import mongoose from 'mongoose';
import 'dotenv/config';
import bcrypt from 'bcrypt';
import { nanoid } from 'nanoid';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import admin from 'firebase-admin';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync, existsSync } from 'fs';
import aws from 'aws-sdk';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

// Import Mongoose Models
import User from './Schema/User.js';
import Blog from './Schema/Blog.js';
import Comment from './Schema/Comment.js';
import Notification from './Schema/Notification.js';
import Category from './Schema/Category.js';

const server = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
    autoIndex: true
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Firebase initialization
let serviceAccountKey;
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    const firebaseFilePath = new URL('./allinfo-310b2-firebase-adminsdk-fbsvc-c58ab53387.json', import.meta.url);
    if (existsSync(firebaseFilePath)) {
        serviceAccountKey = JSON.parse(readFileSync(firebaseFilePath, 'utf-8'));
    } else {
        console.error('❌ Firebase credentials not found. Set FIREBASE_SERVICE_ACCOUNT env var with the JSON content of your Firebase service account file.');
        process.exit(1);
    }
}
admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
});

// Regex patterns
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.[a-z]{2,3})+$/;

server.use(express.json());
server.use(cors());

// AWS S3 configuration
const s3 = new aws.S3({
    region: process.env.AWS_BUCKET_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Profile images for default avatars
const profile_imgs_name_list = ["Garfield", "Tinkerbell", "Annie", "Loki", "Cleo", "Angel", "Bob", "Mia", "Coco", "Gracie", "Bear", "Bella", "Abby", "Harley", "Cali", "Leo", "Luna", "Jack", "Felix", "Kiki"];
const profile_imgs_collections_list = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

const getDefaultProfileImg = () => {
    const collection = profile_imgs_collections_list[Math.floor(Math.random() * profile_imgs_collections_list.length)];
    const name = profile_imgs_name_list[Math.floor(Math.random() * profile_imgs_name_list.length)];
    return `https://api.dicebear.com/6.x/${collection}/svg?seed=${name}`;
};

const generateUploadURL = async () => {
    const date = new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;
    return await s3.getSignedUrlPromise('putObject', {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: imageName,
        Expires: 1000,
        ContentType: 'image/jpeg'
    });
};

const verifyJWT = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ error: 'No access token' });
    }

    jwt.verify(token, process.env.SECRET_ACCESS_KEY, async (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Access token is invalid' });
        }
        req.user = user.id;
        try {
            const dbUser = await User.findById(user.id).select('admin');
            req.admin = dbUser ? dbUser.admin : false;
        } catch {
            req.admin = user.admin;
        }
        next();
    });
};

const formatDatatoSend = (user) => {
    const access_token = jwt.sign(
        { id: user._id, admin: user.admin },
        process.env.SECRET_ACCESS_KEY
    );

    return {
        access_token,
        profile_img: user.personal_info.profile_img,
        username: user.personal_info.username,
        fullname: user.personal_info.fullname,
        isAdmin: user.admin
    };
};

const generateUsername = async (email) => {
    let username = email.split('@')[0];
    const isUsernameNotUnique = await User.exists({ "personal_info.username": username });
    if (isUsernameNotUnique) {
        username += nanoid().substring(0, 5);
    }
    return username;
};

// ==================== ROUTES ====================

// Check current admin status from DB
server.get('/check-admin-status', verifyJWT, async (req, res) => {
    try {
        const user = await User.findById(req.user).select('admin');
        return res.status(200).json({ isAdmin: user ? user.admin : false });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Upload URL
server.get('/get-upload-url', (req, res) => {
    generateUploadURL()
        .then(url => res.status(200).json({ uploadURL: url }))
        .catch(err => {
            console.log(err.message);
            return res.status(500).json({ error: err.message });
        });
});

// Signup
server.post('/signup', async (req, res) => {
    try {
        const { fullname, email, password } = req.body;

        if (fullname.length < 3) {
            return res.status(403).json({ error: 'Fullname must be at least 3 letters long' });
        }
        if (!email.length) {
            return res.status(403).json({ error: 'Enter Email' });
        }
        if (!emailRegex.test(email)) {
            return res.status(403).json({ error: 'Email is invalid' });
        }
        if (!password || password.length < 3) {
            return res.status(403).json({ error: 'Password must be at least 3 characters long' });
        }

        const hashed_password = await bcrypt.hash(password, 10);
        const username = await generateUsername(email);

        const user = new User({
            personal_info: {
                fullname: fullname.toLowerCase(),
                email: email.toLowerCase(),
                password: hashed_password,
                username
            }
        });

        const savedUser = await user.save();
        return res.status(200).json(formatDatatoSend(savedUser));
    } catch (err) {
        if (err.code === 11000) {
            return res.status(500).json({ error: 'Email already exists' });
        }
        return res.status(500).json({ error: err.message });
    }
});

// Signin
server.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ "personal_info.email": email.toLowerCase() });

        if (!user) {
            return res.status(403).json({ error: 'Email not found' });
        }

        if (!user.google_auth) {
            const isMatch = await bcrypt.compare(password, user.personal_info.password);
            if (!isMatch) {
                return res.status(403).json({ error: 'Incorrect password' });
            }
            return res.status(200).json(formatDatatoSend(user));
        } else {
            return res.status(403).json({ error: 'Account was created using google. Try logging in with google.' });
        }
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Google Auth
server.post('/google-auth', async (req, res) => {
    try {
        const { access_token } = req.body;
        const decodedUser = await getAuth().verifyIdToken(access_token);
        let { email, name, picture } = decodedUser;

        picture = picture.replace('s96-c', 's384-c');

        let user = await User.findOne({ "personal_info.email": email.toLowerCase() });

        if (user) {
            if (!user.google_auth) {
                return res.status(403).json({ error: 'This email was signed up without google. Please log in with password to access the account' });
            }
            return res.status(200).json(formatDatatoSend(user));
        } else {
            const username = await generateUsername(email);
            user = new User({
                personal_info: {
                    fullname: name.toLowerCase(),
                    email: email.toLowerCase(),
                    username,
                    profile_img: picture
                },
                google_auth: true
            });
            const savedUser = await user.save();
            return res.status(200).json(formatDatatoSend(savedUser));
        }
    } catch (err) {
        return res.status(500).json({ error: 'Failed to authenticate you with google. Try with some other google account' });
    }
});

// Change Password
server.post('/change-password', verifyJWT, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!newPassword || newPassword.length < 3) {
            return res.status(403).json({ error: 'Password must be at least 3 characters long' });
        }

        const user = await User.findById(req.user);

        if (user.google_auth) {
            return res.status(403).json({ error: "You can't change account's password because you logged in through google" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.personal_info.password);
        if (!isMatch) {
            return res.status(403).json({ error: 'Incorrect current password' });
        }

        const hashed_password = await bcrypt.hash(newPassword, 10);
        await User.findByIdAndUpdate(req.user, { "personal_info.password": hashed_password });

        return res.status(200).json({ status: 'password changed' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'User not found' });
    }
});

// Latest Blogs
server.post('/latest-blogs', async (req, res) => {
    try {
        const { page = 1 } = req.body;
        const maxLimit = 5;

        const blogs = await Blog.find({ draft: false })
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "publishedAt": -1 })
            .select("blog_id title des banner activity tags publishedAt -_id")
            .skip((page - 1) * maxLimit)
            .limit(maxLimit);

        return res.status(200).json({ blogs });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// All Latest Blogs Count
server.post('/all-latest-blogs-count', async (req, res) => {
    try {
        const count = await Blog.countDocuments({ draft: false });
        return res.status(200).json({ totalDocs: count });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Trending Blogs
server.get('/trending-blogs', async (req, res) => {
    try {
        const blogs = await Blog.find({ draft: false })
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "activity.total_reads": -1, "activity.total_likes": -1, "publishedAt": -1 })
            .select("blog_id title publishedAt -_id")
            .limit(5);

        return res.status(200).json({ blogs });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Search Blogs
server.post('/search-blogs', async (req, res) => {
    try {
        const { tag, query, author, page = 1, limit, eliminate_blog } = req.body;
        const maxLimit = limit || 2;

        let findQuery = { draft: false };

        if (tag) {
            findQuery.tags = tag;
            if (eliminate_blog) {
                findQuery.blog_id = { $ne: eliminate_blog };
            }
        } else if (query) {
            findQuery.title = new RegExp(query, 'i');
        } else if (author) {
            findQuery.author = author;
        }

        const blogs = await Blog.find(findQuery)
            .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
            .sort({ "publishedAt": -1 })
            .select("blog_id title des banner activity tags publishedAt -_id")
            .skip((page - 1) * maxLimit)
            .limit(maxLimit);

        return res.status(200).json({ blogs });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Search Blogs Count
server.post('/search-blogs-count', async (req, res) => {
    try {
        const { tag, author, query } = req.body;
        let findQuery = { draft: false };

        if (tag) {
            findQuery.tags = tag;
        } else if (query) {
            findQuery.title = new RegExp(query, 'i');
        } else if (author) {
            findQuery.author = author;
        }

        const count = await Blog.countDocuments(findQuery);
        return res.status(200).json({ totalDocs: count });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Search Users
server.post('/search-users', async (req, res) => {
    try {
        const { query } = req.body;
        const users = await User.find({ "personal_info.username": new RegExp(query, 'i') })
            .limit(50)
            .select("personal_info.fullname personal_info.username personal_info.profile_img -_id");

        return res.status(200).json({ users });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get Profile
server.post('/get-profile', async (req, res) => {
    try {
        const { username } = req.body;
        const user = await User.findOne({ "personal_info.username": username })
            .select("-personal_info.password -google_auth -updatedAt -blogs");

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.status(200).json(user);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
});

// Update Profile Image
server.post('/update-profile-img', verifyJWT, async (req, res) => {
    try {
        const { url } = req.body;
        await User.findByIdAndUpdate(req.user, { "personal_info.profile_img": url });
        return res.status(200).json({ profile_img: url });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Update Profile
server.post('/update-profile', verifyJWT, async (req, res) => {
    try {
        const { username, bio, social_links } = req.body;
        const bioLimit = 150;

        if (username.length < 3) {
            return res.status(403).json({ error: 'Username should be at least 3 letters long' });
        }

        if (bio.length > bioLimit) {
            return res.status(403).json({ error: `Bio should not be more than ${bioLimit} characters` });
        }

        const socialLinksArr = Object.keys(social_links);
        for (let i = 0; i < socialLinksArr.length; i++) {
            if (social_links[socialLinksArr[i]].length) {
                try {
                    const hostname = new URL(social_links[socialLinksArr[i]]).hostname;
                    if (!hostname.includes(`${socialLinksArr[i]}.com`) && socialLinksArr[i] !== 'website') {
                        return res.status(403).json({ error: `${socialLinksArr[i]} link is invalid. You must enter a full link` });
                    }
                } catch (err) {
                    return res.status(500).json({ error: 'You must provide full social links with http(s) included' });
                }
            }
        }

        await User.findByIdAndUpdate(req.user, {
            "personal_info.username": username,
            "personal_info.bio": bio,
            social_links
        });

        return res.status(200).json({ username });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'username is already taken' });
        }
        return res.status(500).json({ error: err.message });
    }
});

// Create Blog
server.post('/create-blog', verifyJWT, async (req, res) => {
    try {
        const authorId = req.user;
        const isAdmin = req.admin;

        if (!isAdmin) {
            return res.status(500).json({ error: "you don't have permissions to create any blog" });
        }

        let { title, des, banner, tags, content, draft, id } = req.body;

        if (!title.length) {
            return res.status(403).json({ error: 'You must provide a title' });
        }

        if (!draft) {
            if (!des.length || des.length > 200) {
                return res.status(403).json({ error: 'You must provide blog description under 200 characters' });
            }
            if (!banner.length) {
                return res.status(403).json({ error: 'You must provide blog banner to publish it' });
            }
            if (!content.blocks.length) {
                return res.status(403).json({ error: 'There must be some blog content to publish it' });
            }
            if (!tags.length || tags.length > 10) {
                return res.status(403).json({ error: 'Provide tags in order to publish the blog, Maximum 10' });
            }
        }

        tags = tags.map(tag => tag.toLowerCase());
        const blog_id = id || title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, '-').trim() + nanoid();

        if (id) {
            await Blog.findOneAndUpdate({ blog_id }, {
                title, des, banner, content, tags, draft: draft ? true : false
            });
            return res.status(200).json({ id: blog_id });
        } else {
            const blog = new Blog({
                blog_id, title, des, banner, content, tags, author: authorId, draft: Boolean(draft)
            });

            const savedBlog = await blog.save();
            const incrementVal = draft ? 0 : 1;

            await User.findByIdAndUpdate(authorId, {
                $inc: { "account_info.total_posts": incrementVal },
                $push: { "blogs": savedBlog._id }
            });

            return res.status(200).json({ id: blog_id });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get Blog
server.post('/get-blog', async (req, res) => {
    try {
        const { blog_id, draft, mode } = req.body;
        const incrementVal = mode !== 'edit' ? 1 : 0;

        const blog = await Blog.findOneAndUpdate(
            { blog_id },
            { $inc: { "activity.total_reads": incrementVal } },
            { new: true }
        )
        .populate("author", "personal_info.fullname personal_info.username personal_info.profile_img")
        .select("title des content banner activity publishedAt blog_id tags draft");

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (incrementVal > 0) {
            await User.findOneAndUpdate(
                { "personal_info.username": blog.author.personal_info.username },
                { $inc: { "account_info.total_reads": incrementVal } }
            );
        }

        if (blog.draft && !draft) {
            return res.status(500).json({ error: 'you can not access draft blogs' });
        }

        return res.status(200).json({ blog });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Like Blog
server.post('/like-blog', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { _id, islikedByUser } = req.body;
        const incrementVal = !islikedByUser ? 1 : -1;

        const blog = await Blog.findByIdAndUpdate(_id, { $inc: { "activity.total_likes": incrementVal } });

        if (!islikedByUser) {
            const like = new Notification({
                type: "like",
                blog: _id,
                notification_for: blog.author,
                user: user_id
            });
            await like.save();
            return res.status(200).json({ liked_by_user: true });
        } else {
            await Notification.findOneAndDelete({ user: user_id, blog: _id, type: "like" });
            return res.status(200).json({ liked_by_user: false });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Is Liked By User
server.post('/isliked-by-user', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { _id } = req.body;

        const result = await Notification.exists({ user: user_id, type: "like", blog: _id });
        return res.status(200).json({ result });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Add Comment
server.post('/add-comment', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { _id, comment, blog_author, replying_to, notification_id } = req.body;

        if (!comment.length) {
            return res.status(403).json({ error: 'Write something to leave a comment' });
        }

        const commentObj = {
            blog_id: _id,
            blog_author,
            comment,
            commented_by: user_id
        };

        if (replying_to) {
            commentObj.parent = replying_to;
            commentObj.isReply = true;
        }

        const newComment = await new Comment(commentObj).save();

        await Blog.findByIdAndUpdate(_id, {
            $push: { "comments": newComment._id },
            $inc: {
                "activity.total_comments": 1,
                "activity.total_parent_comments": replying_to ? 0 : 1
            }
        });

        let notificationFor = blog_author;
        if (replying_to) {
            const replyingToComment = await Comment.findByIdAndUpdate(
                replying_to,
                { $push: { children: newComment._id } }
            );
            notificationFor = replyingToComment.commented_by;

            if (notification_id) {
                await Notification.findByIdAndUpdate(notification_id, { reply: newComment._id });
            }
        }

        const notification = new Notification({
            type: replying_to ? "reply" : "comment",
            blog: _id,
            notification_for: notificationFor,
            user: user_id,
            comment: newComment._id,
            replied_on_comment: replying_to || null
        });
        await notification.save();

        return res.status(200).json({
            comment: newComment.comment,
            commentedAt: newComment.commentedAt,
            _id: newComment._id,
            user_id,
            children: []
        });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get Blog Comments
server.post('/get-blog-comments', async (req, res) => {
    try {
        const { blog_id, skip } = req.body;
        const maxLimit = 5;

        const comments = await Comment.find({ blog_id, isReply: false })
            .populate("commented_by", "personal_info.username personal_info.fullname personal_info.profile_img")
            .skip(skip || 0)
            .limit(maxLimit)
            .sort({ 'commentedAt': -1 });

        return res.status(200).json(comments);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Get Replies
server.post('/get-replies', async (req, res) => {
    try {
        const { _id, skip } = req.body;
        const maxLimit = 5;

        const doc = await Comment.findById(_id)
            .populate({
                path: "children",
                options: {
                    limit: maxLimit,
                    skip: skip || 0,
                    sort: { 'commentedAt': -1 }
                },
                populate: {
                    path: 'commented_by',
                    select: "personal_info.profile_img personal_info.fullname personal_info.username"
                },
                select: "-blog_id -updatedAt"
            })
            .select("children");

        return res.status(200).json({ replies: doc.children });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete Comment (helper function)
const deleteComments = async (_id) => {
    const comment = await Comment.findById(_id);
    if (!comment) return;

    if (comment.parent) {
        await Comment.findByIdAndUpdate(comment.parent, { $pull: { children: _id } });
    }

    await Notification.findOneAndDelete({ comment: _id });
    await Notification.findOneAndUpdate({ reply: _id }, { $unset: { reply: 1 } });

    await Blog.findByIdAndUpdate(comment.blog_id, {
        $pull: { comments: _id },
        $inc: {
            "activity.total_comments": -1,
            "activity.total_parent_comments": comment.parent ? 0 : -1
        }
    });

    // Delete children recursively
    if (comment.children && comment.children.length) {
        for (const childId of comment.children) {
            await deleteComments(childId);
        }
    }

    await Comment.findByIdAndDelete(_id);
};

// Delete Comment
server.post('/delete-comment', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { _id } = req.body;

        const comment = await Comment.findById(_id);

        if (user_id == comment.commented_by || user_id == comment.blog_author) {
            await deleteComments(_id);
            return res.status(200).json({ status: 'done' });
        } else {
            return res.status(403).json({ error: 'You can not delete this comment' });
        }
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// New Notification
server.get('/new-notification', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;

        const result = await Notification.exists({
            notification_for: user_id,
            seen: false,
            user: { $ne: user_id }
        });

        return res.status(200).json({ new_notification_available: Boolean(result) });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Get Notifications
server.post('/notifications', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { page, filter, deletedDocCount } = req.body;
        const maxLimit = 10;
        let skipDocs = (page - 1) * maxLimit;

        if (deletedDocCount) {
            skipDocs -= deletedDocCount;
        }

        let findQuery = { notification_for: user_id, user: { $ne: user_id } };
        if (filter !== 'all') {
            findQuery.type = filter;
        }

        const notifications = await Notification.find(findQuery)
            .skip(skipDocs)
            .limit(maxLimit)
            .populate("blog", "title blog_id")
            .populate("user", "personal_info.fullname personal_info.username personal_info.profile_img")
            .populate("comment", "comment")
            .populate("replied_on_comment", "comment")
            .populate("reply", "comment")
            .sort({ createdAt: -1 })
            .select("createdAt type seen reply");

        await Notification.updateMany(findQuery, { seen: true })
            .skip(skipDocs)
            .limit(maxLimit);

        return res.status(200).json({ notifications });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// All Notifications Count
server.post('/all-notifications-count', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { filter } = req.body;

        let findQuery = { notification_for: user_id, user: { $ne: user_id } };
        if (filter !== 'all') {
            findQuery.type = filter;
        }

        const count = await Notification.countDocuments(findQuery);
        return res.status(200).json({ totalDocs: count });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// User Written Blogs
server.post('/user-written-blogs', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { page, draft, query, deletedDocCount } = req.body;
        const maxLimit = 5;
        let skipDocs = (page - 1) * maxLimit;

        if (deletedDocCount) {
            skipDocs -= deletedDocCount;
        }

        const blogs = await Blog.find({ author: user_id, draft, title: new RegExp(query || '', 'i') })
            .skip(skipDocs)
            .limit(maxLimit)
            .sort({ publishedAt: -1 })
            .select("title banner publishedAt blog_id activity des draft -_id");

        return res.status(200).json({ blogs });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// User Written Blogs Count
server.post('/user-written-blogs-count', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const { draft, query } = req.body;

        const count = await Blog.countDocuments({ author: user_id, draft, title: new RegExp(query || '', 'i') });
        return res.status(200).json({ totalDocs: count });
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: err.message });
    }
});

// Delete Blog
server.post('/delete-blog', verifyJWT, async (req, res) => {
    try {
        const user_id = req.user;
        const isAdmin = req.admin;
        const { blog_id } = req.body;

        if (!isAdmin) {
            return res.status(500).json({ error: "you don't have permissions to delete the blog" });
        }

        const blog = await Blog.findOneAndDelete({ blog_id });
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        await Notification.deleteMany({ blog: blog._id });
        await Comment.deleteMany({ blog_id: blog._id });
        await User.findByIdAndUpdate(user_id, {
            $inc: { "account_info.total_posts": -1 },
            $pull: { blogs: blog._id }
        });

        return res.status(200).json({ status: 'done' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ==================== FORGOT PASSWORD ====================

// Email transporter
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Verify transporter connection
transporter.verify((error, success) => {
    if (error) {
        console.log('❌ Email transporter error:', error.message);
    } else {
        console.log('✅ Email server is ready to send messages');
    }
});

// Forgot Password
server.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }

        const user = await User.findOne({ "personal_info.email": email.toLowerCase() });

        if (!user) {
            return res.status(404).json({ error: 'No account found with this email' });
        }

        if (user.google_auth) {
            return res.status(400).json({ error: 'This account uses Google authentication. Please sign in with Google.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await User.findByIdAndUpdate(user._id, {
            resetPasswordToken: resetToken,
            resetPasswordExpires: resetTokenExpiry
        });

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Request - AllInfo',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #8B5CF6;">Password Reset Request</h2>
                    <p>Hello ${user.personal_info.fullname},</p>
                    <p>You requested to reset your password. Click the button below to reset it:</p>
                    <a href="${resetUrl}" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6, #EC4899); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin: 20px 0;">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">AllInfo Team</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (err) {
        console.log('❌ Email error:', err.message);
        console.log('Full error:', err);
        return res.status(500).json({ error: 'Failed to send reset email: ' + err.message });
    }
});

// Reset Password
server.post('/reset-password/:token', async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        if (!password || password.length < 3) {
            return res.status(400).json({ error: 'Password must be at least 3 characters long' });
        }

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.findByIdAndUpdate(user._id, {
            "personal_info.password": hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: 'Failed to reset password' });
    }
});

// ==================== CATEGORIES ====================

// Get Categories (public)
server.get('/categories', async (req, res) => {
    try {
        const categories = await Category.find({ isActive: true }).sort({ name: 1 });
        return res.status(200).json({ categories });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Get All Categories (admin)
server.get('/admin/categories', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const categories = await Category.find()
            .populate("createdBy", "personal_info.username")
            .sort({ createdAt: -1 });

        return res.status(200).json({ categories });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Create Category
server.post('/create-category', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { name, description } = req.body;

        if (!name || name.length < 2) {
            return res.status(400).json({ error: 'Category name must be at least 2 characters' });
        }

        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        const category = new Category({
            name,
            slug,
            description: description || '',
            createdBy: req.user
        });

        const savedCategory = await category.save();
        return res.status(200).json({ category: savedCategory });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ error: 'Category already exists' });
        }
        return res.status(500).json({ error: err.message });
    }
});

// Update Category
server.post('/update-category', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { categoryId, name, description, isActive } = req.body;

        if (!categoryId) {
            return res.status(400).json({ error: 'Category ID required' });
        }

        const updateData = {};
        if (name !== undefined) {
            updateData.name = name;
            updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        if (description !== undefined) updateData.description = description;
        if (isActive !== undefined) updateData.isActive = isActive;

        const category = await Category.findByIdAndUpdate(categoryId, updateData, { new: true });
        return res.status(200).json({ category });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// Delete Category
server.post('/delete-category', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { categoryId } = req.body;
        await Category.findByIdAndDelete(categoryId);

        return res.status(200).json({ message: 'Category deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

// ==================== ADMIN ANALYTICS ====================

server.get('/admin/analytics', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        // Get stats
        const totalUsers = await User.countDocuments();
        const totalBlogs = await Blog.countDocuments({ draft: false });
        const totalDrafts = await Blog.countDocuments({ draft: true });
        const totalCategories = await Category.countDocuments();
        const totalComments = await Comment.countDocuments();

        const statsAgg = await Blog.aggregate([
            { $group: { _id: null, total_reads: { $sum: "$activity.total_reads" }, total_likes: { $sum: "$activity.total_likes" } } }
        ]);

        const totalReads = statsAgg.length > 0 ? statsAgg[0].total_reads : 0;
        const totalLikes = statsAgg.length > 0 ? statsAgg[0].total_likes : 0;

        // New users this week
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const newUsersThisWeek = await User.countDocuments({ joinedAt: { $gte: oneWeekAgo } });
        const newBlogsThisWeek = await Blog.countDocuments({ publishedAt: { $gte: oneWeekAgo }, draft: false });

        // Recent users
        const recentUsers = await User.find()
            .sort({ joinedAt: -1 })
            .limit(5)
            .select("personal_info.fullname personal_info.username personal_info.profile_img joinedAt");

        // Recent blogs
        const recentBlogs = await Blog.find({ draft: false })
            .populate("author", "personal_info.username")
            .sort({ publishedAt: -1 })
            .limit(5)
            .select("blog_id title activity publishedAt");

        // Top blogs
        const topBlogs = await Blog.find({ draft: false })
            .populate("author", "personal_info.username")
            .sort({ "activity.total_reads": -1, "activity.total_likes": -1 })
            .limit(10)
            .select("blog_id title activity");

        return res.status(200).json({
            stats: {
                totalUsers,
                totalBlogs,
                totalDrafts,
                totalCategories,
                totalComments,
                totalReads,
                totalLikes,
                newUsersThisWeek,
                newBlogsThisWeek
            },
            recentUsers,
            recentBlogs,
            topBlogs
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ error: err.message });
    }
});

// ==================== ADMIN USER MANAGEMENT ====================

server.post('/admin/users', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { page = 1, query, filter } = req.body;
        const limit = 10;
        const skip = (page - 1) * limit;

        let findQuery = {};
        if (query) {
            findQuery.$or = [
                { "personal_info.username": new RegExp(query, 'i') },
                { "personal_info.fullname": new RegExp(query, 'i') },
                { "personal_info.email": new RegExp(query, 'i') }
            ];
        }
        if (filter === 'admin') {
            findQuery.admin = true;
        } else if (filter === 'user') {
            findQuery.admin = false;
        }

        const totalDocs = await User.countDocuments(findQuery);
        const users = await User.find(findQuery)
            .skip(skip)
            .limit(limit)
            .sort({ joinedAt: -1 })
            .select("personal_info.fullname personal_info.email personal_info.username personal_info.profile_img admin google_auth account_info joinedAt");

        return res.status(200).json({ users, totalDocs });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

server.post('/admin/update-user-role', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId, isAdmin } = req.body;
        await User.findByIdAndUpdate(userId, { admin: isAdmin });

        return res.status(200).json({ message: 'User role updated successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

server.post('/admin/delete-user', verifyJWT, async (req, res) => {
    try {
        if (!req.admin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const { userId } = req.body;

        // Delete user's blogs, comments, notifications
        await Notification.deleteMany({ $or: [{ user: userId }, { notification_for: userId }] });
        await Comment.deleteMany({ commented_by: userId });
        await Blog.deleteMany({ author: userId });
        await User.findByIdAndDelete(userId);

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

server.listen(PORT, () => {
    console.log('🚀 Server listening on port -> ' + PORT);
});
