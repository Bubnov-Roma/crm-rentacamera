import { createYoga } from 'graphql-yoga';
import { createSchema } from 'graphql-yoga';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { join } from 'path';
import { resolvers } from './resolvers/Index'; // not implemented
import { createContext } from './context';

// Load all .graphql files
const typesArray = loadFilesSync(join(process.cwd(), 'src/graphql/schema/**/*.graphql'));
const typeDefs = mergeTypeDefs(typesArray);

import type { GraphQLContext } from './context';

const schema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers,
});

export const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: '/api/graphql',
  landingPage: process.env.NODE_ENV === 'development',
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL,
    credentials: true,
  },
});
