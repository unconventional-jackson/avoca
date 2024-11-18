import './GlobalSidebar.css';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faInbox, faSignOut, faUser } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useMemo } from 'react';
import { Tooltip } from '@mui/material';
import AvocaLogoUrl from '../../assets/avoca_logo.jpg';
import { useQueryClient } from '@tanstack/react-query';

export function GlobalSidebar() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();

  const location = useLocation();

  const matchedPath = useMemo(() => {
    const nonUuidPathComponents = location.pathname
      .split('/')
      .filter((c) => !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(c));

    const matchablePathComponents = nonUuidPathComponents.filter((c) =>
      ['map', 'forms', 'events', 'images', 'users', 'teams', 'roles', 'audit'].includes(c)
    );

    const finalPathComponent = matchablePathComponents.pop();

    return finalPathComponent;
  }, [location.pathname]);

  const formsPathSelected = useMemo(() => matchedPath === 'forms', [matchedPath]);
  const usersPathSelected = useMemo(() => matchedPath === 'users', [matchedPath]);
  const notificationsPathSelected = useMemo(() => matchedPath === 'notifications', [matchedPath]);

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      queryClient.clear();
      localStorage.clear();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  }, [queryClient, signOut]);

  /**
   * Determine the current user's name
   */
  const userName = useMemo(() => {
    return 'Unknown User';
  }, []);

  const handleSelectUserProfile = () => {
    return;
  };

  return (
    <div className="sidebar">
      <div className="sidebar-top-section">
        <div className="sidebar-icon-container">
          <img src={AvocaLogoUrl} className="sidebar-logo" alt="app icon" />
        </div>
        <div className="sidebar-top-section">
          <Link
            to={`/app/forms`}
            className={`sidebar-navigation-link ${formsPathSelected ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faFileAlt} className="sidebar-navigation-link-icon" />
            <span>Forms</span>
          </Link>
          <Link
            to={`/app/users`}
            className={`sidebar-navigation-link ${usersPathSelected ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faUser} className="sidebar-navigation-link-icon" />
            <span>Operators</span>
          </Link>
          {/* <Link
        to={`/app/teams`}
        className={`sidebar-navigation-link ${teamsPathSelected ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faUserGroup} className="sidebar-navigation-link-icon" />
        <span>Teams</span>
      </Link> */}
          {/* <Link
        to={`/app/roles`}
        className={`sidebar-navigation-link ${rolesPathSelected ? 'active' : ''}`}
      >
        <FontAwesomeIcon icon={faIdBadge} className="sidebar-navigation-link-icon" />
        <span>Roles</span>
      </Link> */}
          <Link
            to={`/app/documentation`}
            className={`sidebar-navigation-link ${notificationsPathSelected ? 'active' : ''}`}
          >
            <FontAwesomeIcon icon={faInbox} className="sidebar-navigation-link-icon" />
            <span>API Docs</span>
          </Link>
        </div>
      </div>
      <div className="sidebar-bottom-section">
        <Tooltip title="Profile">
          <div className="sidebar-navigation-link" onClick={handleSelectUserProfile}>
            <FontAwesomeIcon icon={faUser} className="sidebar-navigation-link-icon" />
            <span>{userName}</span>
          </div>
        </Tooltip>
        <Tooltip title="Sign out">
          <div className="sidebar-navigation-link" onClick={handleSignOut}>
            <FontAwesomeIcon icon={faSignOut} className="sidebar-navigation-link-icon" />
            <span>Sign Out</span>
          </div>
        </Tooltip>
      </div>
    </div>
  );
}
