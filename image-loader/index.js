import axios from 'axios';
import FormData from 'form-data';
import { getWebp, minImage, buildUrl, getHex, inMap } from './utils/index.js';

export async function loadImage(url) {
  const image = await axios({
    url,
    method: 'GET',
    responseType: 'arraybuffer',
  });

  return image;
}

export async function uploadImageWithUrl(url) {
  try {
    const { data } = await loadImage(url);

    const hex = getHex(data);

    const form = new FormData();
    form.append('file', data, {
      filename: hex,
    });

    const {
      data: { result },
    } = await axios({
      method: 'POST',
      url: `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/images/v1`,
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        ...form.getHeaders(),
      },
      data: form,
    });

    const id = result.id;

    return id;
  } catch (e) {
    console.log('Image not uploaded. Some errors.');
  }
}

export async function uploadImageWithBuffer(data, name) {
  try {
    const hex = getHex(data);

    const form = new FormData();
    form.append('file', data, {
      filename: name ? name : hex,
    });

    const {
      data: { result },
    } = await axios({
      method: 'POST',
      url: `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/images/v1`,
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
        ...form.getHeaders(),
      },
      data: form,
    });

    const id = result.id;

    return id;
  } catch (e) {
    console.log('Image not uploaded. Some errors.');
  }
}

export async function getImagesList() {
  async function getImagesPage(page) {
    const { data } = await axios({
      method: 'GET',
      url: `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/images/v1?page=${page}&per_page=100`,
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    });

    return data.result.images;
  }
  try {
    let page = 1;
    let currentImages = [];
    const list = [];

    do {
      currentImages = await getImagesPage(page);
      if (currentImages.length === 0) {
        break;
      }

      currentImages.forEach(({ id }) => {
        list.push(id);
      });

      page++;
    } while (currentImages.length > 0);

    return list;
  } catch (e) {
    console.log('Images list has not been loaded. Some errors.', e);
  }
}

export async function getImagesMap() {
  async function getImagesPage(page) {
    const { data } = await axios({
      method: 'GET',
      url: `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/images/v1?page=${page}&per_page=100`,
      headers: {
        Authorization: `Bearer ${process.env.API_TOKEN}`,
      },
    });

    return data.result.images;
  }

  try {
    let page = 1;
    let currentImages = [];
    const map = new Map();

    do {
      currentImages = await getImagesPage(page);
      if (currentImages.length === 0) {
        break;
      }

      currentImages.forEach(({ filename, id }) => {
        map.set(filename, id);
      });

      page++;
    } while (currentImages.length > 0);

    return map;
  } catch (e) {
    console.log('Images list has not been loaded. Some errors.', e);
  }
}

export async function prepareImage(url, map) {
  const { data } = await loadImage(url);
  const image = await minImage(data);
  const webpImage = await getWebp(image);

  const imageName = getHex(data);

  console.log(
    `Size ${imageName}:`,
    '\n original',
    image.toString().length,
    '\n webp',
    webpImage.toString().length,
    '\n'
  );

  const prefix = '_webp';
  const webpImageName = imageName + prefix;

  if (!inMap(imageName, map)) {
    try {
      const uploadedImageOriginal = await uploadImageWithBuffer(
        image,
        imageName
      );
      map.set(imageName, uploadedImageOriginal);

      console.log(`New image loaded: ${imageName}`);
      const uploadedImageWebp = await uploadImageWithBuffer(
        webpImage,
        webpImageName
      );
      console.log(`New image loaded webp: ${webpImageName}`);
      map.set(webpImageName, uploadedImageWebp);
    } catch (e) {
      console.log('Something gone wrong with files processing.');
    }
  }
  url = buildUrl(map.get(imageName));
  const webp = buildUrl(map.get(webpImageName));

  return {
    url,
    webp,
  };
}

export async function deleteImage(id) {
  return axios({
    method: 'DELETE',
    url: `https://api.cloudflare.com/client/v4/accounts/${process.env.ACCOUNT_ID}/images/v1/${id}`,
    headers: {
      Authorization: `Bearer ${process.env.API_TOKEN}`,
    },
  });
}

export async function deleteAllImages() {
  const imagesIds = await getImagesList();

  return Promise.all(imagesIds.map((id) => deleteImage(id)));
}
