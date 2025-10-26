query feedback verb=POST {
  input {
    text page? filters=trim
    text feedback? filters=trim
    text email? filters=trim
    int rating?
    text userAgent? filters=trim
  }

  stack {
    db.add "" {
      data = {
        created_at: "now"
        page      : $input.page
        message   : $input.feedback
        email     : $input.email
        rating    : $input.rating
        user_agent: $input.userAgent
      }
    } as $feedback
  }

  response = $feedback
}