import { auth, drive as driveCreator, drive_v3 } from '@googleapis/drive';
import { Readable } from 'stream';
import fs from 'fs';

export interface GDriveInfo {
  id?: string | null;
  webViewLink?: string | null;
  webContentLink?: string | null;
}

export function getDrive(accessToken: string) {
  const oAuth2Client = new auth.OAuth2(
    process.env.GOOGLE_ID,
    process.env.GOOGLE_SECRET,
  );

  oAuth2Client.setCredentials({
    access_token: accessToken,
  });
  return driveCreator({ version: 'v3', auth: oAuth2Client });
}

export async function getOrCreateFolder(
  drive: drive_v3.Drive,
  name: string,
  parentId?: string,
) {
  const listResp = await drive.files.list({
    q:
      `mimeType='application/vnd.google-apps.folder' and name = '${name}' and trashed = false` +
      (parentId ? `and '${parentId}' in parents` : ``),
    fields: 'files(id)',
  });

  if (listResp.data.files.length > 0) {
    return listResp.data.files[0].id;
  }

  const fileMetadata = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
    parents: parentId ? [parentId] : undefined,
  };

  const respCreate = await drive.files.create({
    requestBody: fileMetadata,
    fields: 'id',
  });
  return respCreate.data.id;
}

export async function createFile(
  drive: drive_v3.Drive,
  file: Express.Multer.File,
  createdDate: Date,
  description: string,
  parentId: string,
): Promise<GDriveInfo> {
  const fileMetadata = {
    name: createdDate.toISOString().slice(0, 10) + '_' + file.originalname,
    description,
    parents: [parentId],
  };

  const media = {
    mimeType: file.mimetype,
    body: Readable.from(file.buffer),
  };

  const resp = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id,webContentLink,webViewLink',
  });

  return resp.data;
}

export async function createFileFromSystem(
  drive: drive_v3.Drive,
  filename: string,
  uploadName: string,
  parentId: string,
): Promise<{ id?: string | null }> {
  const fileMetadata = {
    name: uploadName,
    parents: [parentId],
  };

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filename),
  };

  const resp = await drive.files.create({
    requestBody: fileMetadata,
    media: media,
    fields: 'id',
  });

  return resp.data;
}

export async function updateFileFromSystem(
  drive: drive_v3.Drive,
  fileId: string,
  filename: string,
  uploadName: string,
): Promise<void> {
  const fileMetadata = {
    name: uploadName,
  };

  const media = {
    mimeType: 'application/pdf',
    body: fs.createReadStream(filename),
  };

  await drive.files.update({
    fileId,
    requestBody: fileMetadata,
    media: media,
  });
}

export async function renameFile(
  drive: drive_v3.Drive,
  fileId: string,
  createdDate: Date,
) {
  const file = await drive.files.update({ fileId, fields: 'name' });
  await drive.files.update({
    fileId,
    requestBody: {
      name:
        createdDate.toISOString().slice(0, 10) + '_' + file.data.name.slice(11),
    },
  });
}

export async function moveFile(
  drive: drive_v3.Drive,
  fileId: string,
  parentId: string,
) {
  const file = await drive.files.update({ fileId, fields: 'parents' });
  if (file.data.parents.indexOf(parentId) === -1) {
    await drive.files.update({
      fileId,
      addParents: parentId,
      removeParents: file.data.parents.join(','),
      fields: 'id, parents',
    });
  }
}

export async function deleteFile(drive: drive_v3.Drive, fileId: string) {
  await drive.files.delete({
    fileId,
  });
}
