// src/js/firebase.js

import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyD_vgZDTseipBQgo2oXJeZUyczCEzWg_8w",
    authDomain: "album-thehunter.firebaseapp.com",
    projectId: "album-thehunter",
    storageBucket: "album-thehunter.firebasestorage.app",
    messageSenderId: "369481100721",
    appId: "1:369481100721:web:e5ce08c635536fb7e0a190",
    measurementId: "G-3G5VBWBEDL"
};

const app = firebase.initializeApp(firebaseConfig);
export const auth = firebase.auth();
export const db = firebase.firestore();
export let currentUser = null;

export function getDefaultDataStructure() {
    return {
        pelagens: {},
        diamantes: {},
        greats: {},
        super_raros: {},
        grindSessions: []
    };
}

export async function loadDataFromFirestore() {
    if (!currentUser) return getDefaultDataStructure();
    const userRef = db.collection('usuários').doc(currentUser.uid);
    try {
        const doc = await userRef.get();
        if (doc.exists) {
            const cloud = doc.data();
            return { ...getDefaultDataStructure(), ...cloud };
        } else {
            const def = getDefaultDataStructure();
            await userRef.set(def);
            return def;
        }
    } catch {
        return getDefaultDataStructure();
    }
}

export function saveData(data) {
    if (!currentUser) return;
    db.collection('usuários').doc(currentUser.uid).set(data)
      .catch(console.error);
}
