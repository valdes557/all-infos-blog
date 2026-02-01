import { initializeApp } from "firebase/app";
import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyB-siDEYPqZfMvtTcX58eXYJj5DG5Fq8I8",
  authDomain: "allinfo-310b2.firebaseapp.com",
  projectId: "allinfo-310b2",
  storageBucket: "allinfo-310b2.firebasestorage.app",
  messagingSenderId:"138323655203",
  appId: "1:138323655203:web:feaeca8ce0a3c2f62a0f96",
};

const app = initializeApp(firebaseConfig);

// google auth

const provider = new GoogleAuthProvider();

const auth = getAuth();

export const authWithGoogle = async () => {

    let user = null;

    await signInWithPopup(auth, provider)
    .then((result) => {
        user = result.user
    })
    .catch((err) => {
        console.log(err)
    })

    return user;
}