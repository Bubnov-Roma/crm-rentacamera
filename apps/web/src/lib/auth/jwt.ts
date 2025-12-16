import { SignJWT, jwtVerify, JWTPayload } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-in-production',
);

const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key-change-in-production',
);

export interface AccessTokenPayload extends JWTPayload {
  userId: string;
  email: string;
  role: string;
  sessionId: string;
}

export interface RefreshTokenPayload extends JWTPayload {
  userId: string;
  sessionId: string;
}

/**
 * Sign Access Token (15 minutes lifetime)
 */
export async function signAccessToken(
  payload: Omit<AccessTokenPayload, 'iat' | 'exp'>,
): Promise<string> {
  const token = await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('15m') // Access token valid for 15 minutes
    .sign(JWT_SECRET);
  return token;
}

/**
 * Sign Refresh Token (7 days lifetime)
 */

export async function signRefreshToken(userId: string, sessionId: string): Promise<string> {
  const token = await new SignJWT({ userId, sessionId })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d') // Refresh token valid for 7 days
    .sign(JWT_REFRESH_SECRET);
  return token;
}

/**
 * Verify Access Token
 */
export async function verifyAccessToken(token: string): Promise<AccessTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as AccessTokenPayload;
  } catch {
    throw new Error('Invalid or expired access token');
  }
}

/**
 * Verify Refresh Token
 */
export async function verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_REFRESH_SECRET);
    return payload as RefreshTokenPayload;
  } catch {
    throw new Error('Invalid or expired refresh token');
  }
}

/**
 * Extract token from Authorization header
 */

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Create tokens pair
 */
export async function createTokensPair(
  userId: string,
  email: string,
  role: string,
): Promise<{ accessToken: string; refreshToken: string; sessionId: string }> {
  const sessionId = crypto.randomUUID();
  const accessToken = await signAccessToken({
    userId,
    email,
    role,
    sessionId,
  });
  const refreshToken = await signRefreshToken(userId, sessionId);

  return { accessToken, refreshToken, sessionId };
}
