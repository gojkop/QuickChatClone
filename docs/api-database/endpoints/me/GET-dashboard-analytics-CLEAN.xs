query "me/dashboard-analytics" verb=GET {
  auth = "user"

  input {
  }

  stack {
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expert_profile

    conditional {
      if ($expert_profile == null) {
        debug.stop {
          value = '404 error "Expert profile not found"'
        }
      }
    }

    api.lambda {
      code = """
        var now = Date.now();
        var nowSeconds = Math.floor(now / 1000);
        var currentDate = new Date();
        var monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        var monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0, 23, 59, 59, 999);
        var monthStartSeconds = Math.floor(monthStart.getTime() / 1000);
        var monthEndSeconds = Math.floor(monthEnd.getTime() / 1000);

        return {
          nowSeconds: nowSeconds,
          monthStartSeconds: monthStartSeconds,
          monthEndSeconds: monthEndSeconds
        };
      """
      timeout = 10
    } as $timestamps

    db.query question {
      where = $db.question.expert_profile_id == $expert_profile.id
      return = {type: "list"}
    } as $all_questions

    api.lambda {
      code = """
        var questions = $var.all_questions || [];
        var nowSeconds = $var.timestamps.nowSeconds;
        var monthStartSeconds = $var.timestamps.monthStartSeconds;
        var monthEndSeconds = $var.timestamps.monthEndSeconds;
        var thisMonthRevenueCents = 0;
        var totalResponseTimeHours = 0;
        var responseTimeCount = 0;
        var totalRating = 0;
        var ratingCount = 0;
        var urgentCount = 0;
        var pendingCount = 0;
        var answeredCount = 0;
        var thisMonthAnsweredCount = 0;
        var slaComplianceCount = 0;
        for (var i = 0; i < questions.length; i++) {
          var q = $var.all_questions[i];
          var created = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
          var answered = q.answered_at && q.answered_at > 4102444800 ? q.answered_at / 1000 : q.answered_at;
          var isAnswered = !!answered;
          var isPending = q.status === 'paid' && !answered && q.pricing_status !== 'offer_declined';
          if (isAnswered) {
            answeredCount++;
            if (answered >= monthStartSeconds && answered <= monthEndSeconds) {
              thisMonthRevenueCents += (q.price_cents || 0);
              thisMonthAnsweredCount++;
            }
            if (created && answered) {
              var responseHours = (answered - created) / 3600;
              totalResponseTimeHours += responseHours;
              responseTimeCount++;
              var slaHours = q.sla_hours_snapshot || 24;
              if (responseHours <= slaHours) {
                slaComplianceCount++;
              }
            }
            if (q.rating && q.rating > 0) {
              totalRating += q.rating;
              ratingCount++;
            }
          }
          if (isPending) {
            pendingCount++;
            var hoursSinceCreated = (nowSeconds - created) / 3600;
            var slaHours = q.sla_hours_snapshot || 24;
            var hoursRemaining = slaHours - hoursSinceCreated;
            if (hoursRemaining < 2 && hoursRemaining > 0) {
              urgentCount++;
            }
          }
        }
        var avgResponseTime = responseTimeCount > 0 ? parseFloat((totalResponseTimeHours / responseTimeCount).toFixed(2)) : 0;
        var avgRating = ratingCount > 0 ? parseFloat((totalRating / ratingCount).toFixed(1)) : 0;
        var avgRevenuePerQuestion = thisMonthAnsweredCount > 0 ? parseFloat((thisMonthRevenueCents / 100 / thisMonthAnsweredCount).toFixed(2)) : 0;
        var slaComplianceRate = answeredCount > 0 ? parseFloat(((slaComplianceCount / answeredCount) * 100).toFixed(1)) : 0;
        var thisMonthRevenue = parseFloat((thisMonthRevenueCents / 100).toFixed(2));

        return {
          thisMonthRevenue: thisMonthRevenue,
          avgResponseTime: avgResponseTime,
          avgRating: avgRating,
          urgentCount: urgentCount,
          pendingCount: pendingCount,
          answeredCount: answeredCount,
          thisMonthAnsweredCount: thisMonthAnsweredCount,
          avgRevenuePerQuestion: avgRevenuePerQuestion,
          slaComplianceRate: slaComplianceRate,
          totalQuestions: questions.length
        };
      """
      timeout = 10
    } as $metrics
  }

  response = {
    "thisMonthRevenue": $metrics.thisMonthRevenue,
    "avgResponseTime": $metrics.avgResponseTime,
    "avgRating": $metrics.avgRating,
    "urgentCount": $metrics.urgentCount,
    "pendingCount": $metrics.pendingCount,
    "answeredCount": $metrics.answeredCount,
    "thisMonthAnsweredCount": $metrics.thisMonthAnsweredCount,
    "avgRevenuePerQuestion": $metrics.avgRevenuePerQuestion,
    "slaComplianceRate": $metrics.slaComplianceRate,
    "revenueChange": 0,
    "totalQuestions": $metrics.totalQuestions
  }
}
