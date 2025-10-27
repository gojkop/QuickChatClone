// update profile
query "me/profile" verb=PUT {
  auth = "user"

  input {
    int price_cents?=75 filters=min:1
    int sla_hours?=48 filters=min:1
    text bio? filters=trim|max:600
    bool public?
    enum currency?=USD {
      values = ["EUR", "USD"]
    }
  
    text handle filters=trim|max:30
    text professional_title? filters=trim
    text tagline? filters=trim
    json expertise?
    json socials?
    int charity_percentage?
    text selected_charity? filters=trim
    bool daily_digest_enabled?=true
    bool tier1_enabled?
    int tier1_price_cents?
    int tier1_sla_hours?
    text? tier1_description? filters=trim
    bool tier2_enabled?
    text? tier2_pricing_mode? filters=trim
    int? tier2_min_price_cents?
    int? tier2_max_price_cents?
    int? tier2_sla_hours?
    int? tier2_auto_decline_below_cents?
    text? tier2_description? filters=trim
  }

  stack {
    var $current_user_id {
      value = $auth.id
    }
  
    var $final_price_cents {
      value = `$input.price_cents`
    }
  
    var $final_sla_hours {
      value = `$input.sla_hours`
    }
  
    var $final_bio {
      value = `$input.bio`
    }
  
    var $final_public {
      value = `$input.public`
    }
  
    var $final_currency {
      value = `$input.currency`
    }
  
    var $final_handle {
      value = `$input.handle`
    }
  
    var $final_professional {
      value = $input.professional_title
    }
  
    var $final_tagline {
      value = $input.tagline
    }
  
    var $final_expertise {
      value = $input.expertise
    }
  
    var $final_socials {
      value = $input.socials
    }
  
    var $final_charity_percentage {
      value = $input.charity_percentage
    }
  
    var $final_charity {
      value = $input.selected_charity
    }
  
    var $final_daily_digest_enabled {
      value = $input.daily_digest_enabled
    }
  
    db.get expert_profile {
      field_name = "user_id"
      field_value = $current_user_id
    } as $profile
  
    db.edit expert_profile {
      field_name = "user_id"
      field_value = $current_user_id
      data = {
        price_cents                   : $final_price_cents
        currency                      : $final_currency
        sla_hours                     : $final_sla_hours
        bio                           : $final_bio
        public                        : $final_public
        updated_at                    : now
        handle                        : $final_handle
        professional_title            : $input.professional_title
        tagline                       : $input.tagline
        charity_percentage            : $input.charity_percentage
        selected_charity              : $final_charity
        daily_digest_enabled          : $final_daily_digest_enabled
        tier1_enabled                 : $input.tier1_enabled
        tier1_price_cents             : $input.tier1_price_cents
        tier1_sla_hours               : $input.tier1_sla_hours
        tier1_description             : $input.tier1_description
        tier2_enabled                 : $input.tier2_enabled
        tier2_pricing_mode            : $input.tier2_pricing_mode
        tier2_min_price_cents         : $input.tier2_min_price_cents
        tier2_max_price_cents         : $input.tier2_max_price_cents
        tier2_auto_decline_below_cents: $input.tier2_auto_decline_below_cents
        tier2_sla_hours               : $input.tier2_sla_hours
        tier2_description             : $input.tier2_description
        expertise                     : $input.expertise
        socials                       : $input.socials
      }
    } as $saved
  }

  response = $saved
}