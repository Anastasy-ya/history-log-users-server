import { Request, Response } from 'express';
export declare const getHistory: (_: Request, response: Response) => void;
export declare const getUserHistory: (request: Request, response: Response) => Response<any, Record<string, any>> | undefined;
