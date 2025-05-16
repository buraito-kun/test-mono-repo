import { NextFunction, Request, Response } from 'express';
import { AuthMiddleware } from './auth.middleware';

describe('AuthMiddleware', () => {
  let middleware: AuthMiddleware;
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    middleware = new AuthMiddleware();

    res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      send: jest.fn(),
    };

    next = jest.fn();
  });

  it('should return 401 if no authorization header', () => {
    req = {
      headers: {},
    };

    middleware.use(req as Request, res as Response, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Basic realm="Restricted Area"',
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Authentication required');
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for invalid credentials', () => {
    const credentials = Buffer.from('wrong:password').toString('base64');
    req = {
      headers: {
        authorization: `Basic ${credentials}`,
      },
    };

    middleware.use(req as Request, res as Response, next);

    expect(res.setHeader).toHaveBeenCalledWith(
      'WWW-Authenticate',
      'Basic realm="Restricted Area"',
    );
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.send).toHaveBeenCalledWith('Invalid credentials');
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next for valid credentials', () => {
    const credentials = Buffer.from('admin:admin').toString('base64');
    req = {
      headers: {
        authorization: `Basic ${credentials}`,
      },
    };

    middleware.use(req as Request, res as Response, next);

    expect(res.setHeader).not.toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalled();
  });
});
