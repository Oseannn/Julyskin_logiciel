#!/bin/sh
# Fix failed migration on Railway
npx prisma migrate resolve --applied 20260126000000_init
