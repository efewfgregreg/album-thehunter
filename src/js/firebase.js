import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { getFirestore, doc, getDoc, setDoc, collection } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyD_vgZDTseipBQgo2oXJeZUyczCEzWg_8w",
    authDomain: "album-thehunter.firebaseapp.com",
    projectId: "album-thehunter",
    storageBucket: "album-thehunter.firebasestorage.app",
    messageSenderId: "369481100721",
    appId: "1:369481100721:web:e5ce08c635536fb7e0a190",
    measurementId: "G-3G5VBWBEDL"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export let currentUser = null;

onAuthStateChanged(auth, (user) => {
    currentUser = user;
});

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
    const userRef = doc(db, 'usuários', currentUser.uid);
    try {
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
            const cloud = docSnap.data();
            return { ...getDefaultDataStructure(), ...cloud };
        } else {
            const def = getDefaultDataStructure();
            await setDoc(userRef, def);
            return def;
        }
    } catch {
        return getDefaultDataStructure();
    }
}

export function saveData(data) {
    if (!currentUser) return;
    const userRef = doc(db, 'usuários', currentUser.uid);
    setDoc(userRef, data).catch(console.error);
}
