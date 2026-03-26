export interface IUser {
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: 'admin' | 'client' | 'collaborator';
}