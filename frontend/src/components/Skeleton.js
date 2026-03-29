// src/components/Skeleton.js
import React from 'react';
import './Skeleton.css';

/**
 * Reusable Skeleton Loader Component
 * @param {string} variant - Type of skeleton: 'text', 'card', 'avatar', 'image', 'profile'
 * @param {number} count - Number of skeleton items to render
 * @param {string} className - Additional CSS class
 * @param {object} style - Inline styles
 */
export const Skeleton = ({ 
  variant = 'text', 
  count = 1, 
  className = '', 
  style = {} 
}) => {
  const skeletons = [];
  
  for (let i = 0; i < count; i++) {
    skeletons.push(
      <div
        key={i}
        className={`skeleton skeleton-${variant} ${className}`}
        style={style}
      />
    );
  }
  
  return <>{skeletons}</>;
};

/**
 * Profile Card Skeleton - For National ID Card
 */
export const ProfileSkeleton = () => (
  <div className="profile-skeleton">
    <div className="profile-header-skeleton">
      <Skeleton variant="avatar" />
      <div className="profile-info-skeleton">
        <Skeleton variant="text" count={2} />
      </div>
    </div>
    <Skeleton variant="text" count={4} className="profile-details-skeleton" />
    <Skeleton variant="text" className="profile-bio-skeleton" />
  </div>
);

/**
 * Project Card Skeleton
 */
export const ProjectCardSkeleton = ({ count = 3 }) => (
  <div className="project-cards-skeleton">
    <Skeleton variant="card" count={count} />
  </div>
);

/**
 * Task Card Skeleton
 */
export const TaskCardSkeleton = ({ count = 5 }) => (
  <div className="task-cards-skeleton">
    <Skeleton variant="card" count={count} />
  </div>
);

/**
 * Page Skeleton Wrapper
 */
export const PageSkeleton = ({ children, className = '' }) => (
  <div className={`page-skeleton ${className}`}>
    {children}
  </div>
);

export default Skeleton;
