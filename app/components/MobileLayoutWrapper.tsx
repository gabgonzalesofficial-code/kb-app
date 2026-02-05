'use client';

import { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

interface MobileLayoutWrapperProps {
  children: React.ReactNode;
}

export default function MobileLayoutWrapper({ children }: MobileLayoutWrapperProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleToggle = () => setSidebarOpen((prev) => !prev);
    const handleClose = () => setSidebarOpen(false);

    window.addEventListener('toggle-sidebar', handleToggle);
    window.addEventListener('close-sidebar', handleClose);

    return () => {
      window.removeEventListener('toggle-sidebar', handleToggle);
      window.removeEventListener('close-sidebar', handleClose);
    };
  }, []);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {children}
    </>
  );
}
