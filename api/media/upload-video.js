import FormData from 'form-data';
import axios from 'axios';
import { enableDownloads } from '../lib/cloudflare/stream.js';

// In api/media/upload-video.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { videoBase64, recordingMode, segmentIndex, duration } = req.body;

    console.log('=== BACKEND: Upload Video ===');
    console.log('videoBase64 length:', videoBase64 ? videoBase64.length : 0);
    console.log('Recording mode:', recordingMode);
    console.log('Segment index:', segmentIndex);
    console.log('Duration:', duration);

    if (!videoBase64) {
      return res.status(400).json({ error: 'No video data provided' });
    }

    // Convert base64 to buffer
    const videoBuffer = Buffer.from(videoBase64, 'base64');
    console.log('Buffer size:', videoBuffer.length);

    // Check magic bytes
    const magicBytes = videoBuffer.slice(0, 4).toString('hex');
    console.log('Magic bytes:', magicBytes);
    
    if (magicBytes !== '1a45dfa3') {
      return res.status(400).json({ 
        error: 'Invalid video format',
        details: `Expected WebM magic bytes 1a45dfa3, got ${magicBytes}`
      });
    }

    console.log('✅ Magic bytes check passed! Uploading to Cloudflare Stream...');

    // ⭐ Upload to Cloudflare Stream
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_STREAM_API_TOKEN;
    const customerCode = process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE; // Add this


    if (!accountId || !apiToken) {
      throw new Error('Missing Cloudflare credentials');
    }

    const FormData = require('form-data');
    const form = new FormData();
    
    // Add the video file
    form.append('file', videoBuffer, {
      filename: `segment-${segmentIndex}-${Date.now()}.webm`,
      contentType: 'video/webm',
    });

    // Add metadata
    const metadata = {
      name: `Segment ${segmentIndex}`,
      segmentIndex: segmentIndex,
      recordingMode: recordingMode,
      duration: duration
    };
    form.append('meta', JSON.stringify(metadata));

    // Upload to Cloudflare Stream
    const uploadResponse = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${accountId}/stream`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          ...form.getHeaders(),
        },
        body: form,
      }
    );

    const uploadResult = await uploadResponse.json();
    
    console.log('Cloudflare response status:', uploadResponse.status);
    console.log('Cloudflare response:', JSON.stringify(uploadResult, null, 2));

    if (!uploadResponse.ok || !uploadResult.success) {
      throw new Error(
        uploadResult.errors?.[0]?.message || 
        'Cloudflare upload failed'
      );
    }

    const video = uploadResult.result;

    // Enable downloads for payers and experts
    await enableDownloads(video.uid);

    return res.status(200).json({
      success: true,
      data: {
        uid: video.uid,
        playbackUrl: `https://${customerCode}.cloudflarestream.com/${video.uid}/manifest/video.m3u8`,
        thumbnail: video.thumbnail,
        duration: duration || 0,
        mode: recordingMode,
        size: videoBuffer.length,
        status: video.status,
        cloudflareVideoId: video.uid
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}