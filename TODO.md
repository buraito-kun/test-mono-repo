# Security and Software Engineering Improvements

This document outlines comprehensive improvements for enhancing security and implementing software engineering best practices in our calculator application for production readiness.

## 1. Input Validation & Sanitization

- [ ] **Implement server-side validation for all API inputs**:

  - Create validation functions in `/apps/backend/middleware/validate.ts` that check input types, ranges, and formats
  - Specifically for calculator operations, validate that `a` and `b` are valid numbers and `op` is one of the supported operations
  - Example implementation:

    ```typescript
    function validateCalculationInput(req, res, next) {
      const { a, b, op } = req.body;
      const validOps = ["+", "-", "*", "/", "^"];

      if (typeof a !== "number" || typeof b !== "number") {
        return res
          .status(400)
          .json({ error: "Parameters 'a' and 'b' must be numbers" });
      }

      if (!validOps.includes(op)) {
        return res
          .status(400)
          .json({ error: `Operation '${op}' not supported` });
      }

      next();
    }
    ```

- [ ] **Add input sanitization to prevent XSS attacks**:

  - Install and implement sanitization libraries like DOMPurify for frontend
  - For backend, escape any user inputs that might be reflected back
  - For the calculator API, ensure that error messages don't reflect unsanitized user input

- [ ] **Create a validation middleware for API routes**:

  - Develop a reusable middleware in `/apps/backend/middleware/` that can be applied to all API routes
  - Include logging of validation failures with appropriate error codes
  - Apply this middleware to the calculation API endpoint

- [ ] **Use TypeScript zod or joi for schema validation**:

  - Install zod: `pnpm add zod`
  - Define schemas for all API requests:

    ```typescript
    import { z } from "zod";

    const calculationSchema = z.object({
      a: z.number(),
      b: z.number(),
      op: z.enum(["+", "-", "*", "/", "^"]),
    });
    ```

  - Apply schema validation in middleware

- [ ] **Implement stricter number format validation**:

  - Add range checks to prevent integer overflow/underflow
  - Consider numeric precision issues, especially for floating-point operations
  - Add special handling for edge cases like Infinity, NaN, or very large numbers

## 2. API Security Improvements

- [ ] **Add CORS configuration with proper origin restrictions**:

  - Configure CORS in backend to only allow specific origins:

    ```typescript
    import cors from "cors";

    app.use(
      cors({
        origin:
          process.env.ALLOWED_ORIGINS?.split(",") || "http://localhost:3000",
        methods: ["GET", "POST"],
        allowedHeaders: ["Content-Type", "Authorization"],
        credentials: true,
      })
    );
    ```

  - Add the origin configuration to environment variables

- [ ] **Implement Content Security Policy (CSP) headers**:

  - Add Helmet.js to backend: `pnpm add helmet`
  - Configure CSP to prevent XSS and other injection attacks:

    ```typescript
    import helmet from "helmet";

    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          imgSrc: ["'self'", "data:"],
        },
      })
    );
    ```

- [ ] **Add API request/response encryption for sensitive operations**:

  - If calculator operations include sensitive data, implement encryption
  - Consider using TLS for transport-level encryption
  - For additional security, implement payload encryption for sensitive data

- [ ] **Implement proper HTTP security headers**:

  - Configure headers in backend using Helmet.js:
    ```typescript
    app.use(helmet());
    ```
  - Ensure the following headers are set:
    - X-Content-Type-Options: nosniff
    - X-Frame-Options: DENY
    - X-XSS-Protection: 1; mode=block

- [ ] **Add request ID generation for traceability**:

  - Add middleware to generate unique request IDs:

    ```typescript
    import { v4 as uuidv4 } from "uuid";

    app.use((req, res, next) => {
      req.id = uuidv4();
      res.setHeader("X-Request-ID", req.id);
      next();
    });
    ```

  - Include request ID in all logs for better debugging

## 3. Environment Variable Handling

- [ ] **Audit all environment variables used in the application**:

  - Create a comprehensive list of all environment variables used in both frontend and backend
  - Identify which environment variables are used in the calculation service
  - Document the purpose and expected format for each variable
  - Check current usage in `apps/frontend/lib/calculate.ts` and similar files

- [ ] **Create environment variable validation at startup**:

  - Implement validation at application startup:

    ```typescript
    function validateEnv() {
      const requiredEnvVars = ["NEXT_PUBLIC_API_URL"];
      const missingVars = requiredEnvVars.filter(
        (envVar) => !process.env[envVar]
      );

      if (missingVars.length > 0) {
        console.error(
          `Missing required environment variables: ${missingVars.join(", ")}`
        );
        process.exit(1);
      }
    }

    // Call at startup
    validateEnv();
    ```

- [ ] **Implement dotenv-vault or similar for secure env management**:

  - Install dotenv-vault: `pnpm add dotenv-vault`
  - Set up encryption for environment variables
  - Create separate environments (development, staging, production)
  - Document the process for managing environment variables

- [ ] **Remove any hardcoded secrets/credentials**:

  - Scan codebase for hardcoded API URLs, keys, or credentials
  - Move all secrets to environment variables or a secure vault
  - Update CI/CD pipelines to inject secrets securely
  - Check `/apps/frontend/lib/calculate.ts` for hardcoded API URLs

- [ ] **Add environment variable documentation**:

  - Create an `.env.example` file with all required variables
  - Add comments explaining each variable's purpose and format
  - Document how to set up environment variables for local development
  - Include instructions for CI/CD environment configuration

## 4. Dependency Management

- [ ] **Implement dependency pinning with exact versions**:

  - Update all dependencies in package.json with exact versions:
    ```json
    "dependencies": {
      "axios": "1.6.2",
      "react": "18.2.0"
    }
    ```
  - Create a policy for version updates
  - Implement in root package.json and all workspace package.json files

- [ ] **Setup automated dependency scanning with Dependabot**:

  - Create a `.github/dependabot.yml` configuration:
    ```yaml
    version: 2
    updates:
      - package-ecosystem: "npm"
        directory: "/"
        schedule:
          interval: "weekly"
        versioning-strategy: "lockfile-only"
        open-pull-requests-limit: 10
    ```
  - Configure alerts for security vulnerabilities
  - Set up regular review process for dependency updates

- [ ] **Create a process for regular dependency updates**:

  - Document the process for reviewing and applying updates
  - Establish testing requirements for dependency changes
  - Create schedule for regular updates (e.g., monthly)
  - Assign team members responsible for dependency management

- [ ] **Add license compliance checking**:

  - Install license-checker: `pnpm add -D license-checker`
  - Add script to package.json to check licenses:
    ```json
    "scripts": {
      "check-licenses": "license-checker --production --onlyAllow 'MIT;Apache-2.0;BSD-2-Clause;BSD-3-Clause;ISC'"
    }
    ```
  - Run license check in CI/CD pipeline
  - Document allowed license types for the project

- [ ] **Audit and remove unused dependencies**:

  - Use tools like depcheck: `pnpm add -D depcheck`
  - Add script to find unused dependencies:
    ```json
    "scripts": {
      "depcheck": "depcheck"
    }
    ```
  - Remove identified unused dependencies
  - Review dev dependencies and move to appropriate workspace packages

## 5. Authentication & Authorization

- [ ] **Implement proper authentication system (JWT/OAuth2)**:

  - Install required packages: `pnpm add jsonwebtoken passport passport-jwt`
  - Create authentication service in `/apps/backend/services/auth.ts`
  - Implement JWT token generation and validation
  - Set up secure cookie handling for token storage
  - Example JWT implementation:

    ```typescript
    import jwt from "jsonwebtoken";

    export function generateToken(userId: string) {
      return jwt.sign({ sub: userId }, process.env.JWT_SECRET!, {
        expiresIn: "1h",
        audience: "calculator-app",
        issuer: "calculator-api",
      });
    }
    ```

- [ ] **Add role-based access control for backend APIs**:

  - Define roles (e.g., user, admin) in database schema
  - Create middleware to check role permissions:
    ```typescript
    function checkRole(role: string) {
      return (req, res, next) => {
        if (req.user && req.user.role === role) {
          return next();
        }
        return res.status(403).json({ error: "Forbidden" });
      };
    }
    ```
  - Apply role checks to appropriate routes

- [ ] **Implement proper token rotation and expiry**:

  - Set reasonable expiry times for access tokens (e.g., 15-60 minutes)
  - Implement refresh token mechanism with longer expiry
  - Create token rotation on suspicious activity
  - Add token blacklisting for compromised tokens

- [ ] **Add account lockout mechanisms**:

  - Implement rate limiting for login attempts
  - Create temporary account lockout after failed attempts
  - Add notification system for suspicious login activities
  - Document recovery procedures for locked accounts

- [ ] **Create audit logging for authentication events**:

  - Log all authentication events (login, logout, token refresh)
  - Include essential details like timestamp, user ID, IP address
  - Store logs securely and maintain for compliance requirements
  - Create alerts for suspicious authentication patterns

## 6. HTTPS Implementation

- [ ] **Enforce HTTPS for all communications**:

  - Configure backend to redirect HTTP to HTTPS
  - Update frontend to use HTTPS URLs for all API calls
  - Check and update API URL in `/apps/frontend/lib/calculate.ts`
  - Add middleware to enforce HTTPS:
    ```typescript
    app.use((req, res, next) => {
      if (!req.secure && process.env.NODE_ENV === "production") {
        return res.redirect(`https://${req.headers.host}${req.url}`);
      }
      next();
    });
    ```

- [ ] **Configure proper TLS/SSL settings**:

  - Use modern TLS version (1.2+)
  - Configure strong cipher suites
  - Disable outdated and insecure protocols
  - Document SSL configuration for production deployment

- [ ] **Implement HTTP Strict Transport Security (HSTS)**:

  - Add Helmet.js HSTS configuration:
    ```typescript
    app.use(
      helmet.hsts({
        maxAge: 15552000, // 180 days in seconds
        includeSubDomains: true,
        preload: true,
      })
    );
    ```
  - Consider submitting site to HSTS preload list

- [ ] **Create process for certificate rotation**:

  - Document certificate renewal process
  - Set up alerts for expiring certificates
  - Create automated renewal using Let's Encrypt or similar
  - Implement zero-downtime certificate rotation

- [ ] **Test SSL configuration with security scanners**:

  - Use tools like SSL Labs Server Test or testssl.sh
  - Run regular scans as part of security testing
  - Document acceptable ratings (A or A+)
  - Create action plan for addressing scanner findings

## 7. Rate Limiting

- [ ] **Implement API rate limiting to prevent abuse**:

  - Install rate-limiting middleware: `pnpm add express-rate-limit`
  - Configure global rate limits:

    ```typescript
    import rateLimit from "express-rate-limit";

    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
      legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    });

    app.use(limiter);
    ```

  - Add stricter limits for auth endpoints

- [ ] **Add IP-based throttling for public endpoints**:

  - Implement IP-based rate limiting for public APIs
  - Create tiered limits based on authentication status
  - Store rate limit data in Redis or similar for distributed environments
  - Configure bypass for trusted IPs

- [ ] **Create graduated response mechanism for rate limit violations**:

  - First threshold: Slow response time
  - Second threshold: Temporary block
  - Third threshold: Extended block with CAPTCHA challenge
  - Final threshold: IP reporting and permanent block

- [ ] **Implement proper rate limit headers**:

  - Add standard rate limit headers to responses:
    - X-RateLimit-Limit
    - X-RateLimit-Remaining
    - X-RateLimit-Reset
  - Document header format in API documentation

- [ ] **Add monitoring for rate limit events**:

  - Log all rate limit breaches with relevant details
  - Create alerts for unusual rate limit patterns
  - Implement dashboard for viewing rate limit statistics
  - Set up regular review of rate limit effectiveness

## 8. Error Handling & Logging

- [ ] Implement structured logging throughout the application
- [ ] Set up centralized log collection
- [ ] Create standardized error responses
- [ ] Ensure sensitive data is not exposed in logs or error messages
- [ ] Add correlation IDs for request tracing

## 9. CI/CD Pipeline Enhancements

- [ ] Add SAST (Static Application Security Testing)
- [ ] Implement secret scanning in CI
- [ ] Update Trivy to scan dependencies in addition to containers
- [ ] Add end-to-end testing in pipeline
- [ ] Implement environment promotion strategy (dev→staging→prod)

## 10. Container Security

- [ ] Use distroless or minimal base images
- [ ] Implement non-root user for container execution
- [ ] Add container image signing
- [ ] Implement least privilege principle for container permissions
- [ ] Create Docker best practices documentation

## 11. Testing Coverage

- [ ] Increase unit test coverage to >80%
- [ ] Implement integration tests for API endpoints
- [ ] Add security-focused tests (auth bypass, input fuzzing)
- [ ] Implement contract testing between frontend and backend
- [ ] Create load/performance testing suite

## 12. Performance Optimization

- [ ] Implement proper caching strategies
- [ ] Add compression for API responses
- [ ] Optimize frontend bundle size
- [ ] Implement code splitting and lazy loading
- [ ] Add performance monitoring and alerting

## 13. Documentation

- [ ] Create comprehensive API documentation
- [ ] Add inline code documentation standards
- [ ] Implement architectural decision records (ADRs)
- [ ] Create runbooks for common issues
- [ ] Document security practices and incident response

## 14. Monitoring & Observability

- [ ] Implement health check endpoints
- [ ] Add application metrics collection
- [ ] Setup alerting for critical service disruptions
- [ ] Implement distributed tracing
- [ ] Create dashboards for key performance indicators

## 15. Accessibility Compliance

- [ ] Perform accessibility audit
- [ ] Implement WCAG 2.1 AA compliance
- [ ] Add proper aria labels and roles
- [ ] Ensure keyboard navigation support
- [ ] Test with screen readers and accessibility tools
