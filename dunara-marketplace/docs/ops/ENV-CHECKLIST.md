# Environment variable checklist

Mark each environment: Local / Preview / Production.

| Variable | Local | Preview | Production | Server-only? |
|----------|-------|---------|------------|--------------|
| `NEXT_PUBLIC_SITE_URL` | | | | No |
| `NEXT_PUBLIC_SUPABASE_URL` | | | | No |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | | | | No |
| `SUPABASE_SERVICE_ROLE_KEY` | | | | **Yes** |
| `NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY` | | | | No |
| `PAYSTACK_SECRET_KEY` | | | | **Yes** |
| `PAYSTACK_WEBHOOK_SECRET` | | | | **Yes** |
| `AI_PROVIDER_API_KEY` | | | | **Yes** |
| `AI_PROVIDER_BASE_URL` | | | | **Yes** |
| `AI_PROVIDER_MODEL` | | | | **Yes** |

Rules:

- Never commit `.env.local`
- Never put server secrets in `NEXT_PUBLIC_*`
- Production Paystack keys only after owner approval
- Rotate any secret that may have been exposed in chat or screenshots
