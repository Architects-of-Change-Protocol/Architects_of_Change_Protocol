import { jsx as _jsx } from "react/jsx-runtime";
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';
const root = document.getElementById('root');
if (!root) {
    throw new Error('Missing #root element');
}
createRoot(root).render(_jsx(App, {}));
