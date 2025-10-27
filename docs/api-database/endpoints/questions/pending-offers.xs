query "expert/pending-offers" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile
  
    api.lambda {
      code = "return Date.now();"
      timeout = 10
    } as $now
  
    db.query question {
      where = $db.question.expert_profile_id == $expert_profile.id && $db.question.question_tier == "deep_dive" && $db.question.pricing_status == "offer_pending" && $db.question.offer_expires_at > $now
      sort = {question.recorded_at: "desc"}
      return = {type: "list"}
    } as $pending_offers
  
    foreach ($pending_offers) {
      each as $item {
        api.lambda {
          code = """
            var offers = $var.pending_offers || [];
              var currentTime = $var.now;
              var result = [];
            
              for (var i = 0; i < offers.length; i++) {
                var offer = offers[i];
                var timeRemaining = offer.offer_expires_at - currentTime;
                var hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));
            
                result.push({
                  question_id: offer.id,
                  title: offer.title,
                  text: offer.text,
                  payer_email: offer.payer_email,
                  proposed_price_cents: offer.proposed_price_cents,
                  asker_message: offer.asker_message || "",
                  media_asset_id: offer.media_asset_id,
                  created_at: offer.created_at,
                  offer_expires_at: offer.offer_expires_at,
                  hours_remaining: hoursRemaining,
                  attachments: offer.attachments ? JSON.parse(offer.attachments) : []
                });
              }
            
              return result;
            """
          timeout = 10
        } as $offers_response
      }
    }
  
    api.lambda {
      code = "return $var.offers_response.length;"
      timeout = 10
    } as $offer_count
  }

  response = {
      "offers": $offers_response,
      "count": $offer_count
  }
}