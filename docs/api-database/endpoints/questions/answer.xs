query answer verb=POST {
  auth = "user"

  input {
    int question_id
    int user_id
    int? media_asset_id?
    text? text_response? filters=trim
    text? attachments?
  }

  stack {
    conditional {
      if ($input.media_asset_id == null && $input.text_response == null) {
        debug.stop {
          value = '400 error "Answer must include media or text"'
        }
      }
    }

    db.get question {
      field_name = "id"
      field_value = $input.question_id
    } as $question

    conditional {
      if ($question == null) {
        debug.stop {
          value = '404 error "Question not found"'
        }
      }

      elseif ($question.answered_at != null) {
        debug.stop {
          value = '400 error "Question already answered"'
        }
      }
    }

    db.get expert_profile {
      field_name = "user_id"
      field_value = $input.user_id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your question to answer"'
        }
      }
    }

    db.add answer {
      data = {
        created_at    : "now"
        sent_at       : now
        question_id   : $input.question_id
        media_asset_id: $input.media_asset_id
        user_id       : $input.user_id
        text_response : $input.text_response
        media_uid     : ""
        media_url     : ""
        media_duration: 0
        media_type    : ""
        attachments   : $input.attachments
        rating        : null
        feedback_text : null
        view_count    : 0
        feedback_at   : null
      }
    } as $created_answer

    db.edit question {
      field_name = "id"
      field_value = $input.question_id
      data = {
        status: "closed",
        answered_at: now,
        media_asset_id: $question.media_asset_id
      }
    } as $question_updated

    api.lambda {
      code = """
          var safe_question = {
            id: $var.question_updated.id,
            expert_profile_id: $var.question_updated.expert_profile_id,
            user_id: $var.question_updated.user_id,
            title: $var.question_updated.title,
            text: $var.question_updated.text,
            status: $var.question_updated.status,
            question_tier: $var.question_updated.question_tier,
            pricing_status: $var.question_updated.pricing_status,
            final_price_cents: $var.question_updated.final_price_cents,
            proposed_price_cents: $var.question_updated.proposed_price_cents,
            media_asset_id: $var.question_updated.media_asset_id,
            attachments: $var.question_updated.attachments,
            created_at: $var.question_updated.created_at,
            answered_at: $var.question_updated.answered_at,
            sla_deadline: $var.question_updated.sla_deadline

          };

          return safe_question;
        """
        timeout = 10
    } as $safe_question
  }

  response = {
    "id"            : $created_answer.id,
    "question_id"   : $created_answer.question_id,
    "created_at"    : $created_answer.created_at,
    "sent_at"       : $created_answer.sent_at,
    "created_answer": $created_answer,
    "question"     : $safe_question
  }
}
