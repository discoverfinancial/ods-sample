/**
 * Copyright (c) 2025 Capital One
*/

import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

document.title = "Surveyor Dashboard"

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);
