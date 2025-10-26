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
      where = $db.question.stripe_payment_intent_id like "pi_test_%"
      return = {type: "list"}
    } as $test_questions

    api.lambda {
      code = """
        var count = 0;
        for (var i = 0; i < $var.test_questions.length; i++) {
          count++;
        }
        return count;
      """
      timeout = 10
    } as $question_count

    foreach ($test_questions) {
      each as $test_question {

        db.query answer {
          where = $db.answer.question_id == $test_question.id
          return = {type: "list"}
        } as $question_answers

        foreach ($question_answers) {
          each as $question_answer {

            conditional {
              if ($question_answer.media_asset_id != null) {
                db.del media_asset {
                  field_name = "id"
                  field_value = $question_answer.media_asset_id
                }
              }
            }

            db.del answer {
              field_name = "id"
              field_value = $question_answer.id
            }
          }
        }

        conditional {
          if ($test_question.media_asset_id != null) {
            db.del media_asset {
              field_name = "id"
              field_value = $test_question.media_asset_id
            }
          }
        }

        db.query payment_table_structure {
          where = $db.payment_table_structure.question_id == $test_question.id
          return = {type: "single"}
        } as $payment_record

        conditional {
          if ($payment_record != null) {
            db.del payment_table_structure {
              field_name = "id"
              field_value = $payment_record.id
            }
          }
        }

        db.del question {
          field_name = "id"
          field_value = $test_question.id
        }
      }
    }
  }

  response = {
    "success": true,
    "deleted": {
      "questions": $question_count
    },
    "message": "Test data cleanup completed"
  }
}
