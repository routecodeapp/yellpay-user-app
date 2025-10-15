// src/app/Providers.tsx
import { config } from '@gluestack-ui/config';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { ToastProvider } from '@gluestack-ui/toast';
import React from 'react';

const Providers: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <GluestackUIProvider config={config}>
      <ToastProvider>
        {children}
      </ToastProvider>
    </GluestackUIProvider>
  );
};

export default Providers;
