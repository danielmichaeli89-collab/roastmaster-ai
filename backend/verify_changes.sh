#!/bin/bash

echo "=== VERIFICATION REPORT ==="
echo ""

echo "1. Auth Controller - checking for formatUser function..."
grep -q "const formatUser" src/controllers/auth.controller.js && echo "✓ formatUser helper found" || echo "✗ formatUser helper NOT found"

echo ""
echo "2. Auth Controller - checking for generateTokens function..."
grep -q "const generateTokens" src/controllers/auth.controller.js && echo "✓ generateTokens helper found" || echo "✗ generateTokens helper NOT found"

echo ""
echo "3. Auth Controller - checking for refreshToken export..."
grep -q "export const refreshToken" src/controllers/auth.controller.js && echo "✓ refreshToken export found" || echo "✗ refreshToken export NOT found"

echo ""
echo "4. Auth Controller - checking for changePassword export..."
grep -q "export const changePassword" src/controllers/auth.controller.js && echo "✓ changePassword export found" || echo "✗ changePassword export NOT found"

echo ""
echo "5. Auth Controller - checking for logout export..."
grep -q "export const logout" src/controllers/auth.controller.js && echo "✓ logout export found" || echo "✗ logout export NOT found"

echo ""
echo "6. Auth Routes - checking for refresh route..."
grep -q "router.post('/refresh'" src/routes/auth.routes.js && echo "✓ refresh route found" || echo "✗ refresh route NOT found"

echo ""
echo "7. Auth Routes - checking for change-password route..."
grep -q "router.post('/change-password'" src/routes/auth.routes.js && echo "✓ change-password route found" || echo "✗ change-password route NOT found"

echo ""
echo "8. Auth Routes - checking for logout route..."
grep -q "router.post('/logout'" src/routes/auth.routes.js && echo "✓ logout route found" || echo "✗ logout route NOT found"

echo ""
echo "9. Migration - checking for username column..."
grep -q "table.string('username'" src/migrations/014_fix_users_table.js && echo "✓ username column migration found" || echo "✗ username column migration NOT found"

echo ""
echo "10. Migration - checking for full_name column..."
grep -q "table.string('full_name'" src/migrations/014_fix_users_table.js && echo "✓ full_name column migration found" || echo "✗ full_name column migration NOT found"

echo ""
echo "11. Migration - checking for roester_serial_number column..."
grep -q "table.string('roester_serial_number'" src/migrations/014_fix_users_table.js && echo "✓ roester_serial_number column migration found" || echo "✗ roester_serial_number column migration NOT found"

echo ""
echo "12. Coffees Controller - checking for timestamp handling..."
grep -q "created_at: now" src/controllers/coffees.controller.js && echo "✓ created_at timestamp found in createCoffee" || echo "✗ created_at timestamp NOT found"

echo ""
echo "13. Auth Middleware - checking for token expiry distinction..."
grep -q "TokenExpiredError" src/middleware/auth.js && echo "✓ Token expiry handling found" || echo "✗ Token expiry handling NOT found"

echo ""
echo "=== SYNTAX CHECK ==="
node -c src/controllers/auth.controller.js && echo "✓ auth.controller.js syntax OK" || echo "✗ auth.controller.js syntax ERROR"
node -c src/routes/auth.routes.js && echo "✓ auth.routes.js syntax OK" || echo "✗ auth.routes.js syntax ERROR"
node -c src/migrations/014_fix_users_table.js && echo "✓ migration syntax OK" || echo "✗ migration syntax ERROR"
node -c src/controllers/coffees.controller.js && echo "✓ coffees.controller.js syntax OK" || echo "✗ coffees.controller.js syntax ERROR"
node -c src/middleware/auth.js && echo "✓ auth.js syntax OK" || echo "✗ auth.js syntax ERROR"

echo ""
echo "=== ALL CHECKS COMPLETE ==="
