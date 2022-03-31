import { getHex } from '../utils/index.js';
import FormData from 'form-data';
import axios from 'axios';
import { loadImage, processImageToCloudFlare } from '../index.js';

const config = {
  DELIVERY_URL: `https://imagedelivery.net/${process.env.DELIVERY_ID}/`,
};

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

export function buildCloudImagesUrl(id, variant = '') {
  return `${config.DELIVERY_URL + id + variant}`;
}

export async function getLoader() {
  const map = await getImagesMap();
  return {
    map,
    loader: processImageToCloudFlare,
  };
}
