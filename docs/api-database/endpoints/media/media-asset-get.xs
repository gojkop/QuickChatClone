query "media_asset/{id}" verb=GET {
  auth = "user"

  input {
    int id
  }

  stack {
    db.get media_asset {
      field_name = "id"
      field_value = $input.id
    } as $media_asset

    conditional {
      if ($media_asset == null) {
        debug.stop {
          value = "404 error \"Media asset not found\""
        }
      }
    }
  }

  response = $media_asset
}
