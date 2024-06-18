// types/express.d.ts
import User from '../src/models/users'

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}
