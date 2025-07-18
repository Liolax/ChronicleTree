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
              <div className="flex-1 bg-white rounded-xl shadow border border-slate-100 px-6 py-4 hover:bg-blue-50 transition">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-lg text-slate-800 truncate flex items-center gap-2">{event.title}</span>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                      <button className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-blue-100" onClick={() => onEdit(event)} title="Edit Event">
                        <FaPen className="text-blue-600" />
                      </button>
                    )}
                    {onDelete && (
                      <button className="bg-white border border-gray-300 rounded-full p-1 shadow hover:bg-red-100" onClick={() => onDelete(event.id)} title="Delete Event">
                        <FaTrashAlt className="text-red-600" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 mb-1">
                  <FaCalendarAlt className="text-slate-300" />
                  {event.date ? new Date(event.date).toLocaleDateString() : ''}
                </div>
                {event.description && <p className="text-sm text-slate-500 mt-1 flex items-center gap-2"><FaAlignLeft className="text-slate-300" />{event.description}</p>}
                {event.place && (
                  <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                    <FaMapMarkerAlt className="text-slate-300" />
                    {event.place}
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
