// Protected with INTERNAL_API_KEY passed by Vercel
// { "token": $token, "email": $user.email, "name": $user.name }
query "auth/linkedin/create_user" verb=POST {
  input {
    text x_api_key filters=trim
    text linkedin_id filters=trim
    text email filters=trim
    text name filters=trim
    text given_name? filters=trim
    text family_name? filters=trim
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        debug.stop {
          value = `"Unautherized"`
        }
      }
    }
  
    db.query user {
      where = $db.user.email == $input.email
      return = {type: "single"}
    } as $existing_user
  
    conditional {
      if ($existing_user == null) {
        db.add user {
          data = {
            created_at    : "now"
            name          : $input.name
            email         : $input.email
            password      : null
            auth_provider : "linkedin"
            linkedin_oauth: ```
              {
                  "id": $input.linkedin_id,
                  "name": $input.name,
                  "email": $input.email
              }
              ```
          }
        } as $user
      
        var $first_time {
          value = true
        }
      }
    
      else {
        db.edit user {
          field_name = "email"
          field_value = $input.email
          data = {
            password      : null
            auth_provider : "linkedin"
            linkedin_oauth: ```
              {
                  "id": $input.linkedin_id,
                  "name": $input.name,
                  "email": $input.email
              }
              ```
          }
        } as $user
      
        var $first_time {
          value = false
        }
      }
    }
  
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $token
  }

  response = {
    result: ```
      { 
      "token": $token, 
      "email": $user.email, 
      "name": $user.name,
      "first_time": $first_time 
      }
      ```
  }
}