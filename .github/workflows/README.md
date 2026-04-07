# GitHub Actions Workflows

This directory contains automated checks and security analysis workflows for the Car Insurance backend.

## Workflows

### 1. Semgrep Security Analysis (`./.github/workflows/semgrep.yml`)

Automatically scans code for security vulnerabilities and best practice violations.

**Triggers:**
- Push to `main` or `develop` branches (only when `be/` changes)
- Pull requests to `main` or `develop` branches (only when `be/` changes)

**What it does:**
- ✅ Runs Semgrep static analysis on backend code
- ✅ Checks OWASP Top 10 vulnerabilities
- ✅ Scans Node.js security patterns
- ✅ Uploads findings to GitHub Security tab (SARIF format)
- ✅ Comments on PRs with findings summary
- ✅ Fails the workflow if critical issues are found

**Rule Sets Used:**
- `p/security-audit` - General security audit rules
- `p/owasp-top-ten` - OWASP Top 10 vulnerabilities
- `p/nodejs` - Node.js specific issues

**Output:**
- SARIF report viewable in GitHub Security → Code scanning
- Automatic PR comments with summary
- Workflow fails on critical/error-level issues

### 2. Backend Quality Checks (`./.github/workflows/backend-quality.yml`)

Validates code quality, structure, and security practices.

**Triggers:**
- Push to `main` or `develop` branches (only when `be/` changes)
- Pull requests to `main` or `develop` branches (only when `be/` changes)

**What it does:**
- ✅ Installs and validates dependencies
- ✅ Runs `npm audit` for known vulnerabilities
- ✅ Validates all JavaScript files can be parsed
- ✅ Verifies required files exist
- ✅ Checks for hardcoded secrets/passwords
- ✅ Comments on PRs with status

**Checks:**
1. **Dependency Security:** `npm audit` at moderate level
2. **Code Syntax:** Node.js `--check` option on all entry points
3. **File Structure:** Verification of critical files
4. **Secret Detection:** Scans for hardcoded passwords/secrets

## Configuration

### Environment Setup

Both workflows run automatically when backend code changes. No additional setup needed, but ensure:

1. **Backend Code Quality:**
   - Code follows Node.js/Express best practices
   - No hardcoded secrets in repository
   - All dependencies are properly installed

2. **For Semgrep:**
   - Uses returntocorp/semgrep-action@v1
   - Configured to scan `be/` directory
   - Results uploaded to GitHub Security

## Viewing Results

### Semgrep Findings
1. Go to **Security** tab in GitHub repo
2. Click **Code scanning alerts**
3. View detailed findings with code snippets

### PR Comments
- Workflows automatically comment on PRs with:
  - Summary of issues found
  - Severity levels
  - Links to Semgrep documentation

### Workflow Logs
- Go to **Actions** tab
- Click specific workflow run
- View logs for detailed execution info

## Customization

### Add More Semgrep Rules
Edit `semgrep.yml`:
```yaml
with:
  config: >-
    p/security-audit
    p/owasp-top-ten
    p/nodejs
    p/express           # Add Express specific rules
    p/stripe            # Add Stripe payment rules
```

### Adjust Severity Thresholds
In `backend-quality.yml`, change:
```yaml
run: npm audit --audit-level=moderate
```
Options: `low`, `moderate`, `high`, `critical`

### Add Custom Semgrep Rules
Create `.semgrep.yml` in `be/` directory with custom rules:
```yaml
rules:
  - id: no-console-logs-in-production
    pattern: console.log(...)
    message: "Remove console.log in production"
    severity: WARNING
```

## Best Practices

1. **Keep Dependencies Updated:**
   - Run `npm outdated` regularly
   - Update `package.json` versions
   - Re-run workflows to validate

2. **Fix Security Issues:**
   - Address high/critical findings immediately
   - Use `npm audit fix` for automatic patches
   - Review changes before committing

3. **Code Review:**
   - Don't merge PRs with workflow failures
   - Review Semgrep findings before approving
   - Use as additional quality gate

## Troubleshooting

### Workflow Fails with "npm audit" errors
- Review the specific vulnerabilities
- Run locally: `cd be && npm audit`
- Fix with: `npm audit fix` or update packages manually

### Semgrep false positives
- Review the specific rule
- Suppress with `# nosemgrep: rule-id` comment
- Or customize rules in `.semgrep.yml`

### PR Comments not appearing
- Check workflow has `security-events: write` permission
- Verify GitHub token has necessary scopes
- Check Actions logs for errors

## References

- [Semgrep Documentation](https://semgrep.dev/docs)
- [Semgrep Rule Library](https://semgrep.dev/explore)
- [GitHub Actions Security](https://docs.github.com/en/actions/security-guides)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
