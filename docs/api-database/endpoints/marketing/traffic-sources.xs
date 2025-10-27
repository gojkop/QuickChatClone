query "marketing/traffic-sources" verb=GET {
  auth = "user"

  input {
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
  
    db.query campaign_visit {
      where = $db.campaign_visit.expert_profile_id == $expertProfile.id
      return = {type: "list"}
    } as $visits
  
    db.query utm_campaign {
      where = $db.utm_campaign.expert_profile_id == $expertProfile.id
      return = {type: "list"}
    } as $campaigns
  
    db.query question {
      where = $db.question.expert_profile_id == $expertProfile.id
      return = {type: "list"}
    } as $questions
  
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
        
        // Build lookup maps
          var campaignMap = {}
          var allCampaigns = $var.campaigns
          for (var i = 0; i < allCampaigns.length; i++) {
            var c = allCampaigns[i]
            campaignMap[c.id] = c
          }
        
          var questionMap = {}
          var allQuestions = $var.questions
          for (var j = 0; j < allQuestions.length; j++) {
            var q = allQuestions[j]
            questionMap[q.id] = q
          }
        
          // Group visits by source
          var sourceMap = {}
          var visitsList = $var.visits
        
          for (var k = 0; k < visitsList.length; k++) {
            var visit = visitsList[k]
            var sourceName = 'direct'
        
            // Look up campaign by campaign_id
            if (visit.campaign_id) {
              var campaign = campaignMap[visit.campaign_id]
              if (campaign && campaign.utm_source) {
                sourceName = campaign.utm_source
              }
            }
        
            // Initialize source entry
            if (!sourceMap[sourceName]) {
              sourceMap[sourceName] = {
                name: sourceName,
                visits: 0,
                questions: 0,
                revenue_cents: 0
              }
            }
        
            // Count visit
            sourceMap[sourceName].visits = sourceMap[sourceName].visits + 1
        
            // Count conversion
            if (visit.converted_to_question && visit.question_id) {
              var question = questionMap[visit.question_id]
              if (question) {
                sourceMap[sourceName].questions = sourceMap[sourceName].questions + 1
                var price = question.price_cents || 0
                sourceMap[sourceName].revenue_cents = sourceMap[sourceName].revenue_cents + price
              }
            }
          }
        
          // Build result array
          var result = []
          for (var sourceName in sourceMap) {
            var src = sourceMap[sourceName]
            var rate = 0
            if (src.visits > 0) {
              rate = (src.questions / src.visits) * 100
            }
        
            result.push({
              name: src.name,
              visits: src.visits,
              questions: src.questions,
              revenue: src.revenue_cents / 100,
              conversion_rate: parseFloat(rate.toFixed(2))
            })
          }
        
          return result
        """
      timeout = 10
    } as $result
  }

  response = $result
}