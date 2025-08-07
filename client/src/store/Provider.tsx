import React from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import { store } from './store';

interface StoreProviderProps {
  children: React.ReactNode;
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ children }) => {
  return <ReduxProvider store={store}>{children}</ReduxProvider>;
};

// Optional: Create a hook to ensure components are wrapped in StoreProvider
export function withStoreProvider<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  return function WithStoreProviderComponent(props: P) {
    return (
      <StoreProvider>
        <WrappedComponent {...props} />
      </StoreProvider>
    );
  };
}