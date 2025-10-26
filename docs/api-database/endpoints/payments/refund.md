query "question/{question_id}/refund" verb=POST {
  auth = "user"

  input {
    bool payment_canceled?
    text? payment_intent_id? filters=trim
    text? refund_reason? filters=trim
    int question_id?
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

    // ✅ FIXED: Simplified query with proper ownership check
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
    }

    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your question to refund"'
        }
      }
    }

    // ✅ FIXED: Use debug.stop instead of return
    conditional {
      if ($question.answered_at != null) {
        debug.stop {
          value = '400 error "Cannot refund - question already answered"'
        }
      }
    }

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $question.id
    } as $payment

    conditional {
      if ($payment == null) {
        debug.stop {
          value = '404 error "Payment not found"'
        }
      }
    }

    conditional {
      if ($payment.status == "refunded") {
        debug.stop {
          value = '400 error "Payment already refunded"'
        }
      }
    }

    db.edit payment_table_structure {
      field_name = "id"
      field_value = $payment.id
      data = {status: "refunded", refunded_at: now}
    } as $payment_update

    db.edit question {
      field_name = "id"
      field_value = $input.question_id
      data = {
        status           : "refunded"
        payment_intent_id: $input.payment_intent_id
        pricing_status   : "refunded"
        refunded_at      : now
      }
    } as $question_update
  }

  response = {
    "success": true,
    "question_id": $question.id,
    "payment_status": $question_update.pricing_status,
    "refunded_at": $payment_update.refunded_at
  }
}
