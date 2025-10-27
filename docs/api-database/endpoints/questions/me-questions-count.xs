query "me/questions/count" verb=GET {
  auth = "user"

  input {
    text status? filters=trim
    bool unanswered?
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expertProfile
  
    conditional {
      if ($expertProfile != null) {
        // Build where clause
        db.query question {
          where = $db.question.expert_profile_id == $expertProfile.id && $db.question.status ==? $input.status
          return = {type: "list"}
        } as $questions
      
        // Filter for unanswered if requested
        conditional {
          if ($input.unanswered) {
            api.lambda {
              code = """
                  var questions = $var.questions || [];
                  var unanswered = questions.filter(function(q) {
                    return !q.answered_at;
                  });
                  return unanswered.length;
                """
              timeout = 5
            } as $count
          }
        
          else {
            var $count {
              value = ($var.questions || []).length
            }
          }
        }
      
        return {
          value = {
            count: $count
          }
        }
      }
    
      else {
        return {
          value = {
            error: "Expert profile not found",
            count: 0
          }
        }
      }
    }
  }

  response = $result
}