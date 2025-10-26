query "question/hidden" verb=POST {
  auth = "user"

  input {
    bool hidden
    int question_id
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile
  
    db.query question {
      where = $db.question.expert_profile_id == $expert_profile.id && $db.question.id == $input.question_id
      return = {type: "single"}
    } as $question
  
    conditional {
      if ($question == null) {
        debug.stop {
          value = 'Error 400: "Question does not belong to you, or does not exist!"'
        }
      }
    
      else {
        db.edit question {
          field_name = "id"
          field_value = $question.id
          data = {hidden: $input.hidden}
        } as $question_changed
      }
    }
  
    !db.get question {
      field_name = "id"
      field_value = $question_changed.id
    } as $question_result
  }

  response = {
      "Question is set to ": $question_changed.hidden
  }
}