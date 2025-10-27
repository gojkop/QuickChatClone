query "question/{id}/expire-sla" verb=POST {
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
        status        : "declined"
        decline_reason: "SLA expired - question not answered within deadline"
      }
    } as $updated_question
  }

  response = $updated_question
}