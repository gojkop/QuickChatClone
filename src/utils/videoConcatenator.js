// src/utils/videoConcatenator.js

/**
 * Concatenates multiple video/audio segments into a single blob
 * Works by playing each segment and re-recording them sequentially
 */
export async function concatenateSegments(segments, onProgress) {
  if (!segments || segments.length === 0) {
    throw new Error('No segments to concatenate');
  }

  // If only one segment, return it directly
  if (segments.length === 1) {
    return {
      blob: segments[0].blob,
      duration: segments[0].duration,
      mode: segments[0].mode
    };
  }

  onProgress?.({ stage: 'preparing', current: 0, total: segments.length });

  // Determine output format based on segments
  const hasVideo = segments.some(s => s.mode !== 'audio');
  const mimeType = hasVideo ? 'video/webm;codecs=vp8,opus' : 'audio/webm';
  
  // Create a canvas and audio context for merging
  const canvas = document.createElement('canvas');
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  
  // Create destination for final recording
  const audioContext = new AudioContext();
  const destination = audioContext.createMediaStreamDestination();
  
  // Setup canvas stream
  const canvasStream = canvas.captureStream(30);
  const videoTrack = canvasStream.getVideoTracks()[0];
  
  // Combine video and audio tracks
  const finalStream = new MediaStream();
  if (hasVideo) {
    finalStream.addTrack(videoTrack);
  }
  destination.stream.getAudioTracks().forEach(track => {
    finalStream.addTrack(track);
  });

  // Start recording the final stream
  const mediaRecorder = new MediaRecorder(finalStream, { 
    mimeType,
    videoBitsPerSecond: 2500000 
  });
  
  const chunks = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      chunks.push(e.data);
    }
  };

  // Start recording
  mediaRecorder.start(100);
  
  // Play and record each segment sequentially
  let totalDuration = 0;
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    onProgress?.({ 
      stage: 'processing', 
      current: i + 1, 
      total: segments.length,
      segmentMode: segment.mode 
    });
    
    await playSegmentToStream(segment, ctx, canvas, destination, audioContext, hasVideo);
    totalDuration += segment.duration;
  }

  // Stop recording
  mediaRecorder.stop();
  
  // Wait for the recorder to finish
  const finalBlob = await new Promise((resolve) => {
    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      resolve(blob);
    };
  });

  onProgress?.({ stage: 'complete', current: segments.length, total: segments.length });

  // Cleanup
  audioContext.close();
  videoTrack.stop();

  return {
    blob: finalBlob,
    duration: totalDuration,
    mode: hasVideo ? 'video' : 'audio'
  };
}

/**
 * Play a single segment and pipe it to the recording stream
 */
async function playSegmentToStream(segment, ctx, canvas, destination, audioContext, hasVideo) {
  return new Promise((resolve, reject) => {
    const isVideo = segment.mode !== 'audio';
    
    if (isVideo && hasVideo) {
      // Handle video segment
      const video = document.createElement('video');
      video.src = segment.blobUrl || URL.createObjectURL(segment.blob);
      video.muted = false;
      
      // Setup audio routing
      const audioSource = audioContext.createMediaElementSource(video);
      audioSource.connect(destination);
      
      video.onloadedmetadata = () => {
        video.play();
        
        // Draw video frames to canvas
        const drawFrame = () => {
          if (video.paused || video.ended) {
            resolve();
            return;
          }
          
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Center the video on canvas
          const videoAspect = video.videoWidth / video.videoHeight;
          const canvasAspect = canvas.width / canvas.height;
          
          let drawWidth, drawHeight, offsetX, offsetY;
          
          if (videoAspect > canvasAspect) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / videoAspect;
            offsetX = 0;
            offsetY = (canvas.height - drawHeight) / 2;
          } else {
            drawHeight = canvas.height;
            drawWidth = canvas.height * videoAspect;
            offsetX = (canvas.width - drawWidth) / 2;
            offsetY = 0;
          }
          
          ctx.fillStyle = '#000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(video, offsetX, offsetY, drawWidth, drawHeight);
          
          requestAnimationFrame(drawFrame);
        };
        
        drawFrame();
      };
      
      video.onended = resolve;
      video.onerror = reject;
      
    } else if (segment.mode === 'audio') {
      // Handle audio-only segment
      const audio = document.createElement('audio');
      audio.src = segment.blobUrl || URL.createObjectURL(segment.blob);
      
      const audioSource = audioContext.createMediaElementSource(audio);
      audioSource.connect(destination);
      
      audio.onloadedmetadata = () => {
        audio.play();
        
        // If we're making a video, show audio waveform visualization
        if (hasVideo) {
          drawAudioVisualization(ctx, canvas, 'Audio Recording');
        }
      };
      
      audio.onended = resolve;
      audio.onerror = reject;
    }
  });
}

/**
 * Draw a simple visualization for audio-only segments
 */
function drawAudioVisualization(ctx, canvas, text) {
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 48px system-ui';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  
  // Draw animated waveform bars
  const bars = 50;
  const barWidth = canvas.width / bars;
  const time = Date.now() / 100;
  
  ctx.fillStyle = '#818cf8';
  for (let i = 0; i < bars; i++) {
    const height = Math.abs(Math.sin(time + i * 0.5)) * 100 + 20;
    const x = i * barWidth;
    const y = canvas.height / 2 - height / 2;
    ctx.fillRect(x + 2, y, barWidth - 4, height);
  }
}

/**
 * Alternative simpler method: concatenate blobs directly (same format only)
 * This is faster but only works if all segments have the same encoding
 */
export async function concatenateBlobsSimple(segments) {
  if (!segments || segments.length === 0) {
    throw new Error('No segments to concatenate');
  }

  if (segments.length === 1) {
    return {
      blob: segments[0].blob,
      duration: segments[0].duration,
      mode: segments[0].mode
    };
  }

  // Check if all segments are the same type
  const allSameType = segments.every(s => s.mode === segments[0].mode);
  
  if (!allSameType) {
    throw new Error('Cannot use simple concatenation with mixed segment types. Use concatenateSegments instead.');
  }

  // Concatenate blobs
  const mimeType = segments[0].mode === 'audio' ? 'audio/webm' : 'video/webm';
  const concatenated = new Blob(
    segments.map(s => s.blob),
    { type: mimeType }
  );

  const totalDuration = segments.reduce((sum, s) => sum + s.duration, 0);

  return {
    blob: concatenated,
    duration: totalDuration,
    mode: segments[0].mode
  };
}