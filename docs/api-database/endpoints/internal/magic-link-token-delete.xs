query "internal/magic-link-token" verb=DELETE {
  input {
    text x_api_key? filters=trim
    int token_id?
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        debug.stop {
          value = { error: "Unauthorized" }
        }
      }
    
      else {
        db.del magic_link_token {
          field_name = "id"
          field_value = $input.token_id
        }
      }
    }
  }

  response = ""
}