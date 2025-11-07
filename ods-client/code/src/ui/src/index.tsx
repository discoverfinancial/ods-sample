/**
 * Copyright (c) 2025 Capital One
*/

import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

document.title = "ODS Sample App"

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
