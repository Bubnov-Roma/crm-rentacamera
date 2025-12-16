'use client';

import {
  Client,
  CombinedError,
  Operation,
  cacheExchange,
  fetchExchange,
  subscriptionExchange,
} from 'urql';
import { authExchange } from '@urql/exchange-auth';
import { createClient as createWSClient } from 'graphql-ws';
import type { SubscribePayload } from 'graphql-ws';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/graphql';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/graphql';

// WebSocket client for subscriptions
const wsClient =
  typeof window !== 'undefined'
    ? createWSClient({
        url: WS_URL,
        connectionParams: () => {
          const token = localStorage.getItem('accessToken');
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      })
    : null;

// Token management
interface AuthState {
  token: string | null;
  refreshToken: string | null;
}

// Create urql client
export const createUrqlClient = () => {
  return new Client({
    url: API_URL,
    exchanges: [
      cacheExchange,
      authExchange(async (utilities) => {
        let authState: AuthState | null = null;

        // Initial auth state
        const token = localStorage.getItem('accessToken');
        const refreshToken = localStorage.getItem('refreshToken');
        if (token && refreshToken) {
          authState = { token, refreshToken };
        }

        return {
          addAuthToOperation(operation: Operation): Operation {
            if (!authState?.token) {
              return operation;
            }

            return utilities.appendHeaders(operation, {
              Authorization: `Bearer ${authState.token}`,
            });
          },
          willAuthError(_operation: Operation): boolean {
            // If there's no token, we know authentication will fail
            if (!authState?.token) return true;
            return false;
          },
          didAuthError(error: CombinedError, _operation: Operation): boolean {
            return error.graphQLErrors?.some((e) => e.extensions?.code === 'UNAUTHORIZED') || false;
          },
          async refreshAuth(): Promise<void> {
            if (!authState?.refreshToken) {
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              authState = null;
              return;
            }

            try {
              const result = await utilities.mutate(
                `
                  mutation RefreshToken {
                    refreshToken {
                      accessToken
                      refreshToken
                    }
                  }
                `,
                { refreshToken: authState.refreshToken },
              );

              if (result.data?.refreshToken) {
                const { accessToken, refreshToken } = result.data.refreshToken;
                localStorage.setItem('accessToken', accessToken);
                localStorage.setItem('refreshToken', refreshToken);
                authState = { token: accessToken, refreshToken };
              } else {
                // Refresh failed, clear tokens
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                authState = null;
              }
            } catch (error) {
              console.error('Token refresh failed:', error);
              localStorage.removeItem('accessToken');
              localStorage.removeItem('refreshToken');
              authState = null;
            }
          },
        };
      }),
      fetchExchange,
      ...(wsClient
        ? [
            subscriptionExchange({
              forwardSubscription: (operation) => {
                // Convert operation to SubscribePayload
                const payload: SubscribePayload = {
                  query: operation.query!,
                  variables: operation.variables,
                  operationName: operation.operationName,
                  extensions: operation.extensions,
                };

                return {
                  subscribe: (sink) => ({
                    unsubscribe: wsClient.subscribe(payload, sink),
                  }),
                };
              },
            }),
          ]
        : []),
    ],
    fetchOptions: () => {
      const token = localStorage.getItem('accessToken');
      return token
        ? {
            headers: { authorization: `Bearer ${token}` },
          }
        : {};
    },
  });
};

export const urqlClient = createUrqlClient();
