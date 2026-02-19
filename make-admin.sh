#!/bin/bash

# Script to make a user an admin
# Usage: ./make-admin.sh email@example.com

if [ -z "$1" ]; then
    echo "Usage: ./make-admin.sh <email>"
    echo "Example: ./make-admin.sh john@example.com"
    exit 1
fi

EMAIL=$1

echo "Updating user $EMAIL to ADMIN role..."

# Run the SQL command directly using Prisma's connection
npx prisma db execute --stdin <<EOF
UPDATE "User" SET role = 'ADMIN' WHERE email = '$EMAIL';
EOF

echo "✅ User $EMAIL has been updated to ADMIN role!"
echo ""
echo "To verify, run: npx prisma studio"
