query "internal/test-data/cleanup" verb=DELETE {
  input {
    text x_api_key filters=trim
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        debug.stop {
          value = "Unauthorized"
        }
      }
    }
  }

  response = {
    "success": true,
    "message": "Cleanup endpoint works"
  }
}
