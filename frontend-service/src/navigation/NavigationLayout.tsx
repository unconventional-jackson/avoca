import './NavigationLayout.css';

import { PropsWithChildren } from 'react';
import { GlobalSidebar } from '../components/GlobalSidebar/GlobalSidebar';

export function NavigationLayout({ children }: PropsWithChildren<unknown>) {
  return (
    <div className="navigation-layout-container">
      <GlobalSidebar />
      <div className="navigation-layout-page-body">
        <div className="navigation-layout-page-content">{children}</div>
      </div>
    </div>
  );
}
