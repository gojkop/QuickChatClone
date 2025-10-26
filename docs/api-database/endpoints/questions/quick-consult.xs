query "question/quick-consult" verb=POST {
  input {
    int expert_profile_id
    text payer_email filters=trim
    text title filters=trim
    text text? filters=trim
    int media_asset_id?
    text stripe_payment_intent_id filters=trim
    text attachments? filters=trim
    int sla_hours_snapshot?
  }

  stack {
    db.get payment_table_structure {
      field_name = "stripe_payment_intent_id"
      field_value = $input.stripe_payment_intent_id
    } as $existing_payment
  
    conditional {
      if ($existing_payment != null) {
        debug.stop {
          value = '400 error "Payment already used for another question"'
        }
      }
    }
  
    api.lambda {
      code = """
          // Uncomment if you have ENVIRONMENT variable set to "production"
          // if ($input.stripe_payment_intent_id.startsWith("pi_mock_")) {
          //   throw new Error('400 error "Invalid payment method"');
          // }
          console.log("💳 Creating Quick Consult with payment: " + $input.stripe_payment_intent_id);
        """
      timeout = 10
    }
  
    db.get expert_profile {
      field_name = "id"
      field_value = $input.expert_profile_id
    } as $expert_profile
  
    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert not found"'
        }
      }
    }
  
    api.lambda {
      code = """
        if (!$var.expert_profile.tier1_enabled) {
            throw new Error("Expert does not have Quick Consult enabled");
          }
          return true;
        """
      timeout = 10
    } as $validation_passed
  
    api.lambda {
      code = """
        return {
            price_cents: $var.expert_profile.tier1_price_cents,
            sla_hours: $var.expert_profile.tier1_sla_hours
          };
        """
      timeout = 10
    } as $tier1_config
  
    api.lambda {
      code = """
        var now = Date.now();
          var slaHours = $var.tier1_config.sla_hours;
          var deadline = now + (slaHours * 60 * 60 * 1000);
          return deadline;
        """
      timeout = 10
    } as $sla_deadline
  
    api.lambda {
      code = "return $var.sla_hours_snapshot || $var.tier1_config.sla_hours;"
      timeout = 10
    } as $sla_hours_final
  
    security.create_uuid as $playback_token_hash
    db.add question {
      data = {
        expert_profile_id   : $input.expert_profile_id
        created_at          : "now"
        payer_email         : $input.payer_email
        price_cents         : $tier1_config.price_cents
        currency            : "USD"
        status              : "paid"
        checkout_session_id : ""
        payment_intent_id   : $input.stripe_payment_intent_id
        paid_at             : ""
        recorded_at         : ""
        answered_at         : ""
        refunded_at         : ""
        playback_token_hash : $playback_token_hash
        sla_hours_snapshot  : $sla_hours_final
        attachments         : $input.attachments
        title               : $input.title
        text                : $input.text
        media_asset_id      : $input.media_asset_id
        hidden              : false
        payer_first_name    : ""
        payer_last_name     : ""
        question_tier       : "quick_consult"
        pricing_status      : "paid"
        proposed_price_cents: 0
        final_price_cents   : $tier1_config.price_cents
        sla_start_time      : now
        sla_deadline        : $sla_deadline
        sla_missed          : false
        offer_expires_at    : null
        decline_reason      : null
        expert_reviewed_at  : null
      }
    } as $question
  
    db.add payment_table_structure {
      data = {
        stripe_payment_intent_id: $input.stripe_payment_intent_id
        amount_cents            : $tier1_config.price_cents
        currency                : "USD"
        status                  : "authorized"
        question_type           : "quick_consult"
        accepted_at             : now
        captured_at             : null
        capture_attempted       : false
        capture_failed          : false
        retry_count             : 0
        error_message           : null
        authorized_at           : null
        refunded_at             : null
        created_at              : 0
        updated_at              : 0
        question_id             : $question.id
      }
    } as $payment
  }

  response = {      "question_id": $question.id
        "final_price_cents": $tier1_config.price_cents
        "sla_deadline": $sla_deadline
        "status": "paid",
        "playback_token_hash": $playback_token_hash}
}