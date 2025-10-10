# Xano Free Tier - LinkedIn OAuth Setup Guide

## 📋 Prerequisites
- Xano Free account at [app.xano.com](https://app.xano.com)
- LinkedIn Developer account at [developer.linkedin.com](https://developer.linkedin.com/)
- Your QuickChat application deployed

---

## 🎯 Step-by-Step Setup for Xano Free

### PART 1: Create LinkedIn App

#### 1. Go to LinkedIn Developer Portal
1. Visit https://developer.linkedin.com/
2. Click **"Create app"**
3. Fill in the details:
   - **App name**: QuickChat (or your app name)
   - **LinkedIn Page**: Select or create a company page
   - **App logo**: Upload your logo (optional)
   - **Legal agreement**: Check the box

#### 2. Configure OAuth Settings
1. In your LinkedIn app, go to **"Auth"** tab
2. Under **"OAuth 2.0 settings"**:
   - Add **Authorized redirect URLs**:
     ```
     https://yourdomain.com/auth/callback
     http://localhost:3000/auth/callback
     ```
3. Under **"OAuth 2.0 scopes"**, request:
   - ✅ `r_liteprofile` (Read profile information)
   - ✅ `r_emailaddress` (Read email address)
   - ✅ `w_member_social` (Post on behalf)

#### 3. Get Your Credentials
1. Go to **"Auth"** tab
2. Copy your:
   - **Client ID** (save this)
   - **Client Secret** (click "Show" and save this)

---

### PART 2: Configure Xano Free

#### Option A: Using Xano's Built-in OAuth (If Available)

1. **Login to Xano**
   - Go to https://app.xano.com
   - Select your workspace

2. **Navigate to Authentication**
   - Click **"Authentication"** in left sidebar (lock icon)
   - Click **"Add Authentication"**
   - Select **"Social Auth"** or **"External OAuth"**

3. **Add LinkedIn Provider**
   - Provider: **LinkedIn**
   - Client ID: `[paste your LinkedIn Client ID]`
   - Client Secret: `[paste your LinkedIn Client Secret]`
   - Scopes: `r_liteprofile r_emailaddress w_member_social`
   - Callback URL: `https://yourdomain.com/auth/callback`

4. **Configure User Mapping**
   - Map LinkedIn fields to your user table:
     - `email` → user.email
     - `id` → user.linkedin_id
     - `firstName` → user.first_name
     - `lastName` → user.last_name

---

#### Option B: Manual OAuth Setup (If Built-in Not Available)

If Xano Free doesn't have built-in LinkedIn OAuth, you'll need to create custom endpoints:

### Step 1: Create OAuth Endpoints in Xano

1. **Go to API Section**
   - Click **"API"** in left sidebar
   - Create new API Group: **"oauth"**

2. **Create Init Endpoint**
   - Click **"Add API Endpoint"**
   - Method: **GET**
   - Path: `/oauth/linkedin/init`
   - Add Function Stack:

```
Function Stack for /oauth/linkedin/init:
┌─────────────────────────────────────────┐
│ 1. Get Query Parameters                 │
│    - Input: redirect_uri (query param)  │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 2. Build LinkedIn Auth URL              │
│    - Use "Text: Concatenate" function   │
│    - Template:                           │
│      https://www.linkedin.com/oauth/v2/ │
│      authorization?response_type=code&  │
│      client_id=YOUR_CLIENT_ID&          │
│      redirect_uri={{redirect_uri}}&     │
│      scope=r_liteprofile r_emailaddress │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 3. Response                              │
│    - Return JSON:                        │
│      { "authUrl": {{built_url}} }       │
└─────────────────────────────────────────┘
```

3. **Create Continue Endpoint**
   - Click **"Add API Endpoint"**
   - Method: **GET**
   - Path: `/oauth/linkedin/continue`
   - Add Function Stack:

```
Function Stack for /oauth/linkedin/continue:
┌─────────────────────────────────────────┐
│ 1. Get Query Parameters                 │
│    - Input: code (query param)          │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 2. Exchange Code for Token              │
│    - Use "External API Request"         │
│    - Method: POST                        │
│    - URL: https://www.linkedin.com/     │
│           oauth/v2/accessToken          │
│    - Body (form-data):                   │
│      * grant_type: authorization_code   │
│      * code: {{code}}                    │
│      * client_id: YOUR_CLIENT_ID        │
│      * client_secret: YOUR_SECRET       │
│      * redirect_uri: {{redirect_uri}}   │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 3. Get User Info from LinkedIn          │
│    - Use "External API Request"         │
│    - Method: GET                         │
│    - URL: https://api.linkedin.com/v2/  │
│           me                             │
│    - Headers:                            │
│      Authorization: Bearer {{token}}    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 4. Get User Email from LinkedIn         │
│    - Use "External API Request"         │
│    - Method: GET                         │
│    - URL: https://api.linkedin.com/v2/  │
│           emailAddress?q=members&        │
│           projection=(elements*(handle~))│
│    - Headers:                            │
│      Authorization: Bearer {{token}}    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 5. Find or Create User                   │
│    - Query your user table               │
│    - If not exists, create new user     │
│    - Fields from LinkedIn:               │
│      * email                             │
│      * firstName                         │
│      * lastName                          │
│      * linkedin_id                       │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 6. Generate Auth Token                   │
│    - Use "Authentication: Create Token" │
│    - User: {{created_or_found_user}}    │
└─────────────────────────────────────────┘
┌─────────────────────────────────────────┐
│ 7. Response                              │
│    - Return JSON:                        │
│      {                                   │
│        "token": {{auth_token}},         │
│        "email": {{user.email}},         │
│        "name": {{user.name}}            │
│      }                                   │
└─────────────────────────────────────────┘
```

---

### Step 2: Store LinkedIn Credentials in Xano

1. **Create Environment Variables** (Recommended)
   - Go to **Settings** → **Environment Variables**
   - Add:
     - `LINKEDIN_CLIENT_ID`: `[your LinkedIn client ID]`
     - `LINKEDIN_CLIENT_SECRET`: `[your LinkedIn secret]`

2. **Use Variables in Function Stacks**
   - Reference as: `env.LINKEDIN_CLIENT_ID`
   - This keeps credentials secure

---

### Step 3: Update User Table (if needed)

1. **Go to Database**
   - Click **"Database"** in left sidebar
   - Select your **user** table

2. **Add LinkedIn Fields** (if not present):
   - `linkedin_id` (text, unique)
   - `linkedin_access_token` (text, optional)
   - `oauth_provider` (text, default: 'linkedin')

---

## 🧪 Testing Your Setup

### 1. Test Init Endpoint
Open in browser:
```
https://your-xano.xano.io/api:XXXXX/oauth/linkedin/init?redirect_uri=http://localhost:3000/auth/callback
```

Expected response:
```json
{
  "authUrl": "https://www.linkedin.com/oauth/v2/authorization?..."
}
```

### 2. Test Full Flow
1. Click "Continue with LinkedIn" on your sign-in page
2. Complete LinkedIn authorization
3. Check if user is created in Xano database
4. Verify redirect to `/expert` dashboard

---

## 🔑 Important URLs

**LinkedIn URLs:**
- Authorization: `https://www.linkedin.com/oauth/v2/authorization`
- Token: `https://www.linkedin.com/oauth/v2/accessToken`
- User Profile: `https://api.linkedin.com/v2/me`
- User Email: `https://api.linkedin.com/v2/emailAddress?q=members&projection=(elements*(handle~))`

**Your Xano Base URL:**
```
https://[your-workspace].xano.io/api:[your-api-key]
```

---

## 🚨 Troubleshooting

### "Invalid Redirect URI"
- Ensure redirect URI in LinkedIn app **exactly** matches the one in your code
- No trailing slashes
- Must use HTTPS in production

### "Insufficient Permissions"
- Go to LinkedIn app
