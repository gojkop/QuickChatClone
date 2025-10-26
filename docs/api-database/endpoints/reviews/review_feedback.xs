query "review/{token}/feedback" verb=POST {
  input {
    text token filters=trim
    int rating
    text feedback_text? filters=trim
  }

  stack {
    db.get question {
      field_name = "playback_token_hash"
      field_value = $input.token
    } as $question
  
    // ✅ ADDED: Validate question exists (token is valid)
    conditional {
      if ($question == null) {
        debug.stop {
          value = '404 error "Invalid review token"'
        }
      }
    }
  
    db.get answer {
      field_name = "question_id"
      field_value = $question.id
    } as $answer
  
    // ✅ ADDED: Validate answer exists (question has been answered)
    conditional {
      if ($answer == null) {
        debug.stop {
          value = '400 error "Question has not been answered yet"'
        }
      }
    }
  
    conditional {
      if ($input.rating < 1 || $input.rating > 5) {
        debug.stop {
          value = '400 error "Rating must be between 1 and 5"'
        }
      }

      elseif ($answer.feedback_at != null) {
        debug.stop {
          value = '400 error "Feedback already submitted for this answer"'
        }
      }
    }
  
    db.edit answer {
      field_name = "id"
      field_value = $answer.id
      data = {
        rating       : $input.rating
        feedback_text: $input.feedback_text
        feedback_at  : now
      }
    } as $answer1
  }

  response = {
      "success": true,
      "message": "Feedback submitted successfully"
  }
}