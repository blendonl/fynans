export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface SocialAuthData {
  token: string;
  userId: string;
  email: string;
}
