
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "h-8 w-8", size = 32 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Shield */}
      <path 
        d="M50 5L15 20V45C15 65.5 29.8 84.4 50 95C70.2 84.4 85 65.5 85 45V20L50 5Z" 
        fill="currentColor" 
        className="text-indigo-600 dark:text-indigo-500"
      />
      
      {/* Book Icon */}
      <path 
        d="M30 35H70V65C70 67.2 68.2 69 66 69H34C31.8 69 30 67.2 30 65V35Z" 
        fill="white" 
        fillOpacity="0.9"
      />
      <path 
        d="M50 35V69" 
        stroke="currentColor" 
        strokeWidth="2" 
        className="text-indigo-200"
      />
      <path 
        d="M30 40H70M30 48H70M30 56H70" 
        stroke="currentColor" 
        strokeWidth="1.5" 
        strokeOpacity="0.3"
        className="text-indigo-900"
      />

      {/* Lightning Bolt */}
      <path 
        d="M52 25L42 45H52L48 65L58 45H48L52 25Z" 
        fill="#FBBF24" 
        stroke="white" 
        strokeWidth="1"
      />
    </svg>
  );
};

export default Logo;
