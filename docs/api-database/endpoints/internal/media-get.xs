query "internal/media" verb=GET {
  input {
    text x_api_key filters=trim
    text type? filters=trim
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        debug.stop {
          value = "Unauthorized"
        }
      }
    }
  
    db.query media_asset {
      return = {type: "list"}
    } as $all_media
  
    db.query expert_profile {
      where = "avatar_url" != null
      return = {type: "list"}
    } as $all_avatars
  
    db.query answer {
      where = $db.answer.attachments != null
      return = {type: "list"}
    } as $all_answer_attachments
  
    db.query question {
      where = $db.question.attachments != null
      return = {type: "list"}
    } as $all_question_attachments
  
    db.query magic_link_token {
      return = {type: "list"}
    } as $all_magic_link_tokens
  
    db.query question {
      return = {type: "list"}
    } as $all_questions
  
    db.query answer {
      return = {type: "list"}
    } as $all_answers
  }

  response = {        "media": $all_media,
  "avatars": $all_avatars,
  "question_attachments": $all_question_attachments,
  "answer_attachments": $all_answer_attachments,
  "magic_link_tokens": $all_magic_link_tokens,
  "questions": $all_questions,
  "answers": $all_answers
  }
}