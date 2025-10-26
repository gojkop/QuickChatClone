query "expert/pricing-tiers" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile
  
    api.lambda {
      code = """
        var profile = $var.expert_profile;
        
          // Safety check - return defaults if no profile found
          if (!profile) {
            return {
              enabled: false,
              price_cents: 0,
              sla_hours: 24,
              description: ""
            };
          }
        
          return {
            enabled: profile.tier1_enabled || false,
            price_cents: profile.tier1_price_cents || 0,
            sla_hours: profile.tier1_sla_hours || 24,
            description: profile.tier1_description || ""
          };
        """
      timeout = 10
    } as $quick_consult
  
    api.lambda {
      code = """
        var profile = $var.expert_profile;
        
          // Safety check - return defaults if no profile found
          if (!profile) {
            return {
              enabled: false,
              pricing_mode: "asker_proposes",
              min_price_cents: 0,
              max_price_cents: 0,
              auto_decline_below_cents: null,
              sla_hours: 48,
              description: ""
            };
          }
        
          return {
            enabled: profile.tier2_enabled || false,
            pricing_mode: profile.tier2_pricing_mode || "asker_proposes",
            min_price_cents: profile.tier2_min_price_cents || 0,
            max_price_cents: profile.tier2_max_price_cents || 0,
            auto_decline_below_cents: profile.tier2_auto_decline_below_cents || null,
            sla_hours: profile.tier2_sla_hours || 48,
            description: profile.tier2_description || ""
          };
        """
      timeout = 10
    } as $deep_dive
  }

  response = {
      "quick_consult": $quick_consult,
      "deep_dive": $deep_dive
  }
}