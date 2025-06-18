import axios from 'axios';

const CLOUDINARY_CONFIG = {
  cloudName: 'dxhlgpmsy',
  apiKey: '769738378825731XSK6Y',
  apiSecret: 'um0WQh9vQd7AuA2V-JnBWDK4MSg',
  uploadPreset: 'hms_3do'
};

export async function uploadImage(base64String) {
  try {
    const formData = new FormData();
    formData.append('file',`data:image/jpeg;base64,${base64String}`);
    formData.append('upload_preset',CLOUDINARY_CONFIG.uploadPreset);
    formData.append('folder','user_avatars');

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      formData,
      {
        auth: {
          username: CLOUDINARY_CONFIG.apiKey,
          password: CLOUDINARY_CONFIG.apiSecret
        }
      }
    );

    console.log('Cloudinary upload result:',response.data); // Debug: Log upload result
    return {
      secureUrl: response.data.secure_url,
      publicId: response.data.public_id
    };
  } catch (error) {
    console.error('Error uploading to Cloudinary:',error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
}

export async function deleteImage(publicId) {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = await generateSignature(`public_id=${publicId}&timestamp=${timestamp}`);

    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/destroy`,
      {
        public_id: publicId,
        api_key: CLOUDINARY_CONFIG.apiKey,
        timestamp: timestamp,
        signature: signature
      }
    );

    console.log('Cloudinary delete result:',response.data); // Debug: Log delete result
    if (response.data.result !== 'ok') {
      throw new Error('Failed to delete image from Cloudinary');
    }
  } catch (error) {
    console.error('Error deleting from Cloudinary:',error);
    throw new Error(`Failed to delete image from Cloudinary: ${error.message}`);
  }
}

export async function generateSignature(params) {
  try {
    const crypto = await import('crypto');
    const signatureString = `${params}${CLOUDINARY_CONFIG.apiSecret}`;
    return crypto.createHash('sha1').update(signatureString).digest('hex');
  } catch (error) {
    console.error('Error generating Cloudinary signature:',error);
    throw new Error(`Failed to generate signature: ${error.message}`);
  }
}