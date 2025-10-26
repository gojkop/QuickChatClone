query "me/account" verb=PUT {
  auth = "user"

  input {
    text fname? filters=trim
    text lname? filters=trim
    text address? filters=trim
    text city? filters=trim
    text country? filters=trim
    text zip? filters=trim
  }

  stack {
    !var $user {
      value = $auth.id
    }
  
    db.edit user {
      field_name = "id"
      field_value = $auth.id
      data = {
        fname  : $input.fname
        lname  : $input.lname
        address: $input.address
        city   : $input.city
        zip    : $input.zip
        country: $input.country
      }
    } as $updated_user
  }

  response = {
      "success": true,
      "user": $updated_user
  }
}