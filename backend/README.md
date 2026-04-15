# Backend Pádel Pro

Este backend se desarrollará en el **Hito 3** del roadmap.

## Stack previsto

- Node.js + Express
- Railway (hosting)
- Supabase (PostgreSQL + Auth)
- Redis (cache)
- Firebase Cloud Messaging (notificaciones push)

## Responsabilidades

- Proxy de `padelapi.org` con cache y rate limiting
- Autenticación (JWT + Supabase Auth)
- Validación de pagos (Apple/Google receipts)
- WebSocket relay para marcadores en tiempo real
- Cron jobs para notificaciones push

## Notas

- Este monorepo mantiene el backend separado en `/backend` para facilitar el despliegue independiente.
