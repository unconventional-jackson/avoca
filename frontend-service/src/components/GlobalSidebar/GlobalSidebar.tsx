import './GlobalSidebar.css';
import './Calls.css';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

import { useCallback } from 'react';
import {
  Box,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  MenuList,
  Typography,
} from '@mui/material';
import AvocaLogoUrl from '../../assets/avoca_logo.svg';
import { useQueryClient } from '@tanstack/react-query';
import { Person, Menu, ExitToApp } from '@mui/icons-material';
import { usePhoneCalls } from '../../contexts/PhoneCallsContext';

export function GlobalSidebar() {
  const { authUser, signOut } = useAuth();
  const queryClient = useQueryClient();

  const { phoneCalls, sendPhoneCallInitiatedExternally, sendPhoneCallAccepted } = usePhoneCalls();
  const navigate = useNavigate();

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
      <Box padding={2} justifyContent="center" display="flex" alignItems="center">
        <IconButton
          color="primary"
          aria-label="add an alarm"
          sx={{
            height: 128,
            width: 128,
          }}
          onClick={sendPhoneCallInitiatedExternally}
        >
          <img src={AvocaLogoUrl} className="sidebar-logo" alt="app icon" />
        </IconButton>
      </Box>
      <Box>
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
      </Box>
      <Divider />
      <Box padding={2} overflow="scroll" flex={1}>
        <ul className="call-list">
          {phoneCalls.map((call) => (
            <li
              key={call.phone_call_id}
              className={`call-item ${call.end_date_time ? 'inactive' : 'active'} ${call.employee_id && call.employee_id !== authUser?.employee_id ? 'assigned-other' : ''}  ${call.employee_id && call.employee_id === authUser?.employee_id ? 'assigned-self' : ''}`}
              onClick={() => {
                if (
                  !(
                    call.end_date_time ||
                    (call.employee_id && call.employee_id !== authUser?.employee_id) ||
                    !call.phone_call_id
                  )
                ) {
                  sendPhoneCallAccepted(call.phone_call_id);
                }
                navigate(`/app/calls/${call.phone_call_id}`);
              }}
            >
              <div className="call-header">
                <Typography variant="body2">{call.phone_number}</Typography>
                <Typography variant="caption">
                  {call.start_date_time && new Date(call.start_date_time).toLocaleTimeString()}
                </Typography>
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

      <Box>
        <MenuList>
          <MenuItem onClick={handleSignOut}>
            <ListItemIcon>
              <ExitToApp fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sign Out</ListItemText>
          </MenuItem>
        </MenuList>
      </Box>
    </div>
  );
}
