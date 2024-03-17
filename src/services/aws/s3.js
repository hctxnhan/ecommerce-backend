import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fromEnv } from '@aws-sdk/credential-providers';

import configs from '../../configs/index.js';

const { region, bucketName } = configs.aws.s3;

const s3Client = new S3Client({
  region,
  credentials: fromEnv(),
  logger: console
});

export function createPresignedUrl(filename, commandType = 'putObject') {
  const commandMap = {
    putObject: PutObjectCommand,
    deleteObject: DeleteObjectCommand,
    getObject: GetObjectCommand
  };

  const CommandName = commandMap[commandType];
  const command = new CommandName({ Bucket: bucketName, Key: filename });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}

export function deleteObject(filename) {
  return s3Client.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filename
    })
  );
}
