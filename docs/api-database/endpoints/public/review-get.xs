// Get question and answer data for review page
query "review/{token}" verb=GET {
  input {
    text token filters=trim
  }

  stack {
    db.get question {
      field_name = "playback_token_hash"
      field_value = $input.token
    } as $question
  
    // Get media_asset by ID from question.media_asset_id
    conditional {
      if ($question.media_asset_id != null && $question.media_asset_id > 0) {
        db.get media_asset {
          field_name = "id"
          field_value = $question.media_asset_id
        } as $media_asset_single
      }
    }
  
    // Prepare media_asset array for response
    api.lambda {
      code = """
          if ($var.media_asset_single) {
            return [$var.media_asset_single];
          }
          return [];
        """
      timeout = 10
    } as $media_asset
  
    db.get expert_profile {
      field_name = "id"
      field_value = $question.expert_profile_id
    } as $expert_profile
  
    db.get user {
      field_name = "id"
      field_value = $expert_profile.user_id
    } as $user
  
    db.get answer {
      field_name = "question_id"
      field_value = $question.id
    } as $answer
  
    // Get answer media_asset by ID from answer.media_asset_id
    conditional {
      if ($answer != null && $answer.media_asset_id != null && $answer.media_asset_id > 0) {
        db.get media_asset {
          field_name = "id"
          field_value = $answer.media_asset_id
        } as $media_asset_answer_single
      }
    }
  
    // Prepare answer media_asset array for response
    api.lambda {
      code = """
          if ($var.media_asset_answer_single) {
            return [$var.media_asset_answer_single];
          }
          return null;
        """
      timeout = 10
    } as $media_asset_answer
  }

  response = {
          "user": $user.name,
          "answer": $answer,
          "media_asset_answer": $media_asset_answer,
          "expert_profile": $expert_profile,
          "id": $question.id,
          "created_at": $question.created_at,
          "payer_email": $question.payer_email,
          "price_cents": $question.price_cents,
          "currency": $question.currency,
          "status": $question.status,
          "checkout_session_id": $question.checkout_session_id,
          "payment_intent_id": $question.payment_intent_id,
          "paid_at": $question.paid_at,
          "recorded_at": $question.recorded_at,
          "answered_at": $question.answered_at,
          "refunded_at": $question.refunded_at,
          "playback_token_hash": $question.playback_token_hash,
          "sla_hours_snapshot": $question.sla_hours_snapshot,
          "followup_parent_id": $question.followup_parent_id,
          "attachments": $question.attachments,
          "title": $question.title,
          "text": $question.text,
          "media_asset": $media_asset,
          "pricing_status": $question.pricing_status,
          "decline_reason": $question.decline_reason
  }
}