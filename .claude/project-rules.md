# Project Development Rules

## Testing Requirements

### **MANDATORY: Test After Each Phase**

After completing ANY development phase or feature, you MUST:

1. **Test the implementation immediately**
   - DO NOT move to the next phase without testing
   - DO NOT ask the user if they want to test
   - Testing is MANDATORY, not optional

2. **Test all endpoints/functionality**
   - Use `curl` to test HTTP endpoints
   - Verify responses are correct
   - Check for errors and fix them before proceeding

3. **Verify application is running**
   - Check that servers start successfully
   - Confirm correct ports are listening
   - Test database connectivity if applicable

4. **Report test results**
   - Show successful test outputs to user
   - If tests fail, fix issues immediately
   - Do NOT proceed until all tests pass

## Examples

### ✅ CORRECT Workflow:
```
1. Implement authentication endpoints
2. Test login endpoint with curl
3. Test registration endpoint with curl
4. Verify JWT token generation
5. Fix any errors found
6. ONLY THEN move to next phase
```

### ❌ INCORRECT Workflow:
```
1. Implement authentication endpoints
2. Ask user "should I test this?"  ← WRONG
3. Move to next phase without testing ← WRONG
```

## Testing Commands

### Backend Testing:
```bash
# Test Node.js/Go/Java backend endpoints
curl -X POST http://localhost:PORT/api/endpoint \
  -H "Content-Type: application/json" \
  -d '{"key":"value"}'

# Test with authentication
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:PORT/api/protected
```

### Application Status:
```bash
# Check if server is running
netstat -ano | findstr ":PORT"

# View application logs
# (use BashOutput for background processes)
```

## Phase Completion Checklist

Before marking a phase as complete:

- [ ] All code written and compiled successfully
- [ ] Application starts without errors
- [ ] All endpoints tested with real requests
- [ ] Test results verified and passing
- [ ] Any bugs/errors fixed
- [ ] Results shown to user

## Remember

**DO NOT skip testing. Ever.**

If a phase cannot be tested (e.g., pure refactoring), explicitly state why testing is not applicable.
