import './App.css';
import AdvancedTicTacToe from './AdvancedTicTacToe';
import { DndProvider } from 'react-dnd';
import { MultiBackend, HTML5DragTransition, TouchTransition } from 'dnd-multi-backend';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { TouchBackend } from 'react-dnd-touch-backend';

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnsNlJjiwALD0aXax2zjzk5Jvh5AY6ea4",
  authDomain: "coneatov2.firebaseapp.com",
  projectId: "coneatov2",
  storageBucket: "coneatov2.firebasestorage.app",
  messagingSenderId: "463333503872",
  appId: "1:463333503872:web:5465a6c56500b08a1d4765",
  measurementId: "G-3GCF45ELFM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

function App() {
  return (
    <DndProvider
      backend={MultiBackend}
      options={{
        backends: [
          // First use the HTML5 backend:
          {
            backend: HTML5Backend,
            transition: HTML5DragTransition,
          },
          // Then use the Touch backend (for mobile):
          {
            backend: TouchBackend,
            options: { enableMouseEvents: true }, // so it also listens to mouse
            transition: TouchTransition,
          },
        ],
      }}
    >
      <AdvancedTicTacToe />
    </DndProvider>

  

  );
}

export default App;
