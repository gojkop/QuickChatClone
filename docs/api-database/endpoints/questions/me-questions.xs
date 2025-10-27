query "me/questions" verb=GET {
  auth = "user"

  input {
    text status? filters=trim
    text filter_type? filters=trim
    text sort_by? filters=trim
    text search? filters=trim
    int page?
    int per_page?
    int price_min?
    int price_max?
  }

  stack {
    var $authUser {
      value = $auth.id
    }
  
    var $filterType {
      value = $input.filter_type
    }
  
    var $statusFilter {
      value = $input.status
    }
  
    var $sortBy {
      value = $input.sort_by
    }
  
    var $pageNum {
      value = $input.page
    }
  
    var $perPageNum {
      value = $input.per_page
    }
  
    var $priceMin {
      value = $input.price_min
    }
  
    var $priceMax {
      value = $input.price_max
    }
  
    var $searchQuery {
      value = $input.search
    }
  
    db.get expert_profile {
      field_name = "user_id"
      field_value = $auth.id
    } as $expertProfile
  
    conditional {
      if ($expertProfile != null) {
        db.query question {
          where = $db.question.expert_profile_id == $expertProfile.id
          sort = {question.created_at: "desc"}
          return = {type: "list"}
        } as $allQuestions
      
        api.lambda {
          code = """
              var questions = $var.allQuestions || [];
            
              // Access input parameters via $var
              var filterType = $var.filterType || null;
              var statusFilter = $var.statusFilter || null;
              var sortBy = $var.sortBy || 'date_new';
              var page = $var.pageNum || 1;
              var perPage = $var.perPageNum || 10;
              var priceMin = $var.priceMin || null;
              var priceMax = $var.priceMax || null;
              var searchQuery = $var.searchQuery || null;
            
              // Validate inputs
              if (page < 1) page = 1;
              if (perPage < 1) perPage = 10;
              if (perPage > 100) perPage = 100;
            
              // STEP 1: Apply filter based on filter_type
              var filtered = questions;
            
              if (filterType === 'pending') {
                filtered = questions.filter(function(q) {
                  var isUnanswered = q.status === 'paid' && !q.answered_at;
                  var isNotPendingOffer = q.pricing_status !== 'offer_pending';
                  var isNotDeclined = q.pricing_status !== 'offer_declined' && q.status !== 'declined';
                  var isNotHidden = q.hidden !== true;
                  return isUnanswered && isNotPendingOffer && isNotDeclined && isNotHidden;
                });
              } else if (filterType === 'answered') {
                filtered = questions.filter(function(q) {
                  return q.answered_at || q.status === 'answered' || q.status === 'closed';
                });
              } else if (filterType === 'all') {
                filtered = questions.filter(function(q) {
                  return q.pricing_status !== 'offer_pending';
                });
              } else if (statusFilter) {
                filtered = questions.filter(function(q) {
                  return q.status === statusFilter;
                });
              }
            
              // STEP 2: Apply price range filter
              if (priceMin !== null || priceMax !== null) {
                filtered = filtered.filter(function(q) {
                  var price = q.final_price_cents || q.price_cents || 0;
                  var priceDollars = price / 100;
            
                  if (priceMin !== null && priceDollars < priceMin) {
                    return false;
                  }
                  if (priceMax !== null && priceDollars > priceMax) {
                    return false;
                  }
                  return true;
                });
              }
            
              // STEP 3: Apply search filter
              if (searchQuery && searchQuery.trim() !== '') {
                var query = searchQuery.toLowerCase().trim();
                filtered = filtered.filter(function(q) {
                  var title = (q.title || '').toLowerCase();
                  var text = (q.text || '').toLowerCase();
                  var questionText = (q.question_text || '').toLowerCase();
                  var userName = (q.user_name || '').toLowerCase();
                  var payerName = ((q.payer_first_name || '') + ' ' + (q.payer_last_name || '')).toLowerCase();
                  var payerEmail = (q.payer_email || '').toLowerCase();

                  return title.indexOf(query) !== -1 ||
                         text.indexOf(query) !== -1 ||
                         questionText.indexOf(query) !== -1 ||
                         userName.indexOf(query) !== -1 ||
                         payerName.indexOf(query) !== -1 ||
                         payerEmail.indexOf(query) !== -1;
                });
              }
            
              // STEP 4: Apply sorting BEFORE pagination
              var sorted = filtered.slice(); // Create a copy to sort
            
              // Helper function to calculate remaining time
              var getRemainingTime = function(q) {
                if (!q.sla_hours_snapshot || q.sla_hours_snapshot <= 0) {
                  return 999999999; // Infinity
                }
                var now = Date.now() / 1000;
                var createdAtSeconds = q.created_at > 4102444800 ? q.created_at / 1000 : q.created_at;
                var elapsed = now - createdAtSeconds;
                var slaSeconds = q.sla_hours_snapshot * 3600;
                var remaining = slaSeconds - elapsed;
                return remaining;
              };
            
              if (sortBy === 'time_left') {
                // Sort by remaining SLA time (urgent first)
                sorted.sort(function(a, b) {
                  var isPendingA = a.status === 'paid' && !a.answered_at;
                  var isPendingB = b.status === 'paid' && !b.answered_at;
            
                  if (isPendingA && isPendingB) {
                    return getRemainingTime(a) - getRemainingTime(b);
                  }
                  return 0;
                });
              } else if (sortBy === 'price_high') {
                // Sort by price (high to low)
                sorted.sort(function(a, b) {
                  return (b.price_cents || 0) - (a.price_cents || 0);
                });
              } else if (sortBy === 'price_low') {
                // Sort by price (low to high)
                sorted.sort(function(a, b) {
                  return (a.price_cents || 0) - (b.price_cents || 0);
                });
              } else if (sortBy === 'date_new') {
                // Sort by created_at (newest first)
                sorted.sort(function(a, b) {
                  return b.created_at - a.created_at;
                });
              } else if (sortBy === 'date_old') {
                // Sort by created_at (oldest first)
                sorted.sort(function(a, b) {
                  return a.created_at - b.created_at;
                });
              }
            
              // STEP 5: Calculate pagination
              var total = sorted.length;
              var totalPages = Math.ceil(total / perPage);
              var offset = (page - 1) * perPage;
              var paginatedQuestions = sorted.slice(offset, offset + perPage);
            
              // STEP 6: Transform questions
              var result = paginatedQuestions.map(function(q) {
                return {
                  id: q.id,
                  expert_profile_id: q.expert_profile_id,
                  user_id: q.user_id,
                  text: q.text,
                  question_text: q.question_text,
                  question_details: q.question_details,
                  title: q.title,
                  status: q.status,
                  pricing_status: q.pricing_status,
                  media_asset_id: q.media_asset_id,
                  created_at: q.created_at,
                  answered_at: q.answered_at,
                  price_cents: q.price_cents,
                  final_price_cents: q.final_price_cents,
                  proposed_price_cents: q.proposed_price_cents,
                  question_tier: q.question_tier,
                  sla_hours_snapshot: q.sla_hours_snapshot,
                  hidden: q.hidden,
                  user_name: q.user_name,
                  user_email: q.user_email,
                  payer_first_name: q.payer_first_name,
                  payer_last_name: q.payer_last_name,
                  payer_email: q.payer_email,
                  attachments: q.attachments,
                  asker_message: q.asker_message,
                  playback_token_hash: q.playback_token_hash,
                  offer_expires_at: q.offer_expires_at,
                  has_recording: q.media_asset_id != null && q.media_asset_id > 0
                };
              });
            
              return {
                questions: result,
                pagination: {
                  page: page,
                  per_page: perPage,
                  total: total,
                  total_pages: totalPages,
                  has_next: page < totalPages,
                  has_prev: page > 1
                }
              };
            """
          timeout = 15
        } as $result
      
        return {
          value = $result
        }
      }
    }
  }

  response = $result
}