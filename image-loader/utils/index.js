import crypto from 'crypto';
import webp from 'imagemin-webp';
import { fileTypeFromBuffer } from 'file-type';
import imagemin from 'imagemin';
import imageminPngquant from 'imagemin-pngquant';
import imageminJpegtran from 'imagemin-jpegtran';

export async function minImage(image) {
  return imagemin.buffer(image, {
    plugins: [
      imageminJpegtran(),
      imageminPngquant({
        quality: [0.6, 0.8],
      }),
    ],
  });
}

export async function getWebp(image) {
  const { ext } = await fileTypeFromBuffer(image);
  if (ext === 'png') {
    return imagemin.buffer(image, {
      plugins: [
        webp({
          lossless: true,
        }),
      ],
    });
  }

  return imagemin.buffer(image, {
    plugins: [
      webp({
        quality: 80,
      }),
    ],
  });
}

export function getHex(data) {
  const hashSum = crypto.createHash('sha256');
  hashSum.update(data);

  const hex = hashSum.digest('hex');

  return hex;
}

export function inMap(imageName, map) {
  return map.has(imageName);
}

export function showImageSize(image, webpImage, imageName) {
  console.log(
    `Size ${imageName}:`,
    '\n original',
    image.toString().length,
    '\n webp',
    webpImage.toString().length,
    '\n'
  );
}
