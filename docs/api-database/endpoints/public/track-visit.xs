query "marketing/public/track-visit" verb=POST {
  input {
    text expert_handle filters=trim
    text utm_source filters=trim
    text utm_campaign filters=trim
    text utm_medium? filters=trim
    text utm_content? filters=trim
  }

  stack {
    // RATE LIMITING: Get visitor IP address and hash it
    api.lambda {
      code = """
        // Get IP from headers (Cloudflare CF-Connecting-IP or X-Forwarded-For)
        var ip = 'unknown'

        // Try Cloudflare's CF-Connecting-IP header first
        if ($env.request && $env.request.headers && $env.request.headers['cf-connecting-ip']) {
          ip = $env.request.headers['cf-connecting-ip']
        }
        // Fallback to X-Forwarded-For
        else if ($env.request && $env.request.headers && $env.request.headers['x-forwarded-for']) {
          ip = $env.request.headers['x-forwarded-for'].split(',')[0].trim()
        }

        // Create a simple hash (not cryptographic, just for deduplication)
        var hash = 0
        for (var i = 0; i < ip.length; i++) {
          var char = ip.charCodeAt(i)
          hash = ((hash << 5) - hash) + char
          hash = hash & hash // Convert to 32-bit integer
        }

        return {
          ip: ip,
          hash: 'ip_' + Math.abs(hash)
        }
      """
      timeout = 5
    } as $ipData

    // RATE LIMITING: Check if IP has exceeded limit (100 requests/hour)
    db.query campaign_visit {
      where = $db.campaign_visit.visitor_ip_hash == $ipData.hash && $db.campaign_visit.visited_at >= "now" - "1 hour"
      return = {type: "list"}
    } as $recentVisits

    // RATE LIMITING: Block if too many requests
    api.lambda {
      code = """
        var count = $var.recentVisits ? $var.recentVisits.length : 0
        return count
      """
      timeout = 5
    } as $visitCount

    conditional {
      if ($visitCount >= 100) {
        debug.stop {
          value = "429 error \"Rate limit exceeded - Maximum 100 visits per hour per IP\""
        }
      }
    }

    db.get expert_profile {
      field_name = "handle"
      field_value = $input.expert_handle
    } as $expertProfiles
  
    conditional {
      if ($expertProfiles != null) {
      }
    
      else {
        return {
          value = {
            "tracked": false,
            "reason": "Expert not found"
          }
        }
      }
    }
  
    db.query utm_campaign {
      where = $db.utm_campaign.expert_profile_id == $expertProfiles.id && $db.utm_campaign.utm_source == $input.utm_source && $db.utm_campaign.utm_campaign == $input.utm_campaign
      return = {type: "single"}
    } as $existingCampaigns
  
    conditional {
      if ($existingCampaigns == null) {
        db.add utm_campaign {
          data = {
            created_at         : "now"
            updated_at         : "now"
            last_visit_at      : ""
            name               : ""
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
            expert_profile_id  : $expertProfiles.id
          }
        } as $newCampaign
      
        api.lambda {
          code = """
              var camp = $var.newCampaign
              if (camp && camp.id) {
                return camp.id
              }
              return 0
            """
          timeout = 10
        } as $finalCampaignId
      }
    
      else {
        api.lambda {
          code = " return $var.existingCampaigns.id"
          timeout = 10
        } as $finalCampaignId
      }
    }
  
    // Use the already-calculated IP hash from rate limiting step
    api.lambda {
      code = """
        // Default values (could be enhanced with request headers in future)
        var deviceType = 'desktop'
        var country = 'XX'
        var userAgent = 'unknown'

        // Try to get user agent from request headers
        if ($env.request && $env.request.headers && $env.request.headers['user-agent']) {
          userAgent = $env.request.headers['user-agent']
        }

        var result = {
          visitor_ip_hash: $var.ipData.hash,
          device_type: deviceType,
          country: country,
          user_agent: userAgent
        }

        return result
      """
      timeout = 10
    } as $visitorData
  
    db.add campaign_visit {
      data = {
        created_at           : "now"
        campaign_id          : $finalCampaignId
        expert_profile_id    : $expertProfiles.id
        visitor_ip_hash      : $visitorData.visitor_ip_hash
        user_agent           : $visitorData.user_agent
        country              : $visitorData.country
        converted_to_question: false
        question_id          : null
        visited_at           : "now"
        device_type          : $visitorData.device_type
      }
    } as $visit
  
    db.get utm_campaign {
      field_name = "utm_campaign"
      field_value = $input.utm_campaign
    } as $campaign
  
    function.run update_campaign_metrics {
      input = {campaign_id: $campaign.id}
    } as $updated_campaign
  }

  response = {
    "tracked": true,
    "campaign_id": $var.finalCampaignId,
    "visit_id": $var.visit.id
  }
}