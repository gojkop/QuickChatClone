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
      sort = {question.created_at: "desc"}
      return = {type: "list"}
    } as $all_questions

    api.lambda {
      code = """
        // Limit to 10 most recent questions
        var questions = $var.all_questions || [];
        var recent = questions.slice(0, 10);

        console.log("🔍 DIAGNOSTIC - Recent questions:");
        for (var i = 0; i < recent.length; i++) {
          var q = recent[i];
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
        for (var i = 0; i < recent.length; i++) {
          summary.push({
            id: recent[i].id,
            payment_intent_id: recent[i].payment_intent_id,
            stripe_payment_intent_id: recent[i].stripe_payment_intent_id || "N/A",
            created_at: recent[i].created_at
          });
        }
        return summary;
      """
      timeout = 10
    } as $question_summary
  }

  response = {
    "success": true,
    "total_questions": $all_questions.length,
    "questions": $question_summary
  }
}
