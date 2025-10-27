query "marketing/campaigns" verb=GET {
  auth = "user"

  input {
  }

  stack {
    var $authUser {
      value = $auth.id
    }
  
    db.query expert_profile {
      where = $db.expert_profile.user_id == $authUser
      return = {type: "single"}
    } as $expertProfiles
  
    conditional {
      if ($expertProfiles != null) {
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
            
              var expert = $var.expertProfiles
              return { expert: expert }
            """
          timeout = 10
        } as $expertData
      }
    
      else {
        return {
          value = ""
        }
      }
    }
  
    db.query utm_campaign {
      where = $db.utm_campaign.expert_profile_id == $expertData.expert.id && $db.utm_campaign.status == "active"
      sort = {utm_campaign.total_revenue_cents: "desc"}
      return = {type: "list"}
    } as $campaigns
  
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
        
        var result = []
          var APP_URL = $env.APP_URL || 'https://mindpick.me'
          var handle = $var.expertData.expert.handle
        
          for (var i = 0; i < $var.campaigns.length; i++) {
            var c = $var.campaigns[i]
        
            // Build UTM parameters
            var params = '?utm_source=' + c.utm_source + '&utm_campaign=' + c.utm_campaign
            if (c.utm_medium) params += '&utm_medium=' + c.utm_medium
            if (c.utm_content) params += '&utm_content=' + c.utm_content
        
            // Build full URL
            var campaignUrl = APP_URL + '/u/' + handle + params
        
            result.push({
              id: c.id,
              name: c.name,
              utm_source: c.utm_source,
              utm_campaign: c.utm_campaign,
              utm_medium: c.utm_medium,
              utm_content: c.utm_content,
              url: campaignUrl,
              total_visits: c.total_visits,
              total_questions: c.total_questions,
              total_revenue: c.total_revenue_cents / 100,
              conversion_rate: c.conversion_rate,
              status: c.status,
              created_at: c.created_at
            })
          }
        return result
        """
      timeout = 10
    } as $result
  }

  response = $result
}