// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { 
    getFirestore, collection, addDoc, getDocs 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-firestore.js";
import { 
    getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

// Firebase Configuration (Replace with your Firebase project credentials)
const firebaseConfig = {
    apiKey: "AIzaSyD0010tuukyiUU7TWlxEE5jfwS_aG0eYLE",

    authDomain: "eco-app-66edf.firebaseapp.com",
  
    projectId: "eco-app-66edf",
  
    storageBucket: "eco-app-66edf.firebasestorage.app",
  
    messagingSenderId: "1066161952442",
  
    appId: "1:1066161952442:web:05510d018385b9bf93d483",
  
    measurementId: "G-JRE9ZB4XX2"
  
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/**
 * Sign up a new user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise} - Resolves with user data if successful.
 */
export async function signupUser(email, password) {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        console.log("Sign-up successful:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Sign-up error:", error.message);
        throw error;
    }
}

/**
 * Log in an existing user with email and password.
 * @param {string} email - User's email.
 * @param {string} password - User's password.
 * @returns {Promise} - Resolves with user data if successful.
 */
export async function loginUser(email, password) {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        console.log("Login successful:", userCredential.user);
        return userCredential.user;
    } catch (error) {
        console.error("Login error:", error.message);
        throw error;
    }
}

/**
 * Logs out the currently signed-in user.
 * @returns {Promise} - Resolves when user is successfully logged out.
 */
export async function logoutUser() {
    try {
        await signOut(auth);
        console.log("User logged out successfully.");
    } catch (error) {
        console.error("Logout error:", error.message);
        throw error;
    }
}

/**
 * Monitor authentication state changes.
 * @param {Function} callback - Function to call when auth state changes.
 */
export function monitorAuthState(callback) {
    onAuthStateChanged(auth, callback);
}

/**
 * Create a new event and store it in Firestore.
 * @param {string} userId - ID of the user creating the event.
 * @param {string} name - Event name.
 * @param {string} location - Event location.
 * @param {string} type - Type of event.
 * @param {string} description - Description of the event.
 * @param {string} eventLink - Any link or text associated with the event.
 * @returns {Promise} - Resolves when event is successfully created.
 */
export async function createEvent(userId, name, location, type, description, eventLink) {
    try {
        await addDoc(collection(db, "events"), {
            userId,
            name,
            location,
            type,
            description,
            eventLink, // Store whatever text is entered
            timestamp: new Date()
        });
        console.log("Event created successfully!");
    } catch (error) {
        console.error("Error creating event:", error);
        throw error;
    }
}

/**
 * Retrieve all events from Firestore.
 * @returns {Promise<Array>} - Resolves with an array of event objects.
 */
export async function getEvents() {
    try {
        const eventsSnapshot = await getDocs(collection(db, "events"));
        return eventsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Error retrieving events:", error);
        throw error;
    }
}

// Export auth and db for use in other files
export { auth, db };
