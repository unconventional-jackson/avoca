import './AuthContainer.css';

import { PropsWithChildren } from 'react';
import { Grid } from '@mui/material';
import AvocaLogoUrl from '../../../assets/avoca_logo.jpg';

export function AuthContainer({ children }: PropsWithChildren) {
  return (
    <div className="auth-container">
      <div className="auth-container-content">
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <div className="auth-container-header">
              <img alt="Logo" className="auth-container-image" src={AvocaLogoUrl} />
              <h3 className="auth-container-title">Avoca AI</h3>
              <h4 className="auth-container-subtitle">
                This site may only be accessed by authorized users. Unauthorized access is
                prohibited.
              </h4>
            </div>
            <div className="auth-container-divider" />
          </Grid>
        </Grid>
        {children}
      </div>
    </div>
  );
}
