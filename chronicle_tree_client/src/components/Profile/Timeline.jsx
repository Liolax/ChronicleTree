import React from 'react';
import { FaFlag, FaCalendarAlt, FaAlignLeft, FaPen, FaTrashAlt, FaBirthdayCake, FaGraduationCap, FaBriefcase, FaHome, FaHeart, FaStar, FaPlane, FaTrophy, FaMapMarkerAlt } from 'react-icons/fa';

const ICON_MAP = {
  Flag: FaFlag,
  Birthday: FaBirthdayCake,
  Graduation: FaGraduationCap,
  Work: FaBriefcase,
  Home: FaHome,
  Love: FaHeart,
  Star: FaStar,
  Travel: FaPlane,
  Trophy: FaTrophy,
};

export default function Timeline({ events, onEdit, onDelete }) {
  if (!events || events.length === 0) {
    return <div className="text-gray-400 text-center py-6">No timeline events available.</div>;
  }
  // Sort events by date ascending
  const sortedEvents = [...events].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return new Date(a.date) - new Date(b.date);
  });
  return (
    <div className="relative pl-8 pr-2">
      {/* Timeline vertical bar */}
      <div className="absolute left-4 top-0 bottom-0 w-1 bg-gradient-to-b from-app-accent via-app-secondary/50 to-app-secondary/10 rounded-full" style={{zIndex:0}}></div>
      <ul className="space-y-8">
        {sortedEvents.map((event, idx) => {
          const Icon = ICON_MAP[event.icon] || FaFlag;
          return (
            <li key={event.id} className="relative flex gap-4 group" style={{zIndex:1}}>
              {/* Timeline dot and connector */}
              <div className="flex flex-col items-center">
                <span className="w-8 h-8 rounded-full bg-white border-2 border-blue-200 shadow flex items-center justify-center text-xl text-blue-500 mb-1">
                  <Icon />
                </span>
                {idx !== sortedEvents.length - 1 && (
                  <span className="w-1 h-full bg-gradient-to-b from-blue-200 to-transparent"></span>
                )}
              </div>
              {/* Event card */}
              <div className="flex-1 bg-white rounded-xl shadow border border-slate-100 px-4 md:px-6 py-4 hover:bg-blue-50 transition min-w-0">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h4 className="font-bold text-base md:text-lg text-slate-800 break-words flex-1 leading-tight">
                    {event.title}
                  </h4>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                    {onEdit && (
                      <button 
                        className="bg-white border border-gray-300 rounded-full p-1.5 shadow hover:bg-blue-100 transition-colors" 
                        onClick={() => onEdit(event)} 
                        title="Edit Event"
                      >
                        <FaPen className="text-blue-600 w-3 h-3" />
                      </button>
                    )}
                    {onDelete && (
                      <button 
                        className="bg-white border border-gray-300 rounded-full p-1.5 shadow hover:bg-red-100 transition-colors" 
                        onClick={() => onDelete(event.id)} 
                        title="Delete Event"
                      >
                        <FaTrashAlt className="text-red-600 w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
                
                {/* Date and place metadata */}
                <div className="flex flex-wrap gap-3 text-sm text-slate-600 mb-2">
                  {event.date && (
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt className="text-slate-400 flex-shrink-0" />
                      {new Date(event.date).toLocaleDateString()}
                    </span>
                  )}
                  {event.place && (
                    <span className="flex items-center gap-1">
                      <FaMapMarkerAlt className="text-slate-400 flex-shrink-0" />
                      <span className="truncate max-w-[150px]">{event.place}</span>
                    </span>
                  )}
                </div>
                
                {/* Description */}
                {event.description && (
                  <div className="flex items-start gap-2 mt-2">
                    <FaAlignLeft className="text-slate-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-slate-600 break-words leading-relaxed">{event.description}</p>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
