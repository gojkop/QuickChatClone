query "offers/{id}/decline" verb=POST {
  auth = "user"

  input {
    int id
    text decline_reason? filters=trim
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
    } as $question

    conditional {
      if ($question == null) {
        debug.stop {
          value = '404 error "Offer not found"'
        }
      }
    }

    // ✅ FIXED: Use conditional instead of lambda
    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your offer to decline"'
        }
      }
    }

    conditional {
      if ($question.pricing_status != "offer_pending") {
        debug.stop {
          value = '400 error "This offer cannot be declined (status: ' + $question.pricing_status + ')"'
        }
      }
    }

    db.edit question {
      field_name = "id"
      field_value = $question.id
      data = {
        pricing_status    : "offer_declined"
        status            : "declined"
        decline_reason    : $input.decline_reason
        expert_reviewed_at: now
      }
    } as $updated_question

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $question.id
    } as $payment

    conditional {
      if ($payment != null) {
        db.edit payment_table_structure {
          field_name = "id"
          field_value = $payment.id
          data = {status: "refunded", refunded_at: now}
        } as $updated_payment
      }
    }
  }

  response = {
    "success": true,
    "question_id": $input.id,
    "status": "offer_declined",
    "refund_status": "initiated"
  }
}
