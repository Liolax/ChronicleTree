import React from 'react';
import { FaCalendarAlt, FaInfoCircle, FaMapMarkerAlt, FaAlignLeft, FaPen, FaTrashAlt } from 'react-icons/fa';

const FactList = ({ facts, onEdit, onDelete }) => {
  // Map backend labels to user-friendly display labels
  const labelMap = {
    'Current Occupation': 'Occupation',
    'Current Hobby': 'Hobby',
    'Current Residence': 'Residence',
    'Current School': 'School',
    'Military Service': 'Military Service',
  };
  if (!facts || facts.length === 0) {
    return <div className="text-gray-400 text-center py-6">No key facts available.</div>;
  }
  return (
    <ul className="space-y-2 text-app-primary text-sm">
      {facts.map((fact) => (
        <li key={fact.id} className="bg-white rounded-lg px-3 py-3 border border-slate-100 shadow group hover:bg-blue-50 transition">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0 space-y-2">
              {/* Fact Type (label) - Always on top */}
              <div className="flex items-center gap-2">
                <FaInfoCircle className="text-blue-400 flex-shrink-0" />
                <span className="text-sm font-semibold text-blue-600 truncate">
                  {labelMap[fact.label] || fact.label}
                </span>
              </div>
              
              {/* Metadata row */}
              <div className="flex flex-wrap gap-3 text-xs text-slate-600">
                {fact.date && (
                  <span className="flex items-center gap-1">
                    <FaCalendarAlt className="text-slate-400" />
                    {new Date(fact.date).toLocaleDateString()}
                  </span>
                )}
                {fact.location && (
                  <span className="flex items-center gap-1">
                    <FaMapMarkerAlt className="text-slate-400" />
                    <span className="truncate max-w-[120px]">{fact.location}</span>
                  </span>
                )}
              </div>
              
              {/* Value / Description */}
              {fact.value && (
                <div className="flex items-start gap-2">
                  <FaAlignLeft className="text-slate-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-slate-700 break-words">{fact.value}</span>
                </div>
              )}
            </div>
            
            {/* Action buttons */}
            {(onEdit || onDelete) && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                {onEdit && (
                  <button 
                    className="bg-white border border-gray-300 rounded-full p-1.5 shadow hover:bg-blue-100 transition-colors" 
                    onClick={() => onEdit(fact)} 
                    title="Edit Fact"
                  >
                    <FaPen className="text-blue-600 w-3 h-3" />
                  </button>
                )}
                {onDelete && (
                  <button 
                    className="bg-white border border-gray-300 rounded-full p-1.5 shadow hover:bg-red-100 transition-colors" 
                    onClick={() => onDelete(fact.id)} 
                    title="Delete Fact"
                  >
                    <FaTrashAlt className="text-red-600 w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FactList;
