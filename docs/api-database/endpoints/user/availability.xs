query "expert/profile/availability" verb=POST {
  auth = "user"

  input {
    bool accepting_questions
  }

  stack {
    db.edit expert_profile {
      field_name = "user_id"
      field_value = $auth.id
      data = {accepting_questions: $input.accepting_questions}
    } as $expert_profile_updated
  }

  response = "{updated expert_profile availability}"
}