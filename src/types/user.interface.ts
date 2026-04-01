export interface IUser {
  name: string;
  email: string;
  password?: string;
  profileImg?: string;
  isVerified?: boolean;
  verificationCode?: string;
  role: 'admin' | 'client' | 'collaborator';
}