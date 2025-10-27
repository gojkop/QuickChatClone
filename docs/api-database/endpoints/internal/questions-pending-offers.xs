query "questions/pending-offers" verb=GET {
  input {
    text x_api_key
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
  
    db.query question {
      where = $db.question.question_tier == "tier2" && $db.question.pricing_status == "offer_pending" && $db.question.status == "paid"
      return = {type: "list"}
    } as $pending_offers
  }

  response = $pending_offers
}