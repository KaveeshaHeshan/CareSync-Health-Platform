import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, MapPin, Star } from 'lucide-react';

// Logic & Tools
import useDebounce from '../../hooks/useDebounce'; //
import { formatDate } from '../../utils/formatters'; //
import { useUIStore } from '../../store/useUIStore'; //

const BookingPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const debouncedSearch = useDebounce(searchTerm, 500); // Optimized search
  
  const openModal = useUIStore((state) => state.openModal); //

  // This would typically be replaced by an API call using debouncedSearch
  const doctors = [
    { id: 1, name: "Dr. Sarah Chen", specialty: "Cardiology", rating: 4.9, location: "Main Medical Center" },
    { id: 2, name: "Dr. James Wilson", specialty: "Dermatology", rating: 4.7, location: "West Side Clinic" },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* 1. Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Find a Specialist</h1>
          <p className="text-slate-500 mt-1">Book your next consultation with our top-rated providers.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text"
            placeholder="Search by doctor name or specialty..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* 2. Filters Sidebar */}
        <aside className="space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Filter size={18} /> Filters
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Specialty</label>
                <select 
                  className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none"
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                >
                  <option>All</option>
                  <option>Cardiology</option>
                  <option>Dermatology</option>
                  <option>Pediatrics</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-600">Preferred Date</label>
                <input type="date" className="w-full mt-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              </div>
            </div>
          </div>
        </aside>

        {/* 3. Doctor Results Grid */}
        <main className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
          {doctors.map((doc) => (
            <div key={doc.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group">
              <div className="flex justify-between items-start mb-4">
                <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 font-bold text-xl">
                  {doc.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2 py-1 rounded-lg text-sm font-bold">
                  <Star size={14} fill="currentColor" /> {doc.rating}
                </div>
              </div>
              
              <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{doc.name}</h4>
              <p className="text-indigo-600 text-sm font-medium">{doc.specialty}</p>
              
              <div className="mt-4 space-y-2 text-sm text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin size={16} /> {doc.location}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} /> Next Available: {formatDate(new Date(), 'short')}
                </div>
              </div>

              <button 
                onClick={() => openModal('BOOKING_FLOW')} 
                className="w-full mt-6 bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-indigo-600 transition-colors"
              >
                Book Appointment
              </button>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
};

export default BookingPage;