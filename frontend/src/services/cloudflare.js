import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import API from './api';

/**
 * Upload image directly to Cloudflare R2 from the frontend
 * @param {File} file - The image file to upload
 * @returns {Promise<string>} - The Cloudflare public image URL
 */
export const uploadToCloudflare = async (file) => {
  // Validate file
  if (!file) {
    throw new Error('No file provided');
  }

  // Validate file type
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP');
  }

  // Validate file size (max 5MB)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    throw new Error('File size must be less than 5MB');
  }

  try {
    const accountId = process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.REACT_APP_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.REACT_APP_R2_BUCKET_NAME;
    const baseUrl = process.env.REACT_APP_R2_PUBLIC_URL;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) {
      throw new Error('Cloudflare R2 credentials missing in frontend environment variables.');
    }

    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
      },
    });

    const fileExtension = file.name.split('.').pop() || 'jpg';
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 10);
    const key = `profile-pictures/${timestamp}-${randomStr}.${fileExtension}`;

    // Convert File to Uint8Array to avoid browser stream incompatibilities in AWS SDK V3
    const arrayBuffer = await file.arrayBuffer();
    const fileBytes = new Uint8Array(arrayBuffer);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: fileBytes,
        ContentType: file.type,
      })
    );

    // If using the raw R2 API endpoint, it needs the bucket name. 
    // If using a public R2.dev or custom domain, the bucket name is automatically included by Cloudflare.
    let finalUrl = '';
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    
    if (cleanBaseUrl.includes('r2.cloudflarestorage.com')) {
      finalUrl = `${cleanBaseUrl}/${bucketName}/${key}`;
    } else {
      finalUrl = `${cleanBaseUrl}/${key}`;
    }

    return finalUrl;
  } catch (error) {
    console.error('Cloudflare upload error:', error);
    throw new Error(error.message || 'Image upload failed');
  }
};

/**
 * Delete image from Cloudflare R2
 * @param {string} imageUrl - The full public URL of the image to delete
 * @returns {Promise<void>}
 */
export const deleteFromCloudflare = async (imageUrl) => {
  if (!imageUrl || typeof imageUrl !== 'string') return;
  
  try {
    const accountId = process.env.REACT_APP_CLOUDFLARE_ACCOUNT_ID;
    const accessKeyId = process.env.REACT_APP_R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.REACT_APP_R2_SECRET_ACCESS_KEY;
    const bucketName = process.env.REACT_APP_R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucketName) return;

    // Extract the exact object key from the url
    const keyMatch = imageUrl.match(/profile-pictures\/.*$/);
    if (!keyMatch) return;

    const key = keyMatch[0];
    const s3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: { accessKeyId, secretAccessKey },
    });

    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Failed to delete old image from Cloudflare:', error);
    // Catch silently to avoid breaking the UI workflow
  }
};

/**
 * Upload image and update user profile, subsequently deleting old image if provided
 * @param {File} file - The image file to upload
 * @param {string} oldImageUrl - The previous image URL to delete
 * @returns {Promise<string>} - The new profile picture URL
 */
export const uploadProfilePicture = async (file, oldImageUrl = null) => {
  try {
    // Upload to Cloudflare through backend
    const imageUrl = await uploadToCloudflare(file);
    
    // Update user profile with new image URL
    const response = await API.patch('/user/edit_profile', {
      profile_picture: imageUrl
    });

    // Run deletion asynchronously after the database has successfully saved the new URL
    if (oldImageUrl) {
      deleteFromCloudflare(oldImageUrl);
    }

    return response.data.data.profile_picture;
  } catch (error) {
    console.error('Profile picture upload error:', error);
    throw error;
  }
};

export default {
  uploadToCloudflare,
  deleteFromCloudflare,
  uploadProfilePicture
};
