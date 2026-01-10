import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
    <h1 className="text-6xl font-black text-indigo-600">404</h1>
    <p className="text-xl font-bold text-slate-900 mt-4">Page Not Found</p>
    <p className="text-slate-500 mt-2">The medical record or portal you requested doesn't exist.</p>
    <Link to="/" className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">
      Return Home
    </Link>
  </div>
);

export default NotFound;