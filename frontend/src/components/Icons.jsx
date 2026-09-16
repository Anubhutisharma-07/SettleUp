import React from 'react';

const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

const make = (path, viewBox = '0 0 24 24') =>
  function IconComponent({ size = 16, strokeWidth, className = '' }) {
    return (
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        {...base}
        strokeWidth={strokeWidth || base.strokeWidth}
        className={className}
        aria-hidden="true"
      >
        {path}
      </svg>
    );
  };

export const IconPlus = make(<path d="M12 5v14M5 12h14" />);
export const IconChevronRight = make(<path d="M9 18l6-6-6-6" />);
export const IconChevronLeft = make(<path d="M15 18l-6-6 6-6" />);
export const IconArrowLeft = make(
  <>
    <path d="M19 12H5" />
    <path d="M12 19l-7-7 7-7" />
  </>
);
export const IconArrowRight = make(
  <>
    <path d="M5 12h14" />
    <path d="M13 6l6 6-6 6" />
  </>
);
export const IconCheck = make(<path d="M20 6L9 17l-5-5" />);
export const IconCheckCircle = make(
  <>
    <circle cx="12" cy="12" r="10" />
    <path d="M8.5 12.5l2.5 2.5 5-5.5" />
  </>
);
export const IconSearch = make(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
  </>
);
export const IconSun = make(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </>
);
export const IconMoon = make(<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />);
export const IconLogout = make(
  <>
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </>
);
export const IconUsers = make(
  <>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
  </>
);
export const IconReceipt = make(
  <>
    <path d="M5 3h14a1 1 0 011 1v17l-3-2-2 2-2-2-2 2-2-2-3 2V4a1 1 0 011-1z" />
    <path d="M9 8h6M9 12h6" />
  </>
);
export const IconScale = make(
  <>
    <path d="M12 3v18" />
    <path d="M5 7h14" />
    <path d="M5 7l-3 6a3.5 3.5 0 007 0L5 7zM19 7l-3 6a3.5 3.5 0 007 0L19 7z" />
    <path d="M8 21h8" />
  </>
);
export const IconHandshake = make(
  <>
    <path d="M2 9.5L6.5 5l4.5 1.5L15 5l4.5 4.5" />
    <path d="M2 9.5V14l4 4.5" />
    <path d="M22 9.5V14l-4 4.5" />
    <path d="M9 13.5l2 2a1.4 1.4 0 002 0l2-2" />
  </>
);
export const IconWallet = make(
  <>
    <rect x="2" y="5" width="20" height="15" rx="3" />
    <path d="M2 10h20" />
    <path d="M16 15h2" />
  </>
);
export const IconX = make(
  <>
    <path d="M18 6L6 18" />
    <path d="M6 6l12 12" />
  </>
);
export const IconAlert = make(
  <>
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
    <path d="M12 9v4M12 17h.01" />
  </>
);
export const IconUserPlus = make(
  <>
    <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M19 8v6M22 11h-6" />
  </>
);
export const IconSparkles = make(
  <>
    <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3z" />
    <path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z" />
  </>
);
export const IconClock = make(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
  </>
);
export const IconMenu = make(
  <>
    <path d="M4 7h16" />
    <path d="M4 12h16" />
    <path d="M4 17h16" />
  </>
);
export const IconCode = make(
  <>
    <path d="M16 18l6-6-6-6" />
    <path d="M8 6l-6 6 6 6" />
  </>
);
export const IconHotel = make(
  <>
    <path d="M4 21V5a2 2 0 012-2h8a2 2 0 012 2v16" />
    <path d="M16 9h3a1 1 0 011 1v11" />
    <path d="M2 21h20" />
    <path d="M8 7h2M8 11h2M8 15h2" />
  </>
);
export const IconCab = make(
  <>
    <path d="M5 17H3v-4l2-5h11l3 5h2v4h-2" />
    <circle cx="7.5" cy="17" r="2" />
    <circle cx="16.5" cy="17" r="2" />
    <path d="M9.5 17h5" />
  </>
);
export const IconActivity = make(<path d="M22 12h-4l-3 8-6-16-3 8H2" />);
export const IconRotate = make(
  <>
    <path d="M1 4v6h6" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </>
);
export const IconLock = make(
  <>
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </>
);
export const IconSpinner = function IconSpinner({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={`animate-spin ${className}`} aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="42"
        strokeDashoffset="12"
      />
    </svg>
  );
};
