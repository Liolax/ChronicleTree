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
        <li key={fact.id} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-slate-100 shadow group hover:bg-blue-50 transition">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1 min-w-0">
            {/* Fact Type (label) */}
            <span className="text-xs font-semibold text-blue-600 min-w-[80px] flex items-center gap-1">
              <FaInfoCircle className="mr-1 text-blue-400" />
              {labelMap[fact.label] || fact.label}
            </span>
            {/* Date */}
            <span className="text-xs text-slate-700 flex items-center gap-1">
              <FaCalendarAlt className="text-slate-400" />
              {fact.date ? new Date(fact.date).toLocaleDateString() : ''}
            </span>
            {/* Location */}
            {fact.location && (
              <span className="text-xs text-slate-500 ml-2 flex items-center gap-1">
                <FaMapMarkerAlt className="text-slate-300" />{fact.location}
              </span>
            )}
            {/* Value / Description */}
            {fact.value && (
              <span className="text-xs text-slate-500 ml-2 flex items-center gap-1">
                <FaAlignLeft className="text-slate-300" />{fact.value}
              </span>
            )}
          </div>
          {(onEdit || onDelete) && (
            <div className="flex gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100" onClick={() => onEdit(fact)} title="Edit Fact">
                  <FaPen className="text-blue-600" />
                </button>
              )}
              {onDelete && (
                <button className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100" onClick={() => onDelete(fact.id)} title="Delete Fact">
                  <FaTrashAlt className="text-red-600" />
                </button>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
};

export default FactList;
