query "internal/diagnostic/questions" verb=GET {
  input {
    text x_api_key filters=trim
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        debug.stop {
          value = "Unauthorized"
        }
      }
    }

    db.query question {
      return = {type: "list", limit: 10}
      sort = {field: "created_at", direction: "desc"}
    } as $recent_questions

    api.lambda {
      code = """
        console.log("🔍 DIAGNOSTIC - Recent questions:");
        for (var i = 0; i < $var.recent_questions.length; i++) {
          var q = $var.recent_questions[i];
          console.log("Question " + (i+1) + ":");
          console.log("  ID: " + q.id);
          console.log("  payment_intent_id: " + q.payment_intent_id);
          console.log("  stripe_payment_intent_id: " + q.stripe_payment_intent_id);
          console.log("  checkout_session_id: " + q.checkout_session_id);
          console.log("  created_at: " + q.created_at);
          console.log("---");
        }

        // Return summary for response
        var summary = [];
        for (var i = 0; i < $var.recent_questions.length; i++) {
          summary.push({
            id: $var.recent_questions[i].id,
            payment_intent_id: $var.recent_questions[i].payment_intent_id,
            stripe_payment_intent_id: $var.recent_questions[i].stripe_payment_intent_id || "N/A",
            created_at: $var.recent_questions[i].created_at
          });
        }
        return summary;
      """
      timeout = 10
    } as $question_summary
  }

  response = {
    "success": true,
    "total_questions": $recent_questions.length,
    "questions": $question_summary
  }
}
