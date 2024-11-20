import React, { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { parseAxiosError } from '../utils/errors';
import { Dialog, DialogActions, DialogContent, Grid, TextField } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useCustomersSdk } from '../api/sdk';

interface CreateCustomerModalProps {
  open: boolean;
  onClose: () => void;
  refetch: () => Promise<unknown>;
}

export function CreateCustomerModal({ open, onClose, refetch }: CreateCustomerModalProps) {
  const { clientId } = useParams();
  const queryClient = useQueryClient();
  const customersSdk = useCustomersSdk();

  /**
   * Manage the teamName
   */
  const [firstName, setFirstName] = useState('');
  const handleChangeFirstName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFirstName(e.target.value);
  }, []);

  /**
   * Manage the lastName
   */
  const [lastName, setLastName] = useState('');
  const handleChangeLastName = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLastName(e.target.value);
  }, []);

  /**
   * Manage the email
   */
  const [email, setEmail] = useState('');
  const handleChangeEmail = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  }, []);

  /**
   * Manage the company
   */
  const [company, setCompany] = useState('');
  const handleChangeCompany = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCompany(e.target.value);
  }, []);

  /**
   * Manage the notificationsEnabled
   */
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const handleChangeNotificationsEnabled = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setNotificationsEnabled(e.target.checked);
  }, []);

  /**
   * Manage the mobileNumber
   */
  const [mobileNumber, setMobileNumber] = useState('');
  const handleChangeMobileNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMobileNumber(
      e.target.value.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3')
    );
  }, []);

  /**
   * Manage the homeNumber
   */
  const [homeNumber, setHomeNumber] = useState('');
  const handleChangeHomeNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setHomeNumber(
      e.target.value.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3')
    );
  }, []);

  /**
   * Manage the workNumber
   */
  const [workNumber, setWorkNumber] = useState('');
  const handleChangeWorkNumber = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkNumber(
      e.target.value.replace(/\D/g, '').replace(/^(\d{3})(\d{3})(\d{4})$/, '($1) $2-$3')
    );
  }, []);

  /**
   * Manage the tags
   */
  const [tags, setTags] = useState('');
  const handleChangeTags = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTags(e.target.value);
  }, []);

  /**
   * Manage the leadSource
   */
  const [leadSource, setLeadSource] = useState('');
  const handleChangeLeadSource = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLeadSource(e.target.value);
  }, []);

  // "first_name": "string",
  //     "last_name": "string",
  //     "email": "string",
  //     "company": "string",
  //     "notifications_enabled": true,
  //     "mobile_number": "string",
  //     "home_number": "string",
  //     "work_number": "string",
  //     "tags": [
  //       "string"
  //     ],
  //     "lead_source": "string",
  //     "addresses": [
  //       {
  //         "id": "string",
  //         "street": "string",
  //         "street_line_2": "string",
  //         "city": "string",
  //         "state": "string",
  //         "zip": "string",
  //         "country": "string"
  //       }
  //     ]

  /**
   * Reset the state whenever the Modal opens
   */
  const handleClose = useCallback(() => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setCompany('');
    setNotificationsEnabled(false);
    setMobileNumber('');
    setHomeNumber('');
    setWorkNumber('');
    setTags('');
    setLeadSource('');
    onClose();
  }, [onClose]);

  const isDataValid = useMemo(() => {
    if ((firstName?.trim().length ?? 0) > 0) {
      return true;
    }
  }, [firstName]);

  const [loading, setLoading] = useState(false);
  const handleSubmit = useCallback(async () => {
    if (isDataValid) {
      try {
        setLoading(true);
        await customersSdk.postCustomers({
          first_name: firstName || undefined,
          last_name: lastName || undefined,
          email: email || undefined,
          company: company || undefined,
          notifications_enabled: notificationsEnabled || undefined,
          mobile_number: mobileNumber.replace(/\D/g, '') || undefined,
          home_number: homeNumber.replace(/\D/g, '') || undefined,
          work_number: workNumber.replace(/\D/g, '') || undefined,
          tags: tags ? [tags] : [],
          lead_source: leadSource || undefined,
          // addresses: [
          //   {
          //     id: '',
          //     street: '',
          //     street_line_2: '',
          //     city: '',
          //     state: '',
          //     zip: '',
          //     country: '',
          //   },
          // ],
        });
        toast.success('Customer created successfully');
        await refetch();
        handleClose();
      } catch (error) {
        toast.error(`Failed to create team: ${parseAxiosError(error)}`);
      } finally {
        setLoading(false);
      }
    }
  }, [customersSdk, clientId, isDataValid, refetch, queryClient, handleClose]);

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="First Name"
              name="name"
              type="text"
              value={firstName}
              onChange={handleChangeFirstName}
              placeholder="First Name"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Last Name"
              name="name"
              type="text"
              value={lastName}
              onChange={handleChangeLastName}
              placeholder="Last Name"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Email"
              name="name"
              type="text"
              value={email}
              onChange={handleChangeEmail}
              placeholder="Email"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Company"
              name="name"
              type="text"
              value={company}
              onChange={handleChangeCompany}
              placeholder="Company"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Mobile Number"
              name="name"
              type="text"
              value={mobileNumber}
              onChange={handleChangeMobileNumber}
              placeholder="(111) 111-1111"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Home Number"
              name="name"
              type="text"
              value={homeNumber}
              onChange={handleChangeHomeNumber}
              placeholder="(222) 222-2222"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Work Number"
              name="name"
              type="text"
              value={workNumber}
              onChange={handleChangeWorkNumber}
              placeholder="(333) 333-3333"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Tags"
              name="name"
              type="text"
              value={tags}
              onChange={handleChangeTags}
              placeholder="Tags"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Lead Source"
              name="name"
              type="text"
              value={leadSource}
              onChange={handleChangeLeadSource}
              placeholder="Lead Source"
              required
              fullWidth
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Notifications Enabled"
              name="name"
              type="checkbox"
              value={notificationsEnabled}
              onChange={handleChangeNotificationsEnabled}
              required
              fullWidth
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <LoadingButton autoFocus onClick={handleSubmit} disabled={loading} loading={loading}>
          Save
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
