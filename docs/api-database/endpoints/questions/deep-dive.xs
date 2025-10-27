query "question/deep-dive" verb=POST {
  input {
    int expert_profile_id
    text payer_email filters=trim
    text payer_first_name? filters=trim
    text payer_last_name? filters=trim
    int proposed_price_cents
    text asker_message? filters=trim
    text title filters=trim
    text text? filters=trim
    text attachments? filters=trim
    int media_asset_id?
    text stripe_payment_intent_id filters=trim
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
          console.log("💳 Creating Deep Dive with payment: " + $input.stripe_payment_intent_id + ", proposed price: $" + ($input.proposed_price_cents / 100));
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
        if (!$var.expert_profile.tier2_enabled) {
            throw new Error("Expert does not have Deep Dive enabled");
          }
          return true;
        """
      timeout = 10
    } as $validation_passed
  
    api.lambda {
      code = """
        var autoDeclineThreshold = $var.expert_profile.tier2_auto_decline_below_cents;
          var proposedPrice = $input.proposed_price_cents;
        
          if (autoDeclineThreshold && proposedPrice < autoDeclineThreshold) {
            return {
              should_auto_decline: true,
              decline_reason: "Offer below minimum threshold of $" + (autoDeclineThreshold / 100)
            };
          }
        
          return {
            should_auto_decline: false,
            decline_reason: null
          };
        """
      timeout = 10
    } as $auto_decline_check
  
    api.lambda {
      code = 'return $var.auto_decline_check.should_auto_decline ? "offer_declined" : "offer_pending"'
      timeout = 10
    } as $pricing_status_value
  
    api.lambda {
      code = 'return $var.auto_decline_check.should_auto_decline ? "declined" : "paid";'
      timeout = 10
    } as $status_value
  
    api.lambda {
      code = "return $var.auto_decline_check.should_auto_decline ? Date.now() : null;"
      timeout = 10
    } as $declined_at_value
  
    api.lambda {
      code = """
        var now = Date.now();
          var expiryTime = now + (24 * 60 * 60 * 1000); // 24 hours
          return expiryTime;
        """
      timeout = 10
    } as $offer_expires_at
  
    api.lambda {
      code = """
        // Use input sla_hours_snapshot if provided, otherwise use expert's tier2_sla_hours
          return $var.sla_hours_snapshot || $var.expert_profile.tier2_sla_hours;
        """
      timeout = 10
    } as $sla_hours_final
  
    security.create_uuid as $playback_token_hash
    db.add question {
      data = {
        expert_profile_id   : $input.expert_profile_id
        created_at          : "now"
        payer_email         : $input.payer_email
        payer_first_name    : $input.payer_first_name
        payer_last_name     : $input.payer_last_name
        price_cents         : $input.proposed_price_cents
        currency            : "USD"
        status              : $status_value
        payment_intent_id   : $input.stripe_payment_intent_id
        playback_token_hash : $playback_token_hash
        sla_hours_snapshot  : $sla_hours_final
        attachments         : $input.attachments
        title               : $input.title
        text                : $input.text
        media_asset_id      : $input.media_asset_id
        hidden              : false
        question_tier       : "deep_dive"
        pricing_status      : $pricing_status_value
        proposed_price_cents: $input.proposed_price_cents
        final_price_cents   : $input.proposed_price_cents
        asker_message       : $input.asker_message
        sla_start_time      : null
        sla_deadline        : null
        sla_missed          : false
        offer_expires_at    : $offer_expires_at
        decline_reason      : $auto_decline_check.decline_reason
        expert_reviewed_at  : $declined_at_value
      }
    } as $question
  
    db.add payment_table_structure {
      data = {
        stripe_payment_intent_id: $input.stripe_payment_intent_id
        amount_cents            : $input.proposed_price_cents
        currency                : "USD"
        status                  : "authorized"
        question_type           : "deep_dive"
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

  response = {
      "question_id": $question.id,
      "proposed_price_cents": $input.proposed_price_cents,
      "status": $pricing_status_value,
      "offer_expires_at": $offer_expires_at,
      "playback_token_hash": $question.playback_token_hash
  }
}