query "question/{id}/expire-offer" verb=POST {
  input {
    text x_api_key
    int id
    bool payment_canceled
    text? payment_intent_id?
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        return {
          value = {
            "error": "Unauthorized",
            "status": 401
          }
        }
      }
    }
  
    db.edit question {
      field_name = "id"
      field_value = $input.id
      data = {
        pricing_status: "offer_expired"
        status        : "declined"
        decline_reason: "Offer expired - not accepted within 24 hours"
      }
    } as $updated_question
  }

  response = $updated_question
}