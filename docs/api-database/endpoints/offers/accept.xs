query "offers/{id}/accept" verb=POST {
  auth = "user"

  input {
    int id
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
          value = '403 error "Forbidden: Not your offer to accept"'
        }
      }
    }

    conditional {
      if ($question.pricing_status != "offer_pending") {
        debug.stop {
          value = '400 error "This offer cannot be accepted (status: ' + $question.pricing_status + ')"'
        }
      }
    }

    // Check offer expiration
    api.lambda {
      code = """
        var now = Date.now();
        var expiresAt = $var.question.offer_expires_at;

        if (expiresAt && expiresAt < now) {
          return true;  // Expired
        }
        return false;  // Not expired
      """
      timeout = 10
    } as $is_expired

    conditional {
      if ($is_expired == true) {
        debug.stop {
          value = '400 error "This offer has expired"'
        }
      }
    }

    // Calculate SLA deadline
    api.lambda {
      code = """
        var now = Date.now();
        var slaHours = $var.expert_profile.tier2_sla_hours || 48;
        var deadline = now + (slaHours * 60 * 60 * 1000);
        return deadline;
      """
      timeout = 10
    } as $sla_deadline

    db.edit question {
      field_name = "id"
      field_value = $question.id
      data = {
        pricing_status    : "offer_accepted"
        sla_start_time    : now
        sla_deadline      : $sla_deadline
        expert_reviewed_at: now
      }
    } as $updated_question

    db.get payment_table_structure {
      field_name = "question_id"
      field_value = $question.id
    } as $payment

    db.edit payment_table_structure {
      field_name = "id"
      field_value = $payment.id
      data = {status: "accepted", accepted_at: now}
    } as $updated_payment

    api.lambda {
      code = "return $var.expert_profile.tier2_sla_hours || 48;"
      timeout = 10
    } as $sla_hours
  }

  response = {
    "success": true,
    "question_id": $question.id,
    "status": "offer_accepted",
    "sla_deadline": $sla_deadline,
    "sla_hours": $sla_hours
  }
}
