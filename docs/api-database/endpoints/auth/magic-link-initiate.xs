query "auth/magic-link/initiate" verb=POST {
  input {
    text email filters=trim
    text ip_address filters=trim
  }

  stack {
    var $normalized_email {
      value = `$input.email|trim|to_lower`
    }
  
    function.run check_magic_link_rate_limit {
      input = {email: $normalized_email}
    } as $rate_limit_check
  
    conditional {
      if ($rate_limit_check.allowed == false) {
        debug.stop {
          value = {
            "error": "rate_limit_exceeded",
            "retry_after": $var.rate_limit_check.retry_after
          }
        }
      }
    
      else {
        function.run "generate_magic_link_token()" as $token_data
        var $expires_at {
          value = now|add_secs_to_timestamp:900
        }
      
        db.add magic_link_token {
          data = {
            created_at       : "now"
            email            : $normalized_email
            token            : $token_data.token
            verification_code: $token_data.verification_code
            user_id          : null
            expires_at       : $expires_at
            used             : false
            used_at          : ""
            ip_address       : $input.ip_address
          }
        } as $magic_link_record
      
        return {
          value = {
            "success": true,
            "token": $token_data.token,
            "verification_code": $token_data.verification_code,
            "expires_in_seconds": 900
          }
        }
      }
    }
  }

  response = ""
}