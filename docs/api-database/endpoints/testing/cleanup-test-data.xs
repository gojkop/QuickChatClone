query "internal/test-data/cleanup" verb=DELETE {
  input {
    text x_api_key filters=trim
  }

  stack {
    conditional {
      if ($input.x_api_key != $env.XANO_INTERNAL_API_KEY) {
        debug.stop {
          value = "Unauthorized"
        }
      }
    }

    db.query question {
      where = $db.question.payment_intent_id like "pi_test_%"
      return = {type: "list"}
    } as $test_questions

    foreach ($test_questions) {
      each as $tq {

        db.query answer {
          where = $db.answer.question_id == $tq.id
          return = {type: "list"}
        } as $tq_answers

        foreach ($tq_answers) {
          each as $tq_answer {

            conditional {
              if ($tq_answer.media_asset_id != null) {
                db.del media_asset {
                  field_name = "id"
                  field_value = $tq_answer.media_asset_id
                }
              }
            }

            db.del answer {
              field_name = "id"
              field_value = $tq_answer.id
            }
          }
        }

        conditional {
          if ($tq.media_asset_id != null) {
            db.del media_asset {
              field_name = "id"
              field_value = $tq.media_asset_id
            }
          }
        }

        db.query payment_table_structure {
          where = $db.payment_table_structure.question_id == $tq.id
          return = {type: "single"}
        } as $tq_payment

        conditional {
          if ($tq_payment != null) {
            db.del payment_table_structure {
              field_name = "id"
              field_value = $tq_payment.id
            }
          }
        }

        db.del question {
          field_name = "id"
          field_value = $tq.id
        }
      }
    }

    api.lambda {
      code = """
        var count = 0;
        for (var i = 0; i < $var.test_questions.length; i++) {
          count++;
        }
        return count;
      """
      timeout = 10
    } as $deleted_count
  }

  response = {
    "success": true,
    "deleted": {
      "questions": $deleted_count
    },
    "message": "Test data cleanup completed successfully"
  }
}
