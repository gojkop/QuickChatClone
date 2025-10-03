const handleFileChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate
  if (!file.type.startsWith('image/')) {
    setError('Please select an image file');
    return;
  }
  
  if (file.size > 5 * 1024 * 1024) {
    setError('Image must be less than 5MB');
    return;
  }

  // Show preview immediately
  const reader = new FileReader();
  reader.onloadend = () => setPreview(reader.result);
  reader.readAsDataURL(file);

  // Upload to Cloudflare R2
  setIsUploading(true);
  setError(null);

  try {
    const { uploadProfilePicture } = await import('@/lib/cloudflare.js');
    const userId = 'temp-user-id'; // Replace with actual user ID from props or context
    
    const result = await uploadProfilePicture(file, userId);
    
    // Pass URL and key back to parent (which will save to Xano)
    onChange({
      url: result.url,
      key: result.key,
    });
    
    setPreview(result.url);
  } catch (err) {
    console.error('Upload failed:', err);
    setError(err.message || 'Upload failed. Please try again.');
    setPreview(currentAvatar); // Revert preview
  } finally {
    setIsUploading(false);
  }
};