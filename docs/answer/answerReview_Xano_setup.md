Xano Complete Setup Guide
Answer Review Page Feature - Detailed Instructions

📋 OVERVIEW
You will create 4 things in Xano:

✅ Function: generate_playback_token - Creates random secure tokens
✅ Endpoint: GET /review/{token} - Fetches question/answer data for public view
✅ Update: Question creation flow - Add token generation & send email
✅ Update: Answer creation flow - Send notification email

Estimated Time: 60-90 minutes

PART 1: Create Token Generation Function
Step 1.1: Open Functions Panel

Log into your Xano workspace
In the left sidebar, click "Functions"
Click "+ Add Function" (blue button, top right)

Step 1.2: Configure Function Settings
In the popup that appears:
FieldValueNamegenerate_playback_tokenDescriptionGenerates a secure random token for playback linksAuthenticationNone (uncheck any auth)
Click "Create"
Step 1.3: Build Function Logic
You should now see the Function Stack builder. Follow these steps:
Action 1: Add randomString Function

Click "+ Add a step"
In the search, type: randomString
Select "randomString" (under Built-in functions)

Configure the randomString step:
FieldValueNotesLength32Enter the number 32CharactersalphanumericSelect from dropdownOutput VariabletokenThis stores the result
Click "Save"
Action 2: Add Response

Click "+ Add a step" again
Select "Response" (under Flow Control)

Configure the Response:
FieldValueStatus Code200Response BodyClick into the field, then click {} Variables and select token
Click "Save"
Step 1.4: Test the Function

Click "Run & Debug" (top right, play button icon)
Click "Run"
You should see output like: "k3J8nP2qR5vT9wX4bZ7cM1gH6dS0fY8a"

✅ Success! If you see a 32-character random string, your function works!

Click "Save" (top right)
Click "Publish All" to make it available


PART 2: Create Review Endpoint
Step 2.1: Create New API Endpoint

In left sidebar, click "API"
Find your API group (likely named after your project)
Click "Add API Endpoint"

Step 2.2: Configure Endpoint Settings
In the configuration panel:
FieldValueMethodGETPath/review/{token}DescriptionGet question and answer data for review pageAuthenticationNone ⚠️ Important: Uncheck any authenticationPublic✅ Check this box
Step 2.3: Add Input Parameter

Scroll to "Inputs" section
Click "+ Add Input"

Configure input:
FieldValueNametokenTypetextSourcePath (select from dropdown)Required✅ Check this
Click "Save Input"
Step 2.4: Build Function Stack
Now you'll build the logic for this endpoint.
Stack Step 1: Query Question Record

Click "Function Stack" tab
Click "+ Add a step"
Select "Query Single Record" (under Database)

Configure the query:
FieldValueTablequestionFilterClick "+ Add Filter"Filter Fieldplayback_token_hashOperator= (equals)ValueClick {} Variables → Select token (from input)
Include Related Records (IMPORTANT):
Click "Include Relations" and check these boxes:
☑ media_asset (question's video)
☑ answer
  ☑ answer.media_asset (answer's video)
☑ expert_profile
  ☑ expert_profile.user
Output:
FieldValueVariable Namequestion
Click "Save"
Stack Step 2: Add Conditional - Check if Question Exists

Click "+ Add a step"
Select "Conditional" (under Flow Control)

Configure:
FieldValueConditionClick field → Select question → Click "Is empty"
This checks if no question was found with that token.
Click "Save"
Stack Step 3: Inside the "If" branch - Return 404
You should now see an "If" and "Else" branch.

Under the "If TRUE" branch, click "+ Add a step"
Select "Response"

Configure:
FieldValueStatus Code404Response BodyType manually: {"error": "Question not found"}
Click "Save"
Stack Step 4: Add Filter (Security Step)
This removes sensitive expert data before sending to frontend.

Click "+ Add a step" (after the conditional, not inside it)
Select "Filter" (under Data Manipulation)

Configure:
FieldValueInputClick {} Variables → Select question
Remove Fields:
Click "+ Remove Field" multiple times and add these paths:
expert_profile.user.email
expert_profile.user.password
expert_profile.user.auth_provider
expert_profile.user.auth_provider_id
expert_profile.user.google_oauth
expert_profile.user.google_oauth_id
expert_profile.user.google_oauth_name
expert_profile.user.google_oauth_email
Output:
FieldValueVariable Namefiltered_question
Click "Save"
Stack Step 5: Return Success Response

Click "+ Add a step"
Select "Response"

Configure:
FieldValueStatus Code200Response BodyClick {} Variables → Select filtered_question
Click "Save"
Step 2.5: Test the Endpoint

Click "Run & Debug" (top right)
You need a real token from your database. Two options:

Option A: Create a test token manually

Go to Database → question table
Find any question record
Manually add a test token like test_token_12345 to playback_token_hash field
Use this in the test

Option B: Run the generate function first

Go back to your generate_playback_token function
Run it to get a token
Update a question record with that token
Use it here


Enter the token value in the "Input" section
Click "Run"

Expected Success Response:
json{
  "id": 123,
  "title": "Question title",
  "text": "Question text",
  "created_at": "2025-10-01T10:00:00Z",
  "playback_token_hash": "your_token",
  "price_cents": 7500,
  "currency": "EUR",
  "status": "paid",
  "sla_hours_snapshot": 48,
  "media_asset": {
    "url": "https://...",
    "provider": "cloudflare_stream"
  },
  "answer": null,
  "expert_profile": {
    "handle": "expert_handle",
    "professional_title": "Expert Title",
    "user": {
      "name": "Expert Name"
    }
  }
}
Test with invalid token:

Change token to invalid_token_999
Click "Run"
Should get: {"error": "Question not found"} with 404 status

✅ Success! If both tests work, you're done with this endpoint!

Click "Save" (top right)
Click "Publish All"


PART 3: Update Question Creation Flow
You need to find your existing endpoint that creates questions (usually called after Stripe payment confirms).
Step 3.1: Find Your Question Creation Endpoint

Click "API" in left sidebar
Look for endpoints like:

POST /question
POST /create-question
Or in a Stripe webhook endpoint


Find where status is set to "paid" after payment confirmation

Step 3.2: Add New Steps to Function Stack
You'll add these steps AFTER the question is created and payment is confirmed.
New Step A: Generate Playback Token

In the function stack, find where you update question status to "paid"
AFTER that step, click "+ Add a step"
Select "Run Function" (under Functions)

Configure:
FieldValueFunctionSelect generate_playback_token from dropdownOutput Variableplayback_token
Click "Save"
New Step B: Update Question with Token

Click "+ Add a step"
Select "Edit Record" (under Database)

Configure:
FieldValueTablequestionRecord to UpdateClick {} Variables → Select your question variable (might be question, created_question, or question_id)
Fields to Update:
Click "+ Add Field" for each:
Field NameValueplayback_token_hash{} Variables → playback_tokenstatusType: "paid" (if not already set)paid_atClick "f(x)" → Select NOW()
Click "Save"
New Step C: Build Playback URL

Click "+ Add a step"
Select "Set Variable" (under Variables)

Configure:
FieldValueVariable Nameplayback_urlValueClick into field, then type:<br>https://yourapp.vercel.app/r/<br>Then click {} Variables → Select playback_token<br>Result should look like: https://yourapp.vercel.app/r/{playback_token}
⚠️ Important: Replace yourapp.vercel.app with your actual domain!
Click "Save"
New Step D: Format Price

Click "+ Add a step"
Select "Set Variable"

Configure:
FieldValueVariable Nameprice_formattedValueClick "f(x)" button and enter this expression:<br>(question.currency == "USD" ? "$" : "€") + " " + (question.price_cents / 100).toFixed(2)
This converts cents to dollars/euros (e.g., 7500 → €75.00)
Click "Save"
New Step E: Send Email to Asker

Click "+ Add a step"
Select "Send Email" (under External Requests)

⚠️ Before this works, you must configure email in Xano:

Go to Settings → Integrations → Email
Connect Sendgrid, Resend, AWS SES, or SMTP
If not set up yet, skip this step for now and come back after email is configured

Configure:
FieldValueTo{} Variables → question.payer_emailFrom"QuickChat" <noreply@yourdomain.com>SubjectType: Your question to  then {} Variables → expert_profile.user.name then type  - QuickChatEmail TypeSelect HTMLHTML BodySee template below ⬇️
HTML Email Template (Question Created):
html<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">💬 Question Submitted!</h1>
  </div>
  
  <div style="background: #F8FAFC; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
    <h2 style="color: #1E293B; margin-top: 0;">Hi there!</h2>
    <p style="color: #475569; font-size: 16px;">
      Your question has been submitted to <strong>{expert_profile.user.name}</strong> and payment of <strong>{price_formatted}</strong> has been confirmed.
    </p>
    <p style="color: #64748B; font-style: italic;">"{question.title}"</p>
  </div>

  <div style="background: #FEF3C7; border-left: 4px solid #F59E0B; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
    <p style="color: #92400E; margin: 0;">
      <strong>⏱️ Expected Response:</strong> Within {question.sla_hours_snapshot} hours
    </p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{playback_url}" style="display: inline-block; background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600;">
      View Your Question & Answer
    </a>
  </div>

  <div style="background: #F1F5F9; padding: 20px; border-radius: 8px;">
    <h3 style="color: #1E293B; margin-top: 0;">What happens next?</h3>
    <ol style="color: #475569; padding-left: 20px;">
      <li>You'll receive an email when your answer is ready</li>
      <li>Access your answer anytime using the link above</li>
      <li>If no answer within {question.sla_hours_snapshot} hours, automatic refund</li>
    </ol>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
    <p style="color: #94A3B8; font-size: 14px;">Powered by <strong style="color: #4F46E5;">QuickChat</strong></p>
  </div>
</body>
</html>
⚠️ Note: Replace {variable_name} with actual Xano variable references by clicking {} Variables button when entering the HTML.
Click "Save"
Step 3.3: Test the Updated Flow

Click "Run & Debug"
Use test data for a question creation
Check that:

✅ Token is generated
✅ Question is updated with token
✅ Playback URL is built correctly
✅ Email is sent (check your email)


Click "Save" and "Publish All"


PART 4: Update Answer Creation Flow
Now you'll add email notification when an expert submits an answer.
Step 4.1: Find Your Answer Creation Endpoint

Click "API" in left sidebar
Look for endpoints like:

POST /answer
POST /create-answer
POST /submit-answer


Open the endpoint where answers are created

Step 4.2: Add New Steps to Function Stack
Add these steps AFTER the answer record is created.
New Step A: Get Question with Relations

In the function stack, AFTER answer creation, click "+ Add a step"
Select "Query Single Record" (under Database)

Configure:
FieldValueTablequestionFilterid = {} Variables → answer.question_id (or however you reference it)
Include Relations:
Check these boxes:
☑ expert_profile
  ☑ expert_profile.user
Output Variable: question
Click "Save"
New Step B: Update Question Status

Click "+ Add a step"
Select "Edit Record" (under Database)

Configure:
FieldValueTablequestionRecord to Update{} Variables → question
Fields to Update:
Field NameValueanswered_atf(x) → NOW()statusType: "answered"
Click "Save"
New Step C: Build Playback URL

Click "+ Add a step"
Select "Set Variable"

Configure:
FieldValueVariable Nameplayback_urlValueType: https://yourapp.vercel.app/r/ then {} Variables → question.playback_token_hash
Click "Save"
New Step D: Send Email Notification

Click "+ Add a step"
Select "Send Email"

Configure:
FieldValueTo{} Variables → question.payer_emailFrom"QuickChat" <noreply@yourdomain.com>SubjectType: ✅ Your answer from  then {} Variables → question.expert_profile.user.name then type  is ready!Email TypeHTMLHTML BodySee template below ⬇️
HTML Email Template (Answer Ready):
html<!DOCTYPE html>
<html>
<body style="font-family: -apple-system, sans-serif; line-height: 1.6; color: #334155; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 30px;">
    <h1 style="color: white; margin: 0; font-size: 28px;">✅ Your Answer is Ready!</h1>
  </div>
  
  <div style="background: #F8FAFC; padding: 25px; border-radius: 12px; margin-bottom: 25px;">
    <h2 style="color: #1E293B; margin-top: 0;">Great news!</h2>
    <p style="color: #475569; font-size: 16px;">
      <strong>{question.expert_profile.user.name}</strong> has recorded an answer to your question.
    </p>
    <p style="color: #64748B; font-style: italic;">"{question.title}"</p>
  </div>

  <div style="text-align: center; margin: 30px 0;">
    <a href="{playback_url}" style="display: inline-block; background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 16px 32px; border-radius: 50px; text-decoration: none; font-weight: 600; font-size: 18px;">
      Watch Your Answer Now
    </a>
  </div>

  <div style="background: #DBEAFE; padding: 20px; border-radius: 8px; text-align: center;">
    <p style="color: #1E40AF; margin: 0; font-size: 14px;">
      💡 Have a follow-up question? You can ask another question at the same link.
    </p>
  </div>
  
  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #E2E8F0;">
    <p style="color: #94A3B8; font-size: 14px;">Powered by <strong style="color: #4F46E5;">QuickChat</strong></p>
  </div>
</body>
</html>
Click "Save"
Step 4.3: Test the Updated Flow

Click "Run & Debug"
Use test data for answer creation
Check that:

✅ Question is updated with answered_at timestamp
✅ Status changes to "answered"
✅ Email is sent with playback URL
✅ Playback URL contains correct token


Click "Save" and "Publish All"