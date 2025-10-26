query "question/{id}" verb=PATCH {
  auth = "user"

  input {
    int id
    text checkout_session_id? filters=trim
    text payment_intent_id? filters=trim
    text status? filters=trim
    timestamp? paid_at?
    timestamp? answered_at?
    timestamp? refunded_at?
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile
  
    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }
  
    db.get question {
      field_name = "id"
      field_value = $input.id
    } as $existing_question
  
    conditional {
      if ($existing_question == null) {
        debug.stop {
          value = '404 error "Question not found"'
        }
      }
    }
  
    conditional {
      if ($existing_question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your question to update"'
        }
      }
    }
  
    db.edit question {
      field_name = "id"
      field_value = $existing_question.id
      data = {
        status             : $input.status
        checkout_session_id: $input.checkout_session_id
        payment_intent_id  : $input.payment_intent_id
        paid_at            : $input.paid_at
        answered_at        : $input.answered_at
        refunded_at        : $input.refunded_at
      }
    } as $updated_question
  
    api.lambda {
      code = """
          var safe_question = {
            id: $var.updated_question.id,
            expert_profile_id: $var.updated_question.expert_profile_id,
            user_id: $var.updated_question.user_id,
            title: $var.updated_question.title,
            text: $var.updated_question.text,
            status: $var.updated_question.status,
            question_tier: $var.updated_question.question_tier,
            pricing_status: $var.updated_question.pricing_status,
            final_price_cents: $var.updated_question.final_price_cents,
            proposed_price_cents: $var.updated_question.proposed_price_cents,
            media_asset_id: $var.updated_question.media_asset_id,
            attachments: $var.updated_question.attachments,
            created_at: $var.updated_question.created_at,
            answered_at: $var.updated_question.answered_at,
            paid_at: $var.updated_question.paid_at,
            refunded_at: $var.updated_question.refunded_at,
            sla_deadline: $var.updated_question.sla_deadline,
            hidden: $var.updated_question.hidden,
            checkout_session_id: $var.updated_question.checkout_session_id,
            payment_intent_id: $var.updated_question.payment_intent_id
            
          };
        
          return safe_question;
        """
    } as $safe_response
  }

  response = $safe_response
}