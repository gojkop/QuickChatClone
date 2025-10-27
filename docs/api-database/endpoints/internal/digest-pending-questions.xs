query "internal/digest/pending-questions" verb=GET {
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
      return = {type: "list"}
    } as $questions

    conditional {
      if ($questions == null) {
        debug.stop {
          value = "No unanswered questions."
        }
      }
    }

    db.query expert_profile {
      return = {type: "list"}
    } as $all_experts

    db.query user {
      return = {type: "list"}
    } as $all_users

    api.lambda {
      code = """
        var result = [];

        // Create lookup maps for performance
        var expertMap = {};
        for (var i = 0; i < $var.all_experts.length; i++) {
          expertMap[$var.all_experts[i].id] = $var.all_experts[i];
        }

        var userMap = {};
        for (var j = 0; j < $var.all_users.length; j++) {
          userMap[$var.all_users[j].id] = $var.all_users[j];
        }

        // Build result array
        for (var k = 0; k < $var.questions.length; k++) {
          var question = $var.questions[k];
          var expert = expertMap[question.expert_profile_id];

          if (expert && expert.daily_digest_enabled === true) {
            var user = userMap[expert.user_id];

            if (user) {
              result.push({
                question: question,
                user_email: user.email
              });
            }
          }
        }

        return result;
      """
      timeout = 10
    } as $result
  }

  response = $result
}
