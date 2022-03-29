import AWS from 'aws-sdk';
import { fileTypeFromBuffer } from 'file-type';
import { processImageToImgix } from '../index.js';

const config = {
  ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY,
  SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  BUCKET_NAME: process.env.BUCKET_NAME,
  DELIVERY_URL: `${process.env.IMGIX_DOMAIN}/`,
};

const s3 = new AWS.S3({
  accessKeyId: config.ACCESS_KEY_ID,
  secretAccessKey: config.SECRET_ACCESS_KEY,
});

export async function getImagesList() {
  const params = {
    Bucket: config.BUCKET_NAME,
    Delimiter: '/',
  };

  const result = (await s3.listObjectsV2(params).promise()).Contents;
  return result.map((image) => ({ name: image.Key }));
}

export async function getImagesMap() {
  const list = await getImagesList();

  const map = new Map();
  list.forEach(({ name }) => {
    const [rawName] = name.split('.');
    map.set(rawName, name);
  });

  return map;
}

export async function uploadImageToS3(data, name) {
  const { ext } = await fileTypeFromBuffer(data);

  const params = {
    Bucket: config.BUCKET_NAME,
    Key: name + '.' + ext,
    Body: data,
  };

  return s3.upload(params).promise();
}

export function buildImgixUrl(name) {
  return `${config.DELIVERY_URL + name}`;
}

export async function getLoader() {
  return {
    map: await getImagesMap(),
    loader: processImageToImgix,
  };
}
