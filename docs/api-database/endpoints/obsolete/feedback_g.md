query feedback verb=GET {
  input {
  }

  stack {
    db.query "" {
      return = {type: "list"}
    } as $feedback
  }

  response = $feedback
}