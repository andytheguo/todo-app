import jwt from 'jsonwebtoken';

export function genAccessToken(userId: string) {
  return jwt.sign({ userId: userId }, process.env.ACCESS_TOKEN_SECRET!, {
    expiresIn: '15m'
  });
}

export function genRefreshToken(userId: string) {
  return jwt.sign({ userId: userId }, process.env.REFRESH_TOKEN_SECRET!, {
    expiresIn: '7d'
  });
}
