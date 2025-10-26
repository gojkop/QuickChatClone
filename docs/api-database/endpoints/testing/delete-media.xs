query "internal/media_asset" verb=DELETE {
  input {
    text x_api_key filters=trim
    int media_asset_id
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        debug.stop {
          value = "Unauthorized"
        }
      }
    
      else {
        db.del media_asset {
          field_name = "id"
          field_value = $input.media_asset_id
        }
      }
    }
  }

  response = { "success": true, "deleted_id": $input.media_asset_id }
}