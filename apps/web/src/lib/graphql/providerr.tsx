'use client';

import { ReactNode } from 'react';
import { Provider } from 'urql';
import { urqlClient } from './client';

interface GraphQLProviderProps {
  children: ReactNode;
}

export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return <Provider value={urqlClient}>{children}</Provider>;
}
