// api/users/delete-account.js
// Delete user account and all associated data (MVP - immediate deletion)
import apiClient from '../lib/xano/client.js';
import { sendAccountDeletionNotification } from '../lib/zeptomail.js';

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

    console.log('=== ACCOUNT DELETION REQUEST (MVP - IMMEDIATE) ===');

    // Fetch current user profile to get user ID and details
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
    
    // Debug: Log full profile structure
    console.log('📋 Profile response structure:', JSON.stringify(profile, null, 2));
    
    const userId = profile.id;
    let userEmail = profile.email;  // Use let so we can reassign if needed
    const userName = profile.name;
    const expertProfileId = profile.expert_profile?.id;

    console.log('User ID:', userId);
    console.log('User Email:', userEmail);
    console.log('User Name:', userName);
    console.log('Expert Profile ID:', expertProfileId);
    
    // Validate email exists
    if (!userEmail) {
      console.error('❌ No email found in profile.email');
      console.error('   Profile keys:', Object.keys(profile));
      console.error('   Looking for alternative email fields...');
      
      // Try alternative fields
      const alternativeEmail = profile.user?.email || profile.data?.email || profile.email_address;
      if (alternativeEmail) {
        console.log('✅ Found email in alternative field:', alternativeEmail);
        userEmail = alternativeEmail;
      } else {
        return res.status(500).json({ 
          error: 'User email not found in profile',
          debug: { 
            profileKeys: Object.keys(profile),
            hasNestedUser: !!profile.user,
            hasNestedData: !!profile.data
          }
        });
      }
    }

    // Determine user type
    const userType = expertProfileId ? 'expert' : 'asker';
    console.log('User Type:', userType);

    // Step 1: Delete all media_asset records from user's answers (FK-based)
    console.log('Step 1: Deleting answer media assets...');
    try {
      // Fetch user's answers to get media_asset_ids
      const answersResponse = await fetch(
        `${process.env.XANO_BASE_URL}/me/answers`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (answersResponse.ok) {
        const answers = await answersResponse.json();
        console.log(`Found ${answers.length} answers`);

        // Delete media assets referenced by answers
        for (const answer of answers) {
          if (answer.media_asset_id) {
            try {
              await fetch(
                `${process.env.XANO_BASE_URL}/media_asset/${answer.media_asset_id}`,
                {
                  method: 'DELETE',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              console.log(`✅ Deleted answer media asset ${answer.media_asset_id}`);
            } catch (err) {
              console.error(`❌ Failed to delete answer media ${answer.media_asset_id}:`, err.message);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not delete answer media:', error.message);
    }

    // Step 2: Delete all media_asset records owned by user's questions
    console.log('Step 2: Deleting question media assets...');
    try {
      // First fetch questions to get media asset IDs
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
        const questions = await questionsResponse.json();
        console.log(`Found ${questions.length} questions`);

        for (const question of questions) {
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
              console.log(`✅ Deleted question media asset ${question.media_asset_id}`);
            } catch (err) {
              console.error(`❌ Failed to delete question media ${question.media_asset_id}:`, err.message);
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not delete question media:', error.message);
    }

    // Step 3: Delete user account (Xano handles cascading deletes for questions, answers, etc.)
    console.log('Step 3: Deleting user account...');
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

      // Step 4: Send account deletion confirmation email
      console.log('📧 Sending account deletion confirmation email...');
      try {
        await sendAccountDeletionNotification({
          name: userName,
          email: userEmail,
          userType: userType,
          deletionDate: new Date().toISOString(),
        });
        console.log('✅ Deletion confirmation email sent successfully');
      } catch (emailError) {
        console.error('❌ Failed to send deletion confirmation email:', emailError);
        // Don't fail the deletion if email fails - account is already deleted
      }

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