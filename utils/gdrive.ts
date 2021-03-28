import { Readable } from 'stream';

export interface GDriveInfo {
  id: string | null;
  webViewLink: string | null;
  webContentLink: string | null;
}

export async function getOrCreateFolder(drive, name: string, parent?: string) {
  const listResp = await drive.files.list({
    q:
      `mimeType='application/vnd.google-apps.folder' and name = '${name}' and trashed = false` +
      (parent ? `and '${parent}' in parents` : ``),
    fields: 'files(id)',
  });

  if (listResp.data.files.length > 0) {
    return listResp.data.files[0].id;
  }

  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parent ? [parent] : undefined,
  };

  const respCreate = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });
  return respCreate.data.id;
}

export async function createFile(
  drive,
  file: Express.Multer.File,
  createdDate: Date,
  description: string,
  parent: string,
): Promise<GDriveInfo> {
  const fileMetadata = {
    name: createdDate.toISOString().slice(0, 10) + '_' + file.originalname,
    description,
    parents: [parent],
  };

  const media = {
    mimeType: file.mimetype,
    body: Readable.from(file.buffer),
  };

  const resp = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id,webContentLink,webViewLink',
  });

  return resp.data;
}
