// api/users/delete-account.js
// Delete user account and all associated data
import apiClient from '../lib/xano/client.js';

export default async function handler(req, res) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get user ID from auth token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Extract token and verify by fetching user profile
    const token = authHeader.replace('Bearer ', '');

    console.log('=== ACCOUNT DELETION REQUEST ===');

    // Fetch current user profile to get user ID
    const profileResponse = await fetch(
      `${process.env.XANO_BASE_URL}/me/profile`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!profileResponse.ok) {
      console.error('Failed to fetch user profile');
      return res.status(401).json({ error: 'Invalid authentication' });
    }

    const profile = await profileResponse.json();
    const userId = profile.id;
    const expertProfileId = profile.expert_profile?.id;

    console.log('User ID:', userId);
    console.log('Expert Profile ID:', expertProfileId);

    // Step 1: Fetch all questions by this expert
    let questionsToDelete = [];
    if (expertProfileId) {
      try {
        const questionsResponse = await fetch(
          `${process.env.XANO_BASE_URL}/me/questions`,
          {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (questionsResponse.ok) {
          questionsToDelete = await questionsResponse.json();
          console.log(`Found ${questionsToDelete.length} questions to delete`);
        }
      } catch (error) {
        console.warn('Could not fetch questions:', error.message);
      }
    }

    // Step 2: Delete all media_asset records owned by user's answers
    try {
      const answerMediaResponse = await fetch(
        `${process.env.XANO_BASE_URL}/media_asset?owner_type=answer`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (answerMediaResponse.ok) {
        const answerMedia = await answerMediaResponse.json();
        console.log(`Found ${answerMedia.length} answer media assets`);

        // Delete each media asset
        for (const media of answerMedia) {
          try {
            await fetch(
              `${process.env.XANO_BASE_URL}/media_asset/${media.id}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            console.log(`Deleted media asset ${media.id}`);
          } catch (err) {
            console.error(`Failed to delete media asset ${media.id}:`, err.message);
          }
        }
      }
    } catch (error) {
      console.warn('Could not delete answer media:', error.message);
    }

    // Step 3: Delete all media_asset records owned by user's questions
    try {
      for (const question of questionsToDelete) {
        if (question.media_asset_id) {
          try {
            await fetch(
              `${process.env.XANO_BASE_URL}/media_asset/${question.media_asset_id}`,
              {
                method: 'DELETE',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
            console.log(`Deleted question media asset ${question.media_asset_id}`);
          } catch (err) {
            console.error(`Failed to delete question media ${question.media_asset_id}:`, err.message);
          }
        }
      }
    } catch (error) {
      console.warn('Could not delete question media:', error.message);
    }

    // Step 4: Delete all answer records by this user
    // Note: Xano doesn't have a bulk delete endpoint, so we need to use custom endpoint
    // For now, we'll skip this and let Xano handle cascading deletes
    console.log('Skipping answer deletion (will be handled by Xano cascading deletes)');

    // Step 5: Delete all questions by this expert
    console.log('Skipping question deletion (will be handled by Xano cascading deletes)');

    // Step 6: Delete expert_profile
    if (expertProfileId) {
      try {
        // Xano doesn't expose direct DELETE on expert_profile
        // We'll need to create a custom endpoint in Xano or handle via user deletion
        console.log('Expert profile will be deleted with user account');
      } catch (error) {
        console.warn('Could not delete expert profile:', error.message);
      }
    }

    // Step 7: Delete user account
    // This should be done via a custom Xano endpoint that handles all cascading deletes
    try {
      const deleteUserResponse = await fetch(
        `${process.env.XANO_BASE_URL}/me/delete-account`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!deleteUserResponse.ok) {
        const errorText = await deleteUserResponse.text();
        throw new Error(`Failed to delete user account: ${errorText}`);
      }

      console.log('✅ User account deleted successfully');

      return res.status(200).json({
        success: true,
        message: 'Account deleted successfully',
      });
    } catch (error) {
      console.error('Failed to delete user account:', error);
      throw error;
    }

  } catch (error) {
    console.error('Account deletion error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'Failed to delete account',
    });
  }
}
