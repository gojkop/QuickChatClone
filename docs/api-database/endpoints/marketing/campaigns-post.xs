query "marketing/campaigns" verb=POST {
  auth = "user"

  input {
    text name filters=trim
    text utm_source filters=trim
    text utm_medium? filters=trim
    text utm_content? filters=trim
    text utm_campaign filters=trim
  }

  stack {
    var $authUser {
      value = $auth.id
    }
  
    db.get expert_profile {
      field_name = "user_id"
      field_value = $authUser
    } as $expertProfile
  
    conditional {
      if ($expertProfile != null) {
      }
    
      else {
        return {
          value = {
            "error": "Expert profile not found",
            "status": 404
          }
        }
      }
    }
  
    db.query utm_campaign {
      where = $db.utm_campaign.expert_profile_id == $expertProfile.id && $input.utm_source == $input.utm_source && $db.utm_campaign.utm_campaign == $input.utm_campaign
      return = {type: "single"}
    } as $existingCampaigns
  
    conditional {
      if ($existingCampaigns != null) {
        return {
          value = {
            "error": "Campaign with this source and campaign ID already exists",
            "status": 409
          }
        }
      }
    }
  
    db.add utm_campaign {
      data = {
        created_at         : "now"
        updated_at         : "now"
        last_visit_at      : ""
        name               : $input.name
        url_slug           : ""
        utm_source         : $input.utm_source
        utm_medium         : $input.utm_medium
        utm_campaign       : $input.utm_campaign
        utm_content        : $input.utm_content
        utm_term           : ""
        total_visits       : 0
        total_questions    : 0
        total_revenue_cents: 0
        conversion_rate    : 0
        status             : "active"
        expert_profile_id  : $expertProfile.id
      }
    } as $campaign
  
    api.lambda {
      code = """
        /**
         * NPM Module Imports in Deno Runtime
         * ---------------------------------
         * 
         * Basic Import Example:
         *   const { createClientAsync } = await import("npm:soap@1.1.7");
         * 
         * Note: When importing modules, we automatically attempt to resolve types.
         * However, types may not be available for all modules.
         * 
         * Best Practices:
         * - Always use exact versions to prevent breaking changes
         * 
         * CommonJS Module Imports:
         * 1. Recommended (type-safe):
         *    const { default: Handlebars } = await import('npm:handlebars');
         * 
         * 2. Alternative (not type-safe):
         *    const Handlebars = require('handlebars');
         * 
         * File System Operations:
         * ----------------------
         * Example - Writing to a file:
         *   await Deno.writeTextFile("/tmp/output.txt", "Hello, world!");
         */
        
        var APP_URL = $env.APP_URL || 'https://mindpick.me'
          var handle = $var.expertProfile.handle
        
          var params = '?utm_source=' + $var.campaign.utm_source + '&utm_campaign=' + $var.campaign.utm_campaign
          if ($var.campaign.utm_medium) params += '&utm_medium=' + $var.campaign.utm_medium
          if ($var.campaign.utm_content) params += '&utm_content=' + $var.campaign.utm_content
        
          var url = APP_URL + '/u/' + handle + params
        
          return {
            id: $var.campaign.id,
            name: $var.campaign.name,
            utm_source: $var.campaign.utm_source,
            utm_campaign: $var.campaign.utm_campaign,
            utm_medium: $var.campaign.utm_medium,
            utm_content: $var.campaign.utm_content,
            url: url,
            total_visits: 0,
            total_questions: 0,
            total_revenue: 0,
            conversion_rate: 0,
            status: $var.campaign.status,
            created_at: $var.campaign.created_at
          }
        """
      timeout = 10
    } as $lambda
  }

  response = $lambda
}