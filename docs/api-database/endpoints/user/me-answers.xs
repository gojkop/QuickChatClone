query "me/answers" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile
  
    var $return {
      value = []
    }
  
    conditional {
      if ($expert_profile == null) {
      }
    
      else {
        db.query answer {
          where = $db.answer.user_id == $expert_profile.user_id && $db.answer.rating != null && $db.answer.rating > 0
          return = {type: "list"}
        } as $answers
      
        foreach ($answers) {
          each as $item {
            array.push $return {
              value = {
                  "question_id": $item.question_id,
                  "rating": $item.rating,
                  "feedback_text": $item.feedback_text,
                  "feedback_at": $item.feedback_at
              }
            }
          }
        }
      }
    }
  }

  response = $return
}