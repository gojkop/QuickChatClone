// profile
query "public/profile" verb=GET {
  input {
    text handle? filters=trim
  }

  stack {
    db.get expert_profile {
      field_name = "handle"
      field_value = $input.handle
    } as $expert_profile
  
    db.get user {
      field_name = "id"
      field_value = $expert_profile.user_id
    } as $user
  
    api.lambda {
      code = """
        var profile = $var.expert_profile; // Use your actual variable name
        
          var quickConsult = null;
          if (profile.tier1_enabled) {
            quickConsult = {
              enabled: true,
              price_cents: profile.tier1_price_cents,
              sla_hours: profile.tier1_sla_hours,
              description: profile.tier1_description
            };
          }
        
          var deepDive = null;
          if (profile.tier2_enabled) {
            deepDive = {
              enabled: true,
              pricing_mode: profile.tier2_pricing_mode,
              min_price_cents: profile.tier2_min_price_cents,
              max_price_cents: profile.tier2_max_price_cents,
              sla_hours: profile.tier2_sla_hours,
              description: profile.tier2_description
              // NOTE: Do NOT include auto_decline_below_cents (keep it private)
            };
          }
        
          return {
            quick_consult: quickConsult,
            deep_dive: deepDive
          };
        """
      timeout = 10
    } as $tiers
  }

  response = {
    "expert_profile": $expert_profile
    "user": {
      "name": $user.name
    },
    "tiers": $tiers
  }
}