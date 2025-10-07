// src/utils/recordingDebugger.js
// Add this to help debug recording issues

/**
 * Comprehensive blob validator
 * Call this right after MediaRecorder.onstop creates the blob
 */
export async function validateRecordingBlob(blob, chunks) {
  console.log('🔍 ========== BLOB VALIDATION ==========');
  
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    info: {}
  };

  // Check 1: Blob exists
  if (!blob) {
    validation.isValid = false;
    validation.errors.push('Blob is null or undefined');
    return validation;
  }

  // Check 2: Blob size
  validation.info.size = blob.size;
  validation.info.sizeMB = (blob.size / 1024 / 1024).toFixed(2);
  
  if (blob.size === 0) {
    validation.isValid = false;
    validation.errors.push('Blob size is 0 bytes - recording failed');
  } else if (blob.size < 1000) {
    validation.warnings.push('Blob is very small (< 1KB) - may be corrupted');
  }

  console.log(`📦 Blob size: ${blob.size} bytes (${validation.info.sizeMB} MB)`);

  // Check 3: Blob type
  validation.info.type = blob.type;
  
  if (!blob.type) {
    validation.warnings.push('Blob type is empty');
  } else {
    console.log(`📝 Blob type: ${blob.type}`);
    
    // Verify it's a valid media type
    const validTypes = ['video/webm', 'audio/webm', 'video/mp4', 'audio/mp4'];
    const isValidType = validTypes.some(t => blob.type.includes(t));
    
    if (!isValidType) {
      validation.warnings.push(`Unexpected blob type: ${blob.type}`);
    }
  }

  // Check 4: Chunks
  validation.info.chunksCount = chunks?.length || 0;
  validation.info.chunksTotal = chunks?.reduce((sum, c) => sum + c.size, 0) || 0;
  
  console.log(`🧩 Chunks: ${validation.info.chunksCount} pieces`);
  console.log(`📊 Total chunk size: ${validation.info.chunksTotal} bytes`);
  
  if (chunks && chunks.length === 0) {
    validation.warnings.push('No chunks collected during recording');
  }
  
  if (validation.info.chunksTotal !== blob.size) {
    validation.warnings.push(
      `Chunk total (${validation.info.chunksTotal}) doesn't match blob size (${blob.size})`
    );
  }

  // Check 5: Magic bytes (file signature)
  try {
    const magicBytes = await getBlobMagicBytes(blob);
    validation.info.magicBytes = magicBytes;
    
    console.log(`🔮 Magic bytes: ${magicBytes}`);
    
    // WebM should start with 0x1A45DFA3
    // MP4 should have 'ftyp' near the start
    if (blob.type.includes('webm')) {
      if (!magicBytes.startsWith('1a45dfa3')) {
        validation.errors.push(`Invalid WebM magic bytes: ${magicBytes} (expected 1a45dfa3)`);
        validation.isValid = false;
      }
    }
  } catch (error) {
    validation.warnings.push(`Could not read magic bytes: ${error.message}`);
  }

  // Check 6: Blob URL creation
  try {
    const testUrl = URL.createObjectURL(blob);
    validation.info.canCreateURL = true;
    URL.revokeObjectURL(testUrl);
    console.log('✅ Can create Blob URL');
  } catch (error) {
    validation.isValid = false;
    validation.errors.push(`Cannot create Blob URL: ${error.message}`);
  }

  // Summary
  console.log('\n📋 VALIDATION SUMMARY:');
  console.log(`Status: ${validation.isValid ? '✅ VALID' : '❌ INVALID'}`);
  
  if (validation.errors.length > 0) {
    console.error('❌ Errors:');
    validation.errors.forEach(e => console.error(`  - ${e}`));
  }
  
  if (validation.warnings.length > 0) {
    console.warn('⚠️ Warnings:');
    validation.warnings.forEach(w => console.warn(`  - ${w}`));
  }
  
  console.log('🔍 ====================================\n');

  return validation;
}

/**
 * Read first 4 bytes of blob to check file signature
 */
async function getBlobMagicBytes(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = () => {
      const arr = new Uint8Array(reader.result);
      const hex = Array.from(arr)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      resolve(hex);
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(blob.slice(0, 4));
  });
}

/**
 * Test if blob can be played
 */
export async function testBlobPlayback(blob, mode) {
  console.log('🎬 Testing blob playback...');
  
  return new Promise((resolve) => {
    const isVideo = mode !== 'audio';
    const element = isVideo 
      ? document.createElement('video')
      : document.createElement('audio');
    
    element.src = URL.createObjectURL(blob);
    
    element.onloadedmetadata = () => {
      console.log('✅ Blob can be loaded');
      console.log(`⏱️ Duration: ${element.duration}s`);
      if (isVideo) {
        console.log(`📐 Dimensions: ${element.videoWidth}x${element.videoHeight}`);
      }
      URL.revokeObjectURL(element.src);
      resolve({ success: true, duration: element.duration });
    };
    
    element.onerror = (e) => {
      console.error('❌ Blob cannot be played:', e);
      URL.revokeObjectURL(element.src);
      resolve({ success: false, error: e });
    };
    
    // Timeout after 5 seconds
    setTimeout(() => {
      console.warn('⚠️ Playback test timeout');
      URL.revokeObjectURL(element.src);
      resolve({ success: false, error: 'timeout' });
    }, 5000);
  });
}

/**
 * Complete recording diagnostics
 * Call this in MediaRecorder.onstop
 */
export async function diagnoseRecording(blob, chunks, mode) {
  const validation = await validateRecordingBlob(blob, chunks);
  
  if (validation.isValid) {
    // Optional: Test if it can actually play
    await testBlobPlayback(blob, mode);
  }
  
  return validation;
}