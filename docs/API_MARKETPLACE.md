# Marketplace API Documentation

## Overview

SOPH.IA Marketplace API provides programmatic access to discover, search, rate, and clone public agents.

**Base URL:** `https://soph.ia/api`

**Authentication:** Supabase auth tokens (for operations that mutate data)

---

## Endpoints

### 1. Get Public Agents

Search and filter public agents from the marketplace.

**Endpoint:** `GET /agents/public`

**Query Parameters:**
- `search` (optional): Search by agent name or description
- `tag` (optional): Filter by tag
- `sort` (optional): Sort order - `newest`, `rating`, `popular`
- `limit` (optional, default: 50): Max results to return

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Support Assistant",
      "description": "Handles customer support tickets",
      "provider": "anthropic",
      "model": "claude-3-5-sonnet",
      "rating": 4.5,
      "ratings_count": 12,
      "invocations": 450,
      "tags": ["support", "customer-service"],
      "organization_id": "uuid",
      "organizations": { "name": "Acme Corp" },
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 128
}
```

**Example:**
```bash
curl "https://soph.ia/api/agents/public?search=support&sort=rating&limit=10"
```

---

### 2. Get Single Public Agent

Retrieve details of a specific public agent.

**Endpoint:** `GET /agents/public/{agentId}`

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Support Assistant",
  "description": "...",
  "system_prompt": "You are a helpful support agent...",
  "rating": 4.5,
  "ratings_count": 12,
  "invocations": 450,
  "tags": ["support"],
  "organization_id": "uuid",
  "visibility": "public",
  "status": "deployed",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### 3. Clone Agent

Clone a public agent into your organization.

**Endpoint:** `POST /agents/clone`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "agent_id": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "new-uuid",
  "name": "Support Assistant (clone)",
  "description": "...",
  "cloned_from": "original-uuid",
  "visibility": "private",
  "status": "draft",
  "organization_id": "your-org-uuid"
}
```

**Errors:**
- `404 Not Found`: Agent doesn't exist or isn't public
- `401 Unauthorized`: Not authenticated

---

### 4. Rate Agent

Submit or update a rating for a public agent.

**Endpoint:** `POST /agents/{agentId}/rate`

**Authentication:** Required (Bearer token)

**Request Body:**
```json
{
  "rating": 4,
  "review": "Great agent! Very helpful with support tickets."
}
```

**Response:** `200 OK`
```json
{
  "id": "rating-uuid",
  "rating": 4,
  "review": "Great agent! Very helpful...",
  "agent_id": "uuid",
  "user_id": "your-user-id",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Validation:**
- `rating`: Integer between 1-5 (required)
- `review`: String, max 500 chars (optional)

---

### 5. Get Agent Reviews

Fetch all reviews and ratings for an agent.

**Endpoint:** `GET /agents/{agentId}/reviews`

**Query Parameters:**
- `limit` (optional, default: 20): Max reviews to return
- `offset` (optional, default: 0): Pagination offset

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "rating-uuid",
      "rating": 5,
      "review": "Excellent, very responsive",
      "created_at": "2024-01-15T10:30:00Z",
      "user": {
        "id": "user-uuid",
        "email": "user@example.com"
      }
    }
  ],
  "total": 42
}
```

---

### 6. Get Marketplace Stats

Get aggregated marketplace statistics.

**Endpoint:** `GET /marketplace/stats`

**Response:** `200 OK`
```json
{
  "totalPublicAgents": 128,
  "averageRating": 4.2,
  "totalInvocations": 45000,
  "topAgentInvocations": 2150,
  "averageRatingCount": 8.5,
  "growthPercent": 15.2,
  "cloneableAgents": 128
}
```

---

### 7. Get Trending Agents

Fetch top-performing agents.

**Endpoint:** `GET /marketplace/trending`

**Query Parameters:**
- `limit` (optional, default: 6): Max agents to return per category

**Response:** `200 OK`
```json
{
  "topRated": [
    {
      "id": "uuid",
      "name": "...",
      "rating": 4.8,
      "ratings_count": 45
    }
  ],
  "mostUsed": [
    {
      "id": "uuid",
      "name": "...",
      "invocations": 5200
    }
  ]
}
```

---

### 8. Get Featured Collections

Fetch admin-curated agent collections.

**Endpoint:** `GET /marketplace/collections`

**Response:** `200 OK`
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Customer Support",
      "description": "Best agents for customer support",
      "icon": "sparkle",
      "agents": [
        {
          "id": "uuid",
          "name": "Support Assistant",
          "rating": 4.5
        }
      ]
    }
  ]
}
```

---

## Rate Limiting

- **Public endpoints:** 100 requests/minute per IP
- **Authenticated endpoints:** 500 requests/minute per user

Rate limit info returned in headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1705317600
```

---

## Error Responses

All errors return JSON with standard format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Search query too short",
    "details": {
      "field": "search",
      "requirement": "minimum 3 characters"
    }
  }
}
```

**Common Error Codes:**
- `BAD_REQUEST` (400): Invalid parameters
- `UNAUTHORIZED` (401): Auth token missing/invalid
- `NOT_FOUND` (404): Resource not found
- `CONFLICT` (409): Already rated by this user
- `RATE_LIMIT_EXCEEDED` (429): Too many requests
- `SERVER_ERROR` (500): Internal server error

---

## Authentication

Include auth token in request headers:

```bash
curl -H "Authorization: Bearer YOUR_SUPABASE_TOKEN" \
  https://soph.ia/api/agents/clone
```

Get tokens from your Supabase session after login.

---

## Webhooks (Future)

Subscribe to agent updates:

```
POST /webhooks/subscribe
{
  "event": "agent.rated",
  "url": "https://yourapp.com/webhooks/agent-rated"
}
```

Events: `agent.rated`, `agent.cloned`, `agent.published`, `agent.depublished`

---

## SDK Support

Official SDKs available:

- **JavaScript/TypeScript:** `npm install @soph-ia/client`
- **Python:** `pip install soph-ia`
- **Go:** `go get github.com/soph-ia/go-client`

---

## Examples

### Search for support agents

```bash
curl "https://soph.ia/api/agents/public?search=support&sort=rating&limit=5"
```

### Clone an agent

```bash
curl -X POST https://soph.ia/api/agents/clone \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"agent_id": "abc123"}'
```

### Rate an agent

```bash
curl -X POST https://soph.ia/api/agents/abc123/rate \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "rating": 5,
    "review": "Excellent agent!"
  }'
```

---

## Support

- **Documentation:** https://docs.soph.ia/marketplace
- **Discord:** https://discord.gg/soph-ia
- **Email:** support@soph.ia
