import { useContext, useEffect, useState } from "react";
import { UserContext } from "../App";
import { Navigate, useParams } from "react-router-dom";
import BlogEditor from "../components/blog-editor.component";
import PublishForm from "../components/publish-form.component";
import { createContext } from 'react';
import Loader from "../components/loader.component";
import axios from "axios";
import PageNotFound from "./404.page";
import { storeInSession } from "../common/session";

const blogStructure = {
    title: '',
    banner: '',
    content: [],
    tags: [],
    des: '',
    category: '',
    author: { personal_info: { } }
}

export const EditorContext = createContext({ }); 

const Editor = () => {

    let { blog_id } = useParams();

    const [ blog, setBlog ] = useState(blogStructure)
    const [ editorState, setEditorState ] = useState("editor");
    const [ textEditor, setTextEditor ] = useState({ isReady: false });
    const [ loading, setLoading ] = useState(true);
    const [ adminChecked, setAdminChecked ] = useState(false);

    let { userAuth, userAuth: { access_token, isAdmin }, setUserAuth } = useContext(UserContext) 

    useEffect(() => {
        if (access_token) {
            axios.get(import.meta.env.VITE_SERVER_DOMAIN + "/check-admin-status", {
                headers: { Authorization: `Bearer ${access_token}` }
            })
            .then(({ data }) => {
                if (data.isAdmin !== isAdmin) {
                    let updatedUserAuth = { ...userAuth, isAdmin: data.isAdmin };
                    storeInSession("user", JSON.stringify(updatedUserAuth));
                    setUserAuth(updatedUserAuth);
                }
                setAdminChecked(true);
            })
            .catch(() => {
                setAdminChecked(true);
            });
        }
    }, [access_token])

    useEffect(() => {

        if(!blog_id){
            return setLoading(false);
        }

        axios.post(import.meta.env.VITE_SERVER_DOMAIN + "/get-blog", { blog_id, draft: true, mode: 'edit' })
        .then(( { data: { blog }} ) => {
            setBlog(blog);
            setLoading(false);
        })
        .catch(err => {
            setBlog(null);
            setLoading(false);
        })

    }, [])

    return (
        <EditorContext.Provider value={{ blog, setBlog, editorState, setEditorState, textEditor, setTextEditor }}>
            {
                access_token === null ? <Navigate to="/signin" /> 
                : 
                !adminChecked || loading ? <Loader /> :
                !isAdmin ? <Navigate to="/404" /> :
                editorState == "editor" ? <BlogEditor /> : <PublishForm /> 
            }
        </EditorContext.Provider>
    )
}

export default Editor;