query "upload/profile-picture" verb=POST {
  auth = "user"

  input {
    text? image_url?
  }

  stack {
    conditional {
      if ($input.image_url == null) {
        db.edit expert_profile {
          field_name = "user_id"
          field_value = $auth.id
          data = {avatar_url: ""}
        } as $updated_profile
      }
      else {
        db.edit expert_profile {
          field_name = "user_id"
          field_value = $auth.id
          data = {avatar_url: $input.image_url}
        } as $updated_profile
      }
    }
  
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $updated_profile
  }

  response = { 
      "url": $updated_profile.avatar_url,
      "message": "Upload successful"
  }
}