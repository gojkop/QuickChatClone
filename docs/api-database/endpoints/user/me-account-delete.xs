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
            db.del media_asset {
              field_name = "id"
              field_value = $answers.media_asset_id
            }
          }
        }

        db.del answer {
          field_name = "id"
          field_value = $answers.id
        }
      }
    }

    // Delete user's questions and their media
    db.query question {
      where = $db.question.expert_profile_id == $expert_profile.id
      return = {type: "list"}
    } as $user_questions

    foreach ($user_questions) {
      each as $questions {
        conditional {
          if ($questions.media_asset_id != null) {
            db.del media_asset {
              field_name = "id"
              field_value = $questions.media_asset_id
            }
          }
        }

        db.del question {
          field_name = "id"
          field_value = $questions.id
        }
      }
    }

    // Delete marketing data
    db.query campaign_visit {
      where = $db.campaign_visit.expert_profile_id == $expert_profile.id
      return = {type: "list"}
    } as $campaign_visits

    foreach ($campaign_visits) {
      each as $visit {
        db.del campaign_visit {
          field_name = "id"
          field_value = $visit.id
        }
      }
    }

    db.query utm_campaign {
      where = $db.utm_campaign.expert_profile_id == $expert_profile.id
      return = {type: "list"}
    } as $campaigns

    foreach ($campaigns) {
      each as $campaign {
        db.del utm_campaign {
          field_name = "id"
          field_value = $campaign.id
        }
      }
    }

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
