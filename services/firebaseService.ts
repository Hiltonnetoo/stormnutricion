import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
    getAuth, 
    onAuthStateChanged, 
    User, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    GoogleAuthProvider, 
    signOut, 
    updateProfile, 
    createUserWithEmailAndPassword 
} from 'firebase/auth';
import { 
    getFirestore, 
    collection, 
    query, 
    where, 
    getDocs,
    onSnapshot,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    writeBatch,
    Timestamp,
    orderBy,
    getCountFromServer
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import type { Patient, DietPlan, AnyDietPlan } from '../types';

const firebaseConfig = {
  apiKey: "AIzaSyCs0qoSnNTb5s6op5A-ig8r7Suc6FXwslI",
  authDomain: "isanutri-v5.firebaseapp.com",
  projectId: "isanutri-v5",
  storageBucket: "isanutri-v5.appspot.com",
  messagingSenderId: "392525520603",
  appId: "1:392525520603:web:b9038e90e26396dfc376fe"
};

const app: FirebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const googleProvider = new GoogleAuthProvider();

export { 
    auth, 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    signInWithPopup, 
    googleProvider,
    updateProfile, 
    createUserWithEmailAndPassword,
};
export type { User };

// --- HELPER FOR ERROR HANDLING ---
const handleSnapshotError = (error: any, context: string) => {
    if (error.code === 'permission-denied') {
        console.warn(`[Firebase] Permission denied for ${context}. Check your Firestore Security Rules.`);
    } else {
        console.error(`[Firebase] Error in ${context}:`, error);
    }
};

// --- AUTH FUNCTIONS ---

export const firebaseSignOut = (authInstance: typeof auth) => {
    return signOut(authInstance);
};

// --- PROFILE FUNCTIONS ---

export const uploadProfilePicture = async (uid: string, file: File): Promise<string> => {
    const storageRef = ref(storage, `profilePictures/${uid}/${file.name}`);
    const snapshot = await uploadBytes(storageRef, file);
    return getDownloadURL(snapshot.ref);
};

export const updateUserProfile = (user: User, profile: { displayName?: string, photoURL?: string }) => {
    return updateProfile(user, profile);
};


// --- PATIENT FUNCTIONS ---
const getPatientsCollection = (userId: string) => collection(db, 'users', userId, 'patients');
const getPatientDoc = (userId: string, patientId: string) => doc(db, 'users', userId, 'patients', patientId);

export const addPatient = (userId: string, patientData: Omit<Patient, 'id'>) => {
    return addDoc(getPatientsCollection(userId), patientData);
};

export const updatePatient = (userId: string, patientId: string, patientData: Partial<Patient>) => {
    return updateDoc(getPatientDoc(userId, patientId), patientData);
}

export const deletePatient = async (userId: string, patientId: string) => {
    const dietsRef = getDietsCollection(userId);
    // Fetch all diets and filter client-side to find ones to delete
    // Note: This is less efficient but avoids index requirements for 'where'
    const dietsSnapshot = await getDocs(dietsRef);
    const dietDocs = dietsSnapshot.docs.filter(doc => doc.data().patientId === patientId);
    
    const batch = writeBatch(db);
    dietDocs.forEach(doc => batch.delete(doc.ref));
    batch.delete(getPatientDoc(userId, patientId));
    
    return batch.commit();
};

export const getPatients = (userId: string, callback: (patients: Patient[]) => void, onError?: (error: any) => void) => {
    if (!userId) return () => {};
    // Note: We removed server-side sorting (orderBy) to avoid "Missing Index" errors that can appear as permission issues.
    // We sort client-side instead.
    const q = query(getPatientsCollection(userId));
    return onSnapshot(q, (snapshot) => {
        const patients = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
            return { ...data, id: doc.id, createdAt } as Patient;
        });
        // Sort alphabetically by first name
        patients.sort((a, b) => a.firstName.localeCompare(b.firstName));
        callback(patients);
    }, (error) => {
        handleSnapshotError(error, 'getPatients');
        if (onError) onError(error);
    });
};

// --- DIET PLAN FUNCTIONS ---
const getDietsCollection = (userId: string) => collection(db, 'users', userId, 'diets');
const getDietDoc = (userId: string, dietId: string) => doc(db, 'users', userId, 'diets', dietId);

export const saveDietPlan = (userId: string, dietPlan: DietPlan) => {
    return addDoc(getDietsCollection(userId), dietPlan);
};

export const getDietPlansForPatient = (userId: string, patientId: string, callback: (diets: AnyDietPlan[]) => void, onError?: (error: any) => void) => {
    if (!userId) return () => {};
    // Client-side filtering to avoid index issues with 'where' clauses
    const q = query(getDietsCollection(userId));
    return onSnapshot(q, (snapshot) => {
        const diets = snapshot.docs
            .map(doc => {
                const data = doc.data();
                const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
                return { ...data, id: doc.id, createdAt } as AnyDietPlan;
            })
            .filter(diet => diet.patientId === patientId); // Client-side filter
            
        // Sort by date descending
        diets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(diets);
    }, (error) => {
        handleSnapshotError(error, 'getDietPlansForPatient');
        if (onError) onError(error);
    });
};

export const getAllDiets = (userId: string, callback: (diets: AnyDietPlan[]) => void, onError?: (error: any) => void) => {
    if (!userId) return () => {};
    // Note: Removed server-side sort to improve robustness against missing indexes.
    const q = query(getDietsCollection(userId));
    return onSnapshot(q, (snapshot) => {
        const diets = snapshot.docs.map(doc => {
            const data = doc.data();
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
            return { ...data, id: doc.id, createdAt } as AnyDietPlan;
        });
        // Sort by date descending
        diets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(diets);
    }, (error) => {
        handleSnapshotError(error, 'getAllDiets');
        if (onError) onError(error);
    });
};

// --- DASHBOARD COUNT FUNCTIONS ---
// Helper to perform client-side counting/filtering from a full collection snapshot
// This avoids "Missing Index" errors on specific queries (like filtering by date or status)
const getCountClientSide = (q: any, filterFn: (docData: any) => boolean, callback: (count: number) => void, contextName: string) => {
    return onSnapshot(q, (snapshot) => {
        let count = 0;
        snapshot.docs.forEach(doc => {
            if (filterFn(doc.data())) {
                count++;
            }
        });
        callback(count);
    }, (error) => {
        handleSnapshotError(error, contextName);
        // Do not crash UI on error, just don't update count (or could callback(0))
    });
};

export const getPatientsCount = (userId: string, callback: (count: number) => void) => {
    if (!userId) return () => {};
    return getCountClientSide(
        query(getPatientsCollection(userId)), 
        () => true, 
        callback, 
        'getPatientsCount'
    );
};

export const getActivePatientsCount = (userId: string, callback: (count: number) => void) => {
    if (!userId) return () => {};
    return getCountClientSide(
        query(getPatientsCollection(userId)), 
        (data) => data.status === 'Active', 
        callback, 
        'getActivePatientsCount'
    );
};

export const getNewPatientsThisMonthCount = (userId: string, callback: (count: number) => void) => {
    if (!userId) return () => {};
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const isoStart = startOfMonth.toISOString();
    
    return getCountClientSide(
        query(getPatientsCollection(userId)), 
        (data) => {
            const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
            return createdAt >= isoStart;
        }, 
        callback, 
        'getNewPatientsThisMonthCount'
    );
};

export const getDietsCount = (userId: string, callback: (count: number) => void) => {
    if (!userId) return () => {};
    return getCountClientSide(
        query(getDietsCollection(userId)), 
        () => true, 
        callback, 
        'getDietsCount'
    );
};

export const getDietsThisMonthCount = (userId: string, callback: (count: number) => void) => {
    if (!userId) return () => {};
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const isoStart = startOfMonth.toISOString();

    return getCountClientSide(
        query(getDietsCollection(userId)), 
        (data) => {
             const createdAt = data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt;
             return createdAt >= isoStart;
        }, 
        callback, 
        'getDietsThisMonthCount'
    );
};