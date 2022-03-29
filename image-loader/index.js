import axios from 'axios';
import {
  getWebp,
  minImage,
  getHex,
  inMap,
  showImageSize,
} from './utils/index.js';
import {
  buildCloudImagesUrl,
  uploadImageWithBuffer,
} from './cloud-flare/index.js';
import { buildImgixUrl, uploadImageToS3 } from './aws/index.js';
import { fileTypeFromBuffer } from 'file-type';

export async function loadImage(url) {
  const image = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  return image;
}

export async function prepareImage(url) {
  const { data } = await loadImage(url);
  const image = await minImage(data);
  const webpImage = await getWebp(image);
  const imageName = getHex(data);

  return {
    image,
    webpImage,
    imageName,
  };
}

export async function processImage(url, map, uploader, urlBuilder) {
  const { image, webpImage, imageName } = await prepareImage(url);

  showImageSize(image, webpImage, imageName);

  console.log(imageName);

  const prefix = '_webp';
  const webpImageName = imageName + prefix;

  if (!inMap(imageName, map)) {
    try {
      const uploadedImageOriginal = await uploader(image, imageName);
      map.set(imageName, uploadedImageOriginal);

      console.log(`New image loaded: ${imageName}`);
      const uploadedImageWebp = await uploader(webpImage, webpImageName);
      console.log(`New image loaded webp: ${webpImageName}`);
      map.set(webpImageName, uploadedImageWebp);
    } catch (e) {
      console.log('Something gone wrong with files processing.');
    }
  }
  url = urlBuilder(map.get(imageName));
  const webp = urlBuilder(map.get(webpImageName));

  return {
    url,
    webp,
  };
}

export async function processImageToCloudFlare(url, map) {
  return processImage(url, map, uploadImageWithBuffer, buildCloudImagesUrl);
}

export async function processImageToImgix(url, map) {
  return processImage(url, map, uploadImageToS3, buildImgixUrl);
}
