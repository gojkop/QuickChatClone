query "payment/capture" verb=POST {
  auth = "user"

  input {
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

    // ✅ FIXED: Use debug.stop instead of return
    conditional {
      if ($question.expert_profile_id != $expert_profile.id) {
        debug.stop {
          value = '403 error "Forbidden: Not your question"'
        }
      }
    }

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $input.question_id
    } as $payment

    conditional {
      if ($payment == null) {
        debug.stop {
          value = '404 error "Payment not found"'
        }
      }
    }

    conditional {
      if ($payment.status == "captured") {
        debug.stop {
          value = '400 error "Payment already captured"'
        }
      }
    }

    db.edit payment_table_structure {
      field_name = "id"
      field_value = $payment.id
      data = {
        status           : "captured"
        captured_at      : now
        capture_attempted: true
      }
    } as $payment_update
  }

  response = {
    "success": true,
    "payment_id": $payment.id,
    "question_id": $payment.question_id,
    "status": "captured",
    "captured_at": $payment_update.captured_at
  }
}
