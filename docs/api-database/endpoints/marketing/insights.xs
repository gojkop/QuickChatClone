query "marketing/insights" verb=GET {
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
  
    db.query question {
      where = $db.question.expert_profile_id == $expertProfile.id
      return = {type: "list"}
    } as $questions
  
    db.query campaign_visit {
      where = $db.campaign_visit.expert_profile_id == $expertProfile.id
      return = {type: "list"}
    } as $visits
  
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
        
        var visitsList = $var.visits
          var questionsList = $var.questions
          var expert = $var.expertProfile
        
          var totalVisits = visitsList.length
          var totalQuestions = questionsList.length
        
          var conversionRate = 0
          if (totalVisits > 0) {
            conversionRate = (totalQuestions / totalVisits) * 100
          }
        
          // Platform average (hardcoded)
          var platformAverage = 3.2
        
          // Generate insights
          var insights = []
        
          if (conversionRate < platformAverage) {
            var insight = {
              severity: 'high',
              title: 'Low conversion rate',
              issue: 'Only ' + conversionRate.toFixed(1) + ' percent of visitors ask questions. Platform average is ' + platformAverage + ' percent.',
              recommendations: ['Add testimonials to your profile', 'Consider reducing your price by 15-20 percent', 'Make your specialization more specific', 'Add a short intro video']
            }
            insights.push(insight)
          }
        
          if (conversionRate > 4.5) {
            var percentAbove = ((conversionRate / platformAverage - 1) * 100).toFixed(0)
            var currentPrice = expert.price_cents / 100
            var suggestedPrice = Math.round(currentPrice * 1.2)
        
            var successInsight = {
              severity: 'success',
              title: 'You are in the top 20 percent of experts',
              issue: null,
              recommendations: ['Your conversion rate is ' + percentAbove + ' percent above platform average', 'Consider raising your price to ' + suggestedPrice + ' euros', 'Share your success story in our community']
            }
            insights.push(successInsight)
          }
        
          var result = {
            your_metrics: {
              visit_to_question: parseFloat(conversionRate.toFixed(2)),
              total_visits: totalVisits,
              total_questions: totalQuestions
            },
            platform_average: {
              visit_to_question: platformAverage
            },
            insights: insights
          }
        
          return result
        """
      timeout = 10
    } as $lambda
  }

  response = $lambda
}