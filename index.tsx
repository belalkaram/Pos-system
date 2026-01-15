import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadSeedData, SEED_ORDERS, SEED_PURCHASES, SEED_STOCK_MOVEMENTS, SEED_TABLES } from './seedData';

// تحميل البيانات التجريبية عند أول مرة يتم فيها تشغيل التطبيق
const initializeSeedData = () => {
  const isDataLoaded = localStorage.getItem('seed_data_initialized');

  if (!isDataLoaded) {
    console.log('🚀 تحميل البيانات التجريبية لأول مرة...');
    loadSeedData();
    localStorage.setItem('seed_data_initialized', 'true');
    console.log('✅ تم تحميل البيانات التجريبية بنجاح');
  } else {
    console.log('ℹ️ البيانات التجريبية تم تحميلها مسبقاً');
  }
};

// تشغيل التهيئة
initializeSeedData();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
