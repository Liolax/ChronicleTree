import React from 'react';
import { FaUser, FaUsers, FaCog } from 'react-icons/fa';

const PageLoader = ({ icon: Icon, title, message }) => {
  const progressStyle = {
    animation: 'indeterminate-progress 1.5s ease-in-out infinite'
  };

  const keyframes = `
    @keyframes indeterminate-progress {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
  `;

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: keyframes }} />
      <div className="flex flex-col items-center justify-center h-screen-60 w-full bg-slate-50 rounded-lg" style={{ height: '60vh', minHeight: '400px' }}>
        <div className="relative flex items-center justify-center">
          <div className="absolute h-24 w-24 rounded-full bg-slate-200/50 animate-pulse"></div>
          <div className="relative h-20 w-20 flex items-center justify-center bg-white rounded-full shadow-sm">
            <Icon className="h-10 w-10 text-slate-500" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{message}</p>
        </div>
        <div className="mt-8 w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div className="h-full bg-slate-400 rounded-full" style={progressStyle}></div>
        </div>
      </div>
    </>
  );
};

// Specific loader variants
export const ProfileLoader = () => (
  <PageLoader 
    icon={FaUser} 
    title="Loading Profile" 
    message="Gathering personal details..." 
  />
);

export const FamilyTreeLoader = () => (
  <PageLoader 
    icon={FaUsers} 
    title="Building Your Family Tree" 
    message="Connecting the generations..." 
  />
);

export const SettingsLoader = () => (
  <PageLoader 
    icon={FaCog} 
    title="Loading Settings" 
    message="Preparing your preferences..." 
  />
);

export default PageLoader;