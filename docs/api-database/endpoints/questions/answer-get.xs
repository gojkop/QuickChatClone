query answer verb=GET {
  auth = "user"

  input {
    int question_id?
  }

  stack {
    db.get answer {
      field_name = "question_id"
      field_value = $input.question_id
    } as $answer
  
    conditional {
      if ($answer != null && $answer.media_asset_id != null && $answer.media_asset_id > 0) {
        db.get media_asset {
          field_name = "id"
          field_value = $answer.media_asset_id
        } as $media_asset
      }
    }
  }

  response = {
    "answer": $answer,
    "media_asset": $media_asset
  }
}