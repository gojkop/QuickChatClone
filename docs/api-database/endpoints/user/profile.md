// fetch profile
query "me/profile" verb=GET {
  auth = "user"

  input {
  }

  stack {
    var $current_user_id {
      value = $auth.id
    }
  
    db.query expert_profile {
      where = $db.expert_profile.user_id == $current_user_id
      return = {type: "single"}
    } as $profile
  
    db.get user {
      field_name = "id"
      field_value = $auth.id
    } as $user_info
  }

  response = {
      "expert_profile": $profile,
      "user": $user_info
  }
}