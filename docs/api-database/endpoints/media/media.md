query media_asset verb=POST {
  auth = "user"

  input {
    text provider filters=trim
    text asset_id filters=trim
    int duration_sec
    text status filters=trim
    text url filters=trim
    json metadata?
    int segment_index?
  }

  stack {
    db.add media_asset {
      data = {
        created_at   : "now"
        provider     : $input.provider
        asset_id     : $input.asset_id
        duration_sec : $input.duration_sec
        status       : $input.status
        url          : $input.url
        metadata     : $input.metadata
        segment_index: $input.segment_index
      }
    } as $media_asset
  }

  response = $media_asset
}