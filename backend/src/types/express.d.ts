import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    /** Raw JSON body bytes (Chapa webhook HMAC must use exact payload) */
    rawBody?: Buffer;
  }
}
