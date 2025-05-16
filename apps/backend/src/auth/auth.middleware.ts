import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;

    if (!auth || !auth.startsWith('Basic ')) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
      return res.status(401).send('Authentication required');
    }

    const base64Credentials = auth.split(' ')[1];
    const [username, password] = Buffer.from(base64Credentials, 'base64')
      .toString()
      .split(':');

    const validUsername = process.env.BASIC_AUTH_USER || 'admin';
    const validPassword = process.env.BASIC_AUTH_PASS || 'admin';

    if (username !== validUsername || password !== validPassword) {
      res.setHeader('WWW-Authenticate', 'Basic realm="Restricted Area"');
      return res.status(401).send('Invalid credentials');
    }

    next();
  }
}
