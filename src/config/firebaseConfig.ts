// src/config/firebaseConfig.ts
import admin from 'firebase-admin';
import { config } from "./env.js";

const serviceAccount = {
  type: config.fb_type,
  project_id: config.fb_project_id,
  private_key_id: config.fb_private_key_id,
  private_key: config.fb_private_key,
  client_email: config.fb_client_email,
  client_id: config.fb_client_id,
  auth_uri: config.fb_auth_uri,
  token_uri: config.fb_token_uri,
  auth_provider_x509_cert_url: config.fb_auth_provider_x509_cert_url,
  client_x509_cert_url: config.fb_client_x509_cert_url,
  universe_domain: config.fb_universe_domain,
} as admin.ServiceAccount;


try {
  admin.app();
} catch (error) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}


export default admin;
