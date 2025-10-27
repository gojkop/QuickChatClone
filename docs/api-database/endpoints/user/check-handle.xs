query "expert/profile/check-handle/{handle}" verb=GET {
  auth = "public"

  input {
    text handle
  }

  stack {
    var $normalized_handle {
      value = $input.handle
    }

    db.query expert_profile {
      where = $db.expert_profile.handle == $normalized_handle
      return = {type: "single"}
    } as $existing_profile

    conditional {
      if ($existing_profile != null) {
        var $is_available {
          value = false
        }
      }
    }

    conditional {
      if ($existing_profile == null) {
        var $is_available {
          value = true
        }
      }
    }
  }

  response = {
    "available": $is_available,
    "handle": $input.handle
  }
}
