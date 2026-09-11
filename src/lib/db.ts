import Dexie, { type Table } from 'dexie';
import { CertificateTemplate, CustomFont } from './types';

export class CertificateDatabase extends Dexie {
  templates!: Table<CertificateTemplate, string>;
  fonts!: Table<CustomFont, string>;

  constructor() {
    super('CESCertificateGeneratorDB');
    this.version(1).stores({
      templates: 'id, name, createdAt, updatedAt',
      fonts: 'id, name, addedAt',
    });
  }
}

export const db = new CertificateDatabase();
