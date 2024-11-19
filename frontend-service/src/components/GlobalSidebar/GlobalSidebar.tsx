import './GlobalSidebar.css';
import './Calls.css';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOut } from '@fortawesome/free-solid-svg-icons';
import { useCallback } from 'react';
import {
  Box,
  Divider,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Tooltip,
} from '@mui/material';
import AvocaLogoUrl from '../../assets/avoca_logo.svg';
import { useQueryClient } from '@tanstack/react-query';
import { Person, Menu } from '@mui/icons-material';
import { usePhoneCalls } from '../../contexts/PhoneCallsContext';

export function GlobalSidebar() {
  const { signOut } = useAuth();
  const queryClient = useQueryClient();
  const { phoneCalls } = usePhoneCalls();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
      queryClient.clear();
      localStorage.clear();
    } catch (error) {
      console.error('Failed to sign out', error);
    }
  }, [queryClient, signOut]);

  return (
    <div className="sidebar">
      <div className="sidebar-top-section">
        <Box padding={2}>
          <img src={AvocaLogoUrl} className="sidebar-logo" alt="app icon" />
        </Box>
        <MenuList>
          <Link to="/app/customers">
            <MenuItem>
              <ListItemIcon>
                <Person fontSize="small" />
              </ListItemIcon>
              <ListItemText>Customers</ListItemText>
            </MenuItem>
          </Link>
          <Link to="/app/jobs">
            <MenuItem>
              <ListItemIcon>
                <Menu fontSize="small" />
              </ListItemIcon>
              <ListItemText>Jobs</ListItemText>
            </MenuItem>
          </Link>
          <Link to="/app/documentation">
            <MenuItem>
              <ListItemIcon>
                <Menu fontSize="small" />
              </ListItemIcon>
              <ListItemText>API Docs</ListItemText>
            </MenuItem>
          </Link>
        </MenuList>
        <Divider />
        <Box padding={2}>
          <ul className="call-list">
            {phoneCalls.map((call) => (
              <li key={call.phone_call_id} className={`call-item ${call.status}`}>
                <div className="call-header">
                  <span className="phone-number">{call.phone_number}</span>
                  <span className="start-time">
                    {call.start_date_time && new Date(call.start_date_time).toLocaleTimeString()}
                  </span>
                </div>
                {!call.end_date_time ? (
                  <div className="call-status">
                    <span className="timer">{call.elapsed}s</span>
                    <span className="recording-icon"></span>
                  </div>
                ) : (
                  <div className="call-status">
                    {new Date(call.end_date_time).toLocaleTimeString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </Box>
      </div>
      <div className="sidebar-bottom-section">
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
