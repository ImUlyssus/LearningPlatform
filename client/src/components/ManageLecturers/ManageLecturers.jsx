// src/pages/ManageLecturers.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import LecturerCard from '../LecturerCard/LecturerCard'; // **Keeping this import path as requested**
import { getAllLecturers, deleteLecturer, recoverLecturer } from '../../services/lecturer';
import { PlusCircle, Search } from 'lucide-react';

const ManageLecturers = () => {
  const [allLecturers, setAllLecturers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchLecturers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllLecturers();
      setAllLecturers(response.data.lecturers);
    } catch (err) {
      console.error('Failed to fetch lecturers:', err);
      setError('Failed to load lecturers. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLecturers();
  }, [fetchLecturers]);

  // Filter and search logic
  const filteredLecturers = useMemo(() => {
    let currentLecturers = allLecturers;

    // Apply status filter
    if (filterStatus === 'active') {
      currentLecturers = currentLecturers.filter(lec => !lec.is_deleted);
    } else if (filterStatus === 'deleted') {
      currentLecturers = currentLecturers.filter(lec => lec.is_deleted);
    }

    // Apply search term filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      currentLecturers = currentLecturers.filter(
        lec =>
          lec.username.toLowerCase().includes(lowerCaseSearchTerm) ||
          lec.email.toLowerCase().includes(lowerCaseSearchTerm) ||
          (lec.phone && lec.phone.toLowerCase().includes(lowerCaseSearchTerm))
      );
    }

    return currentLecturers;
  }, [allLecturers, filterStatus, searchTerm]);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to soft delete this lecturer? This action can be undone.')) {
      try {
        await deleteLecturer(id);
        alert('Lecturer soft-deleted successfully!');
        fetchLecturers();
      } catch (err) {
        console.error('Failed to delete lecturer:', err);
        setError(err.response?.data?.message || 'Failed to soft delete lecturer. It might already be deleted or an error occurred.');
      }
    }
  };

  const handleRecover = async (id) => {
    if (window.confirm('Are you sure you want to recover this lecturer?')) {
      try {
        await recoverLecturer(id);
        alert('Lecturer recovered successfully!');
        fetchLecturers();
      } catch (err) {
        console.error('Failed to recover lecturer:', err);
        setError(err.response?.data?.message || 'Failed to recover lecturer. It might not be deleted or an error occurred.');
      }
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-8 text-center text-xl font-medium text-gray-700">
        <div className="flex justify-center items-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading lecturers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-8 text-center text-xl font-medium text-red-600 bg-red-50 rounded-lg border border-red-200">
        <p className="mb-2">Error: {error}</p>
        <button onClick={fetchLecturers} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-4 sm:mb-0">Manage Lecturers</h2>
        <Link
          to="/manage-lecturers/add"
          className="flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition-colors duration-200"
        >
          <PlusCircle className="w-5 h-5 mr-2" /> Add New Lecturer
        </Link>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white p-5 rounded-lg shadow-md mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-grow w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full md:w-auto">
          <label htmlFor="statusFilter" className="sr-only">Filter by Status</label>
          <select
            id="statusFilter"
            className="w-full py-2 px-3 border border-gray-300 rounded-md bg-white focus:ring-indigo-500 focus:border-indigo-500"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Lecturers</option>
            <option value="active">Active Lecturers</option>
            <option value="deleted">Deleted Lecturers</option>
          </select>
        </div>
      </div>

      {/* Lecturer List - Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLecturers.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3 text-center p-8 bg-white rounded-lg shadow-md">
            <p className="text-gray-600 text-lg">No lecturers found matching your criteria.</p>
            {searchTerm || filterStatus !== 'all' ? (
              <button
                onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}
                className="mt-4 px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
              >
                Clear Filters
              </button>
            ) : null}
          </div>
        ) : (
          filteredLecturers.map((lecturer) => (
            <LecturerCard // Using LecturerCard as the component name
              key={lecturer.id}
              lecturer={lecturer} // Pass the entire lecturer object
              onDelete={handleDelete}
              onRecover={handleRecover}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default ManageLecturers;
