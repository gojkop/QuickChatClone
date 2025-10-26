query "me/delete-account" verb=DELETE {
  auth = "user"

  input {
  }

  stack {
    var $user_id {
      value = $auth.id
    }

    db.get expert_profile {
      field_name = "user_id"
      field_value = $user_id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    // Delete user's answers and their media
    db.query answer {
      where = $db.answer.user_id == $user_id
      return = {type: "list"}
    } as $user_answers

    foreach ($user_answers) {
      each as $answers {
        conditional {
          if ($answers.media_asset_id != null) {
            db.bulk.delete media_asset {
              where = $db.media_asset.id == $answers.media_asset_id
            } as $media_asset
          }
        }
      }
    }

    db.bulk.delete answer {
      where = $db.answer.user_id == $user_id
    } as $answer_deleted

    // Delete user's questions and their media
    db.query question {
      where = $db.question.expert_profile_id == $expert_profile.id
      return = {type: "list"}
    } as $user_questions

    foreach ($user_questions) {
      each as $questions {
        conditional {
          if ($questions.media_asset_id != null) {
            // ✅ FIXED: Use $questions not $answers
            db.bulk.delete media_asset {
              where = $db.media_asset.id == $questions.media_asset_id
            } as $media_asset
          }
        }
      }
    }

    // ✅ FIXED: Use $expert_profile.id not $user_id
    db.bulk.delete question {
      where = $db.question.expert_profile_id == $expert_profile.id
    } as $question_deleted

    // Delete marketing data
    db.bulk.delete campaign_visit {
      where = $db.campaign_visit.expert_profile_id == $expert_profile.id
    } as $campaign_visit

    db.bulk.delete utm_campaign {
      where = $db.utm_campaign.expert_profile_id == $expert_profile.id
    } as $utm_campaigns

    // Delete expert profile
    db.del expert_profile {
      field_name = "id"
      field_value = $expert_profile.id
    }

    // Finally delete user record
    db.del user {
      field_name = "id"
      field_value = $user_id
    }
  }

  response = {
    "success": true,
    "message": "Account deleted successfully"
  }
}
