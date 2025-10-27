query "questions/expired-sla" verb=GET {
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
      return = {type: "list"}
    } as $all_questions
  
    api.lambda {
      code = """
          var now = Math.floor(Date.now() / 1000);
        
          return $var.all_questions.filter(function(q) {
            var isPaidOrAccepted = (q.status === 'paid' || q.status === 'accepted');
            var hasSlaDeadline = q.sla_deadline !== null && q.sla_deadline !== undefined;
        
            // Convert deadline from milliseconds to seconds for comparison
            var deadlineInSeconds = q.sla_deadline / 1000;
            var isExpired = hasSlaDeadline && deadlineInSeconds < now;
        
            return isPaidOrAccepted && isExpired;
          });
        """
      timeout = 10
    } as $expired_questions
  }

  response = $expired_questions
}