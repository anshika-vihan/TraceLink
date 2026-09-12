// ==========================================
// FIREBASE IMPORTS
// ==========================================

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";


import {

    getFirestore,
    collection,
    addDoc,
    getDocs,
    doc,
    updateDoc,
    deleteDoc

}
from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";


// ==========================================
// FIREBASE CONFIGURATION
// ==========================================

const firebaseConfig = {

    apiKey: "AIzaSyCJ5OFkwXJCKqUhgsT2isK1f_pC3_8vgS0",

    authDomain: "tracelink-920ad.firebaseapp.com",

    projectId: "tracelink-920ad",

    messagingSenderId: "972735679884",

    appId: "1:972735679884:web:6e78a4e345612f7d089aa9"

};


// ==========================================
// INITIALIZE FIREBASE
// ==========================================

const app = initializeApp(firebaseConfig);


// ==========================================
// FIRESTORE DATABASE
// ==========================================

const db = getFirestore(app);


// ==========================================
// EXPORT EVERYTHING NEEDED
// ==========================================

export {

    db,

    collection,

    addDoc,

    getDocs,

    doc,

    updateDoc,

    deleteDoc

};