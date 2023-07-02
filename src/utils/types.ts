export interface AppError extends Partial<Error> {
  status: string;
  statusCode: number;
}
