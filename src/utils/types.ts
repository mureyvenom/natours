export interface AppError extends Partial<Error> {
  status: string;
  statusCode: number;
}

export type UserRoles = 'user' | 'guide' | 'lead-guide' | 'admin';
