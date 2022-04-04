import { AxiosRequestConfig } from 'axios';
import Node from '../models/Node';

export const remoteRequestConfig = (node: Node): AxiosRequestConfig => ({
  baseURL: node.serviceUrl,
  auth: {
    username: node.outgoingUsername,
    password: node.outgoingPassword,
  },
});
