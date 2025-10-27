query "auth/magic-link/verify" verb=POST {
  input {
    text token filters=trim
    text ip_address? filters=trim
  }

  stack {
    db.query magic_link_token {
      where = $db.magic_link_token.token == $input.token
      return = {type: "single"}
    } as $magic_link_record
  
    conditional {
      if ($magic_link_record == null) {
        debug.stop {
          value = {
            "error": "token_not_found"
          }
        }
      }
    
      else {
        var $now_timestamp {
          value = now
        }
      
        conditional {
          if ($magic_link_record.expires_at < $now_timestamp) {
            debug.stop {
              value = {
                "error": "token_expired"
              }
            }
          }
        
          else {
            conditional {
              if ($magic_link_record.used) {
                debug.stop {
                  value = {
                    "error": "token_already_used"
                  }
                }
              }
            
              else {
                db.edit magic_link_token {
                  field_name = "id"
                  field_value = $magic_link_record.id
                  data = {
                    token     : $input.token
                    used      : true
                    used_at   : $now_timestamp
                    ip_address: $input.ip_address
                  }
                } as $magic_link_token1
              }
            }
          }
        }
      }
    }
  
    db.get user {
      field_name = "email"
      field_value = $magic_link_record.email
    } as $existing_user
  
    conditional {
      if ($existing_user == null) {
        db.add user {
          data = {
            created_at      : "now"
            name            : ""
            email           : $magic_link_record.email
            password        : null
            role            : ""
            auth_provider   : "magic_link"
            auth_provider_id: $magic_link_record.email
            google_sub      : ""
            fname           : ""
            lname           : ""
            address         : ""
            city            : ""
            zip             : ""
            country         : ""
            linkedin_oauth  : {}
            google_oauth    : ""
          }
        } as $user
      
        var $is_new_user {
          value = true
        }
      }
    
      else {
        var $user {
          value = $existing_user
        }
      
        var $is_new_user {
          value = false
        }
      }
    }
  
    security.create_auth_token {
      table = "user"
      extras = {}
      expiration = 86400
      id = $user.id
    } as $auth_token
  }

  response = {
    "token": $auth_token,
    "email": $user.email,
    "name": $user.name,
    "is_new_user": $is_new_user
  }
}