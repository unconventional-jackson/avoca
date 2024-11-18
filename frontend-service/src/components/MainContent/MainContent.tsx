import './MainContent.css';

import { PropsWithChildren } from 'react';

export function MainContent({ children }: PropsWithChildren<unknown>) {
  return (
    <main className="main-content">
      <div className="main-content-container">{children}</div>
    </main>
  );
}
