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

- [ ] **Implement structured logging throughout the application**:

  - Install a structured logging library: `pnpm add winston pino`
  - Create a dedicated logging service in `/apps/backend/services/logger.ts`:
    ```typescript
    import winston from 'winston';
    
    const logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
      defaultMeta: { service: 'calculator-api' },
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
      ],
    });
    
    export default logger;
    ```
  - Implement context-aware logging for both frontend and backend
  - Set up error boundaries in React components for frontend error handling

- [ ] **Set up centralized log collection**:

  - Configure log shipping to a central service (ELK, CloudWatch, or Datadog)
  - Create a Docker Compose setup for local development:
    ```yaml
    version: '3'
    services:
      elasticsearch:
        image: docker.elastic.co/elasticsearch/elasticsearch:7.10.0
        environment:
          - discovery.type=single-node
      kibana:
        image: docker.elastic.co/kibana/kibana:7.10.0
        ports:
          - 5601:5601
      logstash:
        image: docker.elastic.co/logstash/logstash:7.10.0
    ```
  - Implement log retention policies (e.g., 30 days for normal logs, 1 year for security logs)
  - Add log rotation configuration for production environments

- [ ] **Create standardized error responses**:

  - Develop custom error classes in `/apps/backend/utils/errors.ts`:
    ```typescript
    export class AppError extends Error {
      public readonly statusCode: number;
      public readonly isOperational: boolean;
      
      constructor(message: string, statusCode: number, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Error.captureStackTrace(this, this.constructor);
      }
    }
    
    export class ValidationError extends AppError {
      constructor(message: string) {
        super(message, 400, true);
      }
    }
    ```
  - Create error handling middleware in `/apps/backend/middleware/errorHandler.ts`:
    ```typescript
    import { AppError } from '../utils/errors';
    import logger from '../services/logger';
    
    export const errorHandler = (err, req, res, next) => {
      let error = { ...err };
      error.message = err.message;
      
      // Log error
      logger.error({
        message: error.message,
        stack: error.stack,
        requestId: req.id,
        path: req.originalUrl
      });
      
      // Return standardized response
      return res.status(error.statusCode || 500).json({
        status: 'error',
        message: error.isOperational ? error.message : 'Internal server error',
        requestId: req.id
      });
    };
    ```
  - Use these standardized error formats across all API endpoints

- [ ] **Ensure sensitive data is not exposed in logs or error messages**:

  - Create a data sanitization function in `/apps/backend/utils/sanitize.ts`:
    ```typescript
    const SENSITIVE_FIELDS = ['password', 'token', 'secret', 'apiKey'];
    
    export function sanitizeData(data) {
      if (!data) return data;
      
      const sanitized = { ...data };
      
      // Recursively sanitize objects
      for (const key in sanitized) {
        if (SENSITIVE_FIELDS.includes(key.toLowerCase())) {
          sanitized[key] = '[REDACTED]';
        } else if (typeof sanitized[key] === 'object') {
          sanitized[key] = sanitizeData(sanitized[key]);
        }
      }
      
      return sanitized;
    }
    ```
  - Apply sanitization before logging any request bodies or error details
  - Configure logging libraries to exclude sensitive headers by default
  - Add tests specifically for log sanitization

- [ ] **Add correlation IDs for request tracing**:

  - Create middleware to generate and propagate correlation IDs:
    ```typescript
    import { v4 as uuidv4 } from 'uuid';
    
    export const correlationMiddleware = (req, res, next) => {
      // Use existing correlation ID from headers or generate new one
      req.correlationId = req.headers['x-correlation-id'] || uuidv4();
      
      // Add to response headers
      res.setHeader('X-Correlation-ID', req.correlationId);
      
      // Attach to logger context
      req.log = logger.child({ correlationId: req.correlationId });
      
      next();
    };
    ```
  - Update frontend API client to extract and propagate correlation IDs
  - Include correlation ID in all log entries
  - Document correlation ID format in API documentation

## 9. CI/CD Pipeline Enhancements

- [ ] **Add SAST (Static Application Security Testing)**:

  - Add SonarQube scanning to your GitHub workflow:
    ```yaml
    name: SonarQube Analysis
    on:
      push:
        branches: [main, develop]
      pull_request:
        types: [opened, synchronize, reopened]
    
    jobs:
      sonarqube:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
            with:
              fetch-depth: 0
          - uses: actions/setup-node@v4
            with:
              node-version: '18'
          - name: Install dependencies
            run: pnpm install
          - name: Run tests with coverage
            run: pnpm test -- --coverage
          - name: SonarQube Scan
            uses: SonarSource/sonarqube-scan-action@master
            env:
              SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}
              SONAR_HOST_URL: ${{ secrets.SONAR_HOST_URL }}
    ```
  - Create a `sonar-project.properties` file in your project root:
    ```properties
    sonar.projectKey=calculator-app
    sonar.projectName=Calculator App
    sonar.sources=apps,packages
    sonar.tests=apps/*/tests,packages/*/tests
    sonar.javascript.lcov.reportPaths=**/coverage/lcov.info
    sonar.sourceEncoding=UTF-8
    sonar.exclusions=node_modules/**,**/*.test.ts,**/*.test.tsx
    ```
  - Configure security-focused ESLint rules:
    ```json
    {
      "extends": [
        "eslint:recommended",
        "plugin:security/recommended"
      ],
      "plugins": [
        "security"
      ]
    }
    ```

- [ ] **Implement secret scanning in CI**:

  - Add Gitleaks to your workflows:
    ```yaml
    name: Secret Scanning
    on: [push, pull_request]
    
    jobs:
      gitleaks:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v4
            with:
              fetch-depth: 0
          - name: Run Gitleaks
            uses: zricethezav/gitleaks-action@master
            with:
              config-path: .gitleaks.toml
    ```
  - Create a `.gitleaks.toml` configuration file:
    ```toml
    [allowlist]
    paths = [
      "(.*?)(test|spec)\\.(js|jsx|ts|tsx)$",
      "node_modules/",
      ".github/workflows/"
    ]
    
    [[rules]]
    description = "AWS Access Key"
    regex = '''(A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}'''
    
    [[rules]]
    description = "JWT Token"
    regex = '''eyJ[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$'''
    ```
  - Add a pre-commit hook for local development:
    ```shell
    #!/bin/sh
    # .git/hooks/pre-commit
    
    if ! command -v gitleaks &> /dev/null; then
      echo "Gitleaks not found. Please install it: brew install gitleaks"
      exit 1
    fi
    
    gitleaks protect --staged
    ```

- [ ] **Update Trivy to scan dependencies**:

  - Enhance your existing Trivy workflow:
    ```yaml
    - name: Run Trivy vulnerability scanner
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'table'
        exit-code: '1'
        ignore-unfixed: true
        severity: 'CRITICAL,HIGH'
    ```
  - Add dependency scanning for Node.js projects:
    ```yaml
    - name: Run npm audit
      run: pnpm audit --audit-level=high
      continue-on-error: true
    ```
  - Create a vulnerability exceptions list to handle false positives:
    ```yaml
    - name: Run Trivy with allowlist
      uses: aquasecurity/trivy-action@master
      with:
        scan-type: 'fs'
        scan-ref: '.'
        format: 'json'
        output: 'trivy-results.json'
        ignore-file: '.trivyignore'
    ```

- [ ] **Add end-to-end testing in pipeline**:

  - Install Cypress: `pnpm add -D cypress @testing-library/cypress`
  - Create Cypress E2E tests in `/apps/frontend/cypress/e2e/calculator.cy.js`:
    ```javascript
    describe('Calculator Application', () => {
      beforeEach(() => {
        cy.visit('/');
      });
    
      it('performs basic arithmetic operations', () => {
        // Addition
        cy.get('#a').type('5');
        cy.get('#b').type('3');
        cy.get('#op').select('+');
        cy.contains('button', 'Submit!').click();
        cy.contains('8');
    
        // Multiplication
        cy.get('#op').select('*');
        cy.contains('button', 'Submit!').click();
        cy.contains('15');
      });
    
      it('handles edge cases gracefully', () => {
        // Division by zero
        cy.get('#a').type('5');
        cy.get('#b').type('0');
        cy.get('#op').select('/');
        cy.contains('button', 'Submit!').click();
        cy.contains('Error');
      });
    });
    ```
  - Add Cypress to your workflow:
    ```yaml
    - name: Run E2E Tests
      uses: cypress-io/github-action@v6
      with:
        start: pnpm dev
        wait-on: 'http://localhost:3000'
        wait-on-timeout: 120
    ```

- [ ] **Implement environment promotion strategy**:

  - Create environment-specific configurations:
    ```yaml
    name: Deployment Pipeline
    
    on:
      push:
        branches: [main, develop]
    
    jobs:
      test:
        # Testing job configuration
    
      deploy-to-dev:
        needs: [test]
        if: github.ref == 'refs/heads/develop'
        environment: development
        # Deploy to dev configuration
    
      deploy-to-staging:
        needs: [deploy-to-dev]
        if: github.ref == 'refs/heads/main'
        environment: staging
        # Deploy to staging configuration
    
      manual-approval:
        needs: [deploy-to-staging]
        runs-on: ubuntu-latest
        environment: production-approval
        steps:
          - name: Manual approval step
            run: echo "Deployment to production approved"
    
      deploy-to-production:
        needs: [manual-approval]
        environment: production
        # Deploy to production configuration
    ```
  - Configure environment-specific variables in GitHub:
    - Settings > Environments > New environment
    - Add environment variables and secrets for each environment
  - Implement blue/green deployment for zero-downtime:
    ```yaml
    deploy-blue-green:
      steps:
        - name: Deploy to new environment
          # Deploy to inactive environment (blue or green)
        - name: Run smoke tests
          # Validate new deployment
        - name: Switch traffic
          # Update router to point to new environment
        - name: Monitor for issues
          # Check for errors after switch
    ```

## 10. Container Security

- [ ] **Use distroless or minimal base images**:

  - Update Dockerfiles to use lighter alternatives:
    ```dockerfile
    # Before
    FROM node:18
    
    # After
    FROM node:18-alpine
    ```
  - Implement multi-stage builds to reduce final image size:
    ```dockerfile
    # Build stage
    FROM node:18 AS builder
    WORKDIR /app
    COPY package.json pnpm-lock.yaml ./
    RUN npm install -g pnpm && pnpm install --frozen-lockfile
    COPY . .
    RUN pnpm run build
    
    # Production stage
    FROM node:18-alpine
    WORKDIR /app
    COPY --from=builder /app/node_modules ./node_modules
    COPY --from=builder /app/dist ./dist
    COPY package.json ./
    
    # Only install production dependencies
    RUN npm install --omit=dev
    
    USER node
    CMD ["node", "dist/main.js"]
    ```
  - Remove unnecessary tools and packages from the final image
  - Scan images for size optimization opportunities using tools like `dive`

- [ ] **Implement non-root user for container execution**:

  - Modify Dockerfiles to use a dedicated user:
    ```dockerfile
    # Create a non-root user and set ownership
    RUN addgroup -S appgroup && adduser -S appuser -G appgroup
    RUN mkdir -p /app/data && chown -R appuser:appgroup /app
    
    # Switch to non-root user
    USER appuser
    ```
  - Set appropriate file permissions for application directories:
    ```dockerfile
    COPY --chown=appuser:appgroup . .
    ```
  - Test container functionality with reduced privileges
  - Update the CI/CD pipeline to verify containers run as non-root

- [ ] **Add container image signing**:

  - Install Cosign for image signing:
    ```shell
    brew install cosign
    ```
  - Generate signing keys (in secure storage):
    ```shell
    cosign generate-key-pair
    ```
  - Add signing step to your GitHub workflow:
    ```yaml
    - name: Sign container image
      uses: sigstore/cosign-installer@main
    - name: Sign the images
      run: |
        cosign sign --key cosign.key \
          ghcr.io/${{ github.repository_owner }}/test-mono-repo/frontend:${{ env.VERSION }}
      env:
        COSIGN_PASSWORD: ${{ secrets.COSIGN_PASSWORD }}
    ```
  - Configure signature verification during deployment:
    ```yaml
    - name: Verify image signature
      run: |
        cosign verify --key cosign.pub \
          ghcr.io/${{ github.repository_owner }}/test-mono-repo/frontend:${{ env.VERSION }}
    ```
  - Document key management process for the team

- [ ] **Implement least privilege principle for container permissions**:

  - Configure security contexts in Kubernetes deployment files:
    ```yaml
    securityContext:
      runAsNonRoot: true
      runAsUser: 1000
      runAsGroup: 1000
      readOnlyRootFilesystem: true
      allowPrivilegeEscalation: false
      capabilities:
        drop:
          - ALL
    ```
  - Disable privileged mode and root execution
  - Use read-only file systems where possible:
    ```yaml
    # Define specific writeable paths as volumes
    volumeMounts:
      - name: tmp-volume
        mountPath: /tmp
      - name: cache-volume
        mountPath: /app/cache
    ```
  - Create application-specific security policies using Pod Security Policies or OPA Gatekeeper

- [ ] **Create Docker best practices documentation**:

  - Create a `DOCKER.md` file with security standards:
    ```markdown
    # Docker Security Best Practices
    
    ## Building Secure Images
    - Always use specific version tags, never `latest`
    - Use multi-stage builds to minimize image size
    - Scan images for vulnerabilities with Trivy
    - Never include secrets or credentials in images
    
    ## Runtime Security
    - Always run containers as non-root users
    - Use read-only file systems when possible
    - Limit container capabilities and resources
    - Implement network policies for container communication
    
    ## Environment Configuration
    - Use environment variables for configuration
    - Store secrets in a dedicated secret manager
    - Implement proper logging and monitoring
    ```
  - Create secure Dockerfile templates for different application types
  - Document image scanning policies and requirements
  - Add guidelines for managing secrets in containers using external vaults

## 11. Testing Coverage

- [ ] **Increase unit test coverage to >80%**:

  - Configure Jest with coverage thresholds in `jest.config.js`:
    ```javascript
    module.exports = {
      collectCoverage: true,
      coverageThreshold: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        },
        './apps/frontend/lib/': {
          branches: 90,
          functions: 90,
          lines: 90
        }
      },
      coverageReporters: ['text', 'lcov', 'html'],
      // other config...
    };
    ```
  - Create unit tests for `calculate.ts` in `calculate.test.ts`:
    ```typescript
    import fetchCalculation from '../lib/calculate';
    import axios from 'axios';
    
    jest.mock('axios');
    const mockedAxios = axios as jest.Mocked<typeof axios>;
    
    describe('fetchCalculation', () => {
      beforeEach(() => {
        jest.resetAllMocks();
        process.env.NEXT_PUBLIC_API_URL = 'http://test-api.com';
      });
      
      it('should call API and return result when API is available', async () => {
        mockedAxios.post.mockResolvedValueOnce({ data: 10, status: 200 });
        const result = await fetchCalculation(5, 5, '+');
        expect(result).toBe(10);
        expect(mockedAxios.post).toHaveBeenCalledWith(
          'http://test-api.com',
          { a: 5, b: 5, op: '+' },
          expect.any(Object)
        );
      });
      
      it('should fall back to local calculation when API fails', async () => {
        mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));
        const result = await fetchCalculation(5, 5, '+');
        expect(result).toBe(10);
      });
      
      // Add test cases for all operations and edge cases
    });
    ```
  - Add additional tests for edge cases and error handling:
    - Division by zero
    - Very large numbers
    - Invalid operations
    - Network timeouts

- [ ] **Implement integration tests for API endpoints**:

  - Create API integration tests in `/apps/backend/tests/integration/`:
    ```typescript
    import request from 'supertest';
    import app from '../../src/app';
    
    describe('Calculator API Integration Tests', () => {
      it('successfully calculates addition', async () => {
        const response = await request(app)
          .post('/api/calculate')
          .send({ a: 5, b: 3, op: '+' })
          .expect(200);
          
        expect(response.body).toBe(8);
      });
      
      it('validates input properly', async () => {
        await request(app)
          .post('/api/calculate')
          .send({ a: 'not-a-number', b: 3, op: '+' })
          .expect(400);
      });
      
      it('handles division by zero gracefully', async () => {
        const response = await request(app)
          .post('/api/calculate')
          .send({ a: 5, b: 0, op: '/' })
          .expect(200);
          
        expect(isNaN(response.body)).toBe(true);
      });
    });
    ```
  - Test all calculator operations with various inputs
  - Create integration tests for error handling middleware
  - Test rate limiting functionality

- [ ] **Add security-focused tests**:

  - Implement test for input validation and sanitization:
    ```typescript
    describe('Security Tests', () => {
      it('rejects XSS attempts in input', async () => {
        const response = await request(app)
          .post('/api/calculate')
          .send({ a: '<script>alert(1)</script>', b: 3, op: '+' })
          .expect(400);
          
        expect(response.body.error).toBeDefined();
      });
      
      it('prevents SQL injection attempts', async () => {
        const response = await request(app)
          .post('/api/calculate')
          .send({ a: 5, b: 3, op: "' OR 1=1; --" })
          .expect(400);
          
        expect(response.body.error).toBeDefined();
      });
    });
    ```
  - Add authentication bypass tests (if authentication is implemented)
  - Create fuzzing tests for calculator inputs using tools like `fast-check`:
    ```typescript
    import fc from 'fast-check';
    
    describe('Property-based Fuzzing Tests', () => {
      it('should handle arbitrary inputs safely', async () => {
        await fc.assert(
          fc.asyncProperty(
            fc.anything(), fc.anything(), fc.string(),
            async (a, b, op) => {
              const response = await request(app)
                .post('/api/calculate')
                .send({ a, b, op });
                
              // Should either return 200 with valid result or 400 with error
              expect([200, 400]).toContain(response.status);
            }
          ),
          { numRuns: 100 }
        );
      });
    });
    ```

- [ ] **Implement contract testing between frontend and backend**:

  - Install Pact for contract testing: `pnpm add -D @pact-foundation/pact`
  - Define consumer contract in frontend:
    ```typescript
    import { Pact } from '@pact-foundation/pact';
    import fetchCalculation from '../lib/calculate';
    import axios from 'axios';
    
    describe('Calculator API Contract', () => {
      const provider = new Pact({
        consumer: 'Calculator-Frontend',
        provider: 'Calculator-API',
        port: 8888,
        log: './logs/pact.log',
        dir: './pacts'
      });
      
      beforeAll(() => provider.setup());
      afterAll(() => provider.finalize());
      
      describe('calculating addition', () => {
        beforeEach(() => {
          return provider.addInteraction({
            state: 'calculator is available',
            uponReceiving: 'a request to add two numbers',
            withRequest: {
              method: 'POST',
              path: '/',
              headers: { 'Content-Type': 'application/json' },
              body: { a: 2, b: 3, op: '+' }
            },
            willRespondWith: {
              status: 200,
              body: 5
            }
          });
        });
        
        it('returns the sum of two numbers', async () => {
          process.env.NEXT_PUBLIC_API_URL = `http://localhost:8888`;
          const result = await fetchCalculation(2, 3, '+');
          expect(result).toEqual(5);
        });
      });
    });
    ```
  - Implement provider verification in backend tests
  - Add contract tests to CI/CD pipeline

- [ ] **Create load/performance testing suite**:

  - Install k6 for load testing: `brew install k6`
  - Create a load test script in `/apps/backend/tests/performance/load-test.js`:
    ```javascript
    import http from 'k6/http';
    import { check, sleep } from 'k6';
    
    export const options = {
      stages: [
        { duration: '30s', target: 20 },   // Ramp up to 20 users
        { duration: '1m', target: 20 },    // Stay at 20 users for 1 minute
        { duration: '30s', target: 50 },   // Ramp up to 50 users
        { duration: '1m', target: 50 },    // Stay at 50 users for 1 minute
        { duration: '30s', target: 0 },    // Ramp down to 0 users
      ],
      thresholds: {
        'http_req_duration': ['p(95)<200'],  // 95% of requests must complete within 200ms
        'http_req_failed': ['rate<0.01'],    // Less than 1% of requests can fail
      },
    };
    
    export default function() {
      const operations = ['+', '-', '*', '/'];
      const op = operations[Math.floor(Math.random() * operations.length)];
      const a = Math.floor(Math.random() * 100);
      const b = op === '/' ? Math.floor(Math.random() * 99) + 1 : Math.floor(Math.random() * 100);
      
      const payload = JSON.stringify({ a, b, op });
      const params = {
        headers: { 'Content-Type': 'application/json' },
      };
      
      const res = http.post('http://localhost:3001/api/calculate', payload, params);
      
      check(res, {
        'status is 200': (r) => r.status === 200,
        'response time < 200ms': (r) => r.timings.duration < 200,
      });
      
      sleep(1);
    }
    ```
  - Add stress test to verify system behavior under extreme load:
    ```javascript
    export const options = {
      scenarios: {
        stress: {
          executor: 'ramping-arrival-rate',
          startRate: 10,             // Start at 10 iterations per second
          timeUnit: '1s',            // Time unit for the iteration rate
          preAllocatedVUs: 10,       // Initial pool of VUs
          maxVUs: 100,              // Maximum pool of VUs
          stages: [
            { duration: '1m', target: 50 },   // Ramp up to 50 iterations per second over 1 minute
            { duration: '2m', target: 50 },   // Stay at 50 iterations per second for 2 minutes
            { duration: '1m', target: 100 },  // Ramp up to 100 iterations per second over 1 minute
            { duration: '2m', target: 100 },  // Stay at 100 iterations per second for 2 minutes
            { duration: '1m', target: 0 },    // Ramp down to 0 iterations per second
          ],
        },
      },
      thresholds: {
        'http_req_duration': ['p(95)<500'],  // 95% of requests must complete within 500ms
        'http_req_failed': ['rate<0.05'],    // Less than 5% of requests can fail under stress
      },
    };
    ```
  - Create benchmarks for different calculator operations
  - Configure pipeline to run load tests in a staging environment

## 12. Performance Optimization

- [ ] **Implement proper caching strategies**:

  - Add Redis for API response caching:
    ```typescript
    // Install redis client
    // pnpm add redis
    
    // In /apps/backend/services/cache.ts
    import { createClient } from 'redis';
    
    const redisClient = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379'
    });
    
    redisClient.on('error', (err) => console.log('Redis Client Error', err));
    
    await redisClient.connect();
    
    export async function getFromCache(key: string): Promise<string | null> {
      return await redisClient.get(key);
    }
    
    export async function setInCache(key: string, value: string, expirySeconds = 3600): Promise<void> {
      await redisClient.set(key, value, { EX: expirySeconds });
    }
    ```
  
  - Create a caching middleware for calculation results:
    ```typescript
    // In /apps/backend/middleware/calculationCache.ts
    import { getFromCache, setInCache } from '../services/cache';
    
    export async function calculationCacheMiddleware(req, res, next) {
      const { a, b, op } = req.body;
      const cacheKey = `calc:${a}:${op}:${b}`;
      
      try {
        const cachedResult = await getFromCache(cacheKey);
        
        if (cachedResult) {
          return res.json(JSON.parse(cachedResult));
        }
        
        // Store original res.json method
        const originalJson = res.json;
        
        // Override the res.json method to cache the response
        res.json = function(data) {
          setInCache(cacheKey, JSON.stringify(data), 86400); // Cache for 24 hours
          return originalJson.call(this, data);
        };
        
        next();
      } catch (error) {
        console.error('Cache error:', error);
        next(); // Continue without caching on error
      }
    }
    ```
  
  - Configure browser caching with appropriate headers:
    ```typescript
    // In Next.js middleware or API route handlers
    export function middleware(req) {
      const res = NextResponse.next();
      
      // Set caching headers for static assets
      if (req.nextUrl.pathname.match(/\.(js|css|png|jpg|jpeg|gif|webp)$/)) {
        res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      }
      
      return res;
    }
    ```
  
  - Implement cache invalidation strategy for algorithm updates
  - Add cache warm-up for common calculations during server startup

- [ ] **Add compression for API responses**:

  - Install compression middleware:
    ```bash
    pnpm add compression
    ```
  
  - Configure in Express backend:
    ```typescript
    // In /apps/backend/server.ts
    import compression from 'compression';
    
    // Only compress responses larger than 1KB
    app.use(compression({
      threshold: 1024,
      filter: (req, res) => {
        // Don't compress responses with this request header
        if (req.headers['x-no-compression']) {
          return false;
        }
        
        // Use compression filter function
        return compression.filter(req, res);
      },
      level: 6 // Compression level (0-9, where 9 is best compression but slowest)
    }));
    ```
  
  - Verify content encoding headers in responses
  - Test bandwidth improvements using tools like Lighthouse
  - Configure compression level based on content type

- [ ] **Optimize frontend bundle size**:

  - Add bundle analyzer to Next.js:
    ```bash
    pnpm add -D @next/bundle-analyzer
    ```
  
  - Configure in next.config.js:
    ```javascript
    // In next.config.js
    const withBundleAnalyzer = require('@next/bundle-analyzer')({
      enabled: process.env.ANALYZE === 'true',
    });
    
    module.exports = withBundleAnalyzer({
      // Your Next.js config
    });
    ```
  
  - Run analysis and identify large dependencies:
    ```bash
    ANALYZE=true pnpm build
    ```
  
  - Optimize imports by using specific imports instead of full libraries:
    ```typescript
    // Before
    import _ from 'lodash';
    
    // After
    import debounce from 'lodash/debounce';
    ```
  
  - Configure tree shaking in your build process:
    ```javascript
    // In webpack config
    module.exports = {
      optimization: {
        usedExports: true,
        sideEffects: true,
      }
    };
    ```
  
  - Optimize images using Next.js Image component

- [ ] **Implement code splitting and lazy loading**:

  - Use dynamic imports for non-critical components:
    ```typescript
    // In /apps/frontend/components/ComplexFeature.tsx
    import dynamic from 'next/dynamic';
    
    const DynamicCalculatorHistory = dynamic(
      () => import('./CalculatorHistory'),
      {
        loading: () => <p>Loading history...</p>,
        ssr: false // If this component doesn't need server-side rendering
      }
    );
    
    export default function ComplexFeature() {
      return (
        <div>
          <h2>Calculator</h2>
          <DynamicCalculatorHistory />
        </div>
      );
    }
    ```
  
  - Implement React.lazy and Suspense for component-level code splitting:
    ```typescript
    // In a React component
    import React, { Suspense, lazy } from 'react';
    
    const LazyAdvancedCalculator = lazy(() => import('./AdvancedCalculator'));
    
    function Calculator() {
      const [showAdvanced, setShowAdvanced] = useState(false);
      
      return (
        <div>
          <button onClick={() => setShowAdvanced(true)}>Show Advanced</button>
          
          {showAdvanced && (
            <Suspense fallback={<div>Loading advanced features...</div>}>
              <LazyAdvancedCalculator />
            </Suspense>
          )}
        </div>
      );
    }
    ```
  
  - Configure route-based code splitting in Next.js (automatic)
  - Use prefetching for anticipated user paths:
    ```typescript
    // In /apps/frontend/components/Navigation.tsx
    import Link from 'next/link';
    
    export default function Navigation() {
      return (
        <nav>
          <Link href="/" prefetch={true}>Home</Link>
          <Link href="/calculator" prefetch={true}>Calculator</Link>
        </nav>
      );
    }
    ```
  
  - Track and measure improvements in initial load time

- [ ] **Add performance monitoring and alerting**:

  - Implement Web Vitals tracking in Next.js:
    ```typescript
    // In /apps/frontend/pages/_app.tsx
    import { useEffect } from 'react';
    import { useRouter } from 'next/router';
    import * as gtag from '../lib/gtag'; // Analytics
    import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';
    
    function sendWebVitals({ id, name, label, value }) {
      gtag.event(name, {
        event_category: label === 'web-vital' ? 'Web Vitals' : 'Custom Metric',
        event_label: id,
        value: Math.round(name === 'CLS' ? value * 1000 : value),
        non_interaction: true,
      });
    }
    
    export default function App({ Component, pageProps }) {
      const router = useRouter();
      
      useEffect(() => {
        getCLS(sendWebVitals);
        getFID(sendWebVitals);
        getLCP(sendWebVitals);
        getFCP(sendWebVitals);
        getTTFB(sendWebVitals);
      }, []);
      
      return <Component {...pageProps} />;
    }
    ```
  
  - Set up server-side performance metrics with prom-client:
    ```typescript
    // In /apps/backend/services/metrics.ts
    import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';
    
    // Collect default Node.js metrics
    collectDefaultMetrics({ register });
    
    // Custom metrics
    export const calculationCounter = new Counter({
      name: 'calculator_operations_total',
      help: 'Total number of calculator operations',
      labelNames: ['operation'],
    });
    
    export const calculationDuration = new Histogram({
      name: 'calculator_operation_duration_seconds',
      help: 'Duration of calculator operations in seconds',
      labelNames: ['operation'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 10],
    });
    
    // Add metrics endpoint
    export const metricsMiddleware = async (req, res) => {
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    };
    ```
  
  - Use middleware to track operation performance:
    ```typescript
    // In calculation controller
    import { calculationCounter, calculationDuration } from '../services/metrics';
    
    export function calculateResult(req, res) {
      const { a, b, op } = req.body;
      
      // Track number of operations
      calculationCounter.inc({ operation: op });
      
      // Track operation duration
      const end = calculationDuration.startTimer({ operation: op });
      
      try {
        // Perform calculation
        const result = performCalculation(a, b, op);
        
        // End timer
        end();
        
        return res.json(result);
      } catch (error) {
        // End timer even on error
        end();
        throw error;
      }
    }
    ```
  
  - Configure alerting rules based on performance thresholds
  - Set up real user monitoring (RUM) with tools like New Relic or Sentry

## 13. Documentation

- [ ] **Create comprehensive API documentation**:

  - Implement OpenAPI/Swagger for backend API:
    ```typescript
    // In /apps/backend/server.ts
    import swaggerJsDoc from 'swagger-jsdoc';
    import swaggerUi from 'swagger-ui-express';
    
    const swaggerOptions = {
      definition: {
        openapi: '3.0.0',
        info: {
          title: 'Calculator API',
          version: '1.0.0',
          description: 'A simple calculator API',
        },
        servers: [
          {
            url: process.env.API_URL || 'http://localhost:3001',
            description: 'Development server',
          },
        ],
      },
      apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
    };
    
    const swaggerDocs = swaggerJsDoc(swaggerOptions);
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));
    ```
  
  - Add detailed route annotations:
    ```typescript
    // In /apps/backend/controllers/calculatorController.ts
    
    /**
     * @swagger
     * /api/calculate:
     *   post:
     *     summary: Performs a calculation operation
     *     tags: [Calculations]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - a
     *               - b
     *               - op
     *             properties:
     *               a:
     *                 type: number
     *                 description: First operand
     *               b:
     *                 type: number
     *                 description: Second operand
     *               op:
     *                 type: string
     *                 enum: ['+', '-', '*', '/', '^']
     *                 description: Operation to perform
     *     responses:
     *       200:
     *         description: Calculation result
     *         content:
     *           application/json:
     *             schema:
     *               type: number
     *       400:
     *         description: Invalid input parameters
     *       500:
     *         description: Server error
     */
    export const calculateResult = async (req, res) => {
      // Implementation...
    };
    ```
  
  - Document error codes and handling patterns in a central location:
    ```typescript
    // In /apps/backend/docs/errorCodes.ts
    export const ERROR_CODES = {
      INVALID_INPUT: {
        code: 'E1001',
        message: 'Invalid input parameters',
        httpStatus: 400,
      },
      DIVISION_BY_ZERO: {
        code: 'E1002',
        message: 'Division by zero',
        httpStatus: 400,
      },
      SERVER_ERROR: {
        code: 'E9999',
        message: 'Internal server error',
        httpStatus: 500,
      },
    };
    ```
  
  - Create a documentation website with Docusaurus:
    ```bash
    # Install Docusaurus CLI
    pnpm add -g @docusaurus/cli
    
    # Create a new Docusaurus site
    cd docs
    docusaurus init
    
    # Set up documentation sections
    mkdir -p docs/api docs/guides docs/examples
    ```

- [ ] **Add inline code documentation standards**:

  - Define JSDoc standards in a `.jsdoc.json` file:
    ```json
    {
      "tags": {
        "allowUnknownTags": true
      },
      "source": {
        "include": ["./apps", "./packages"],
        "includePattern": "\\.ts$",
        "excludePattern": "(node_modules/|tests/|dist/)"
      },
      "plugins": ["plugins/markdown"],
      "opts": {
        "template": "node_modules/docdash",
        "encoding": "utf8",
        "destination": "./docs/api",
        "recurse": true,
        "verbose": true
      },
      "templates": {
        "cleverLinks": false,
        "monospaceLinks": false
      }
    }
    ```
  
  - Add detailed comments for complex calculation logic:
    ```typescript
    /**
     * Calculates the result of an operation between two numbers
     * 
     * @param {number} a - First operand
     * @param {number} b - Second operand
     * @param {string} op - Operation to perform ('+', '-', '*', '/', '^')
     * @returns {number} The calculation result
     * @throws {Error} If the operation is not supported
     * @throws {Error} If division by zero is attempted
     * 
     * @example
     * // Returns 8
     * calculate(5, 3, '+')
     * 
     * @example
     * // Returns 2
     * calculate(6, 3, '/')
     */
    function calculate(a: number, b: number, op: string): number {
      // Implementation...
    }
    ```
  
  - Generate documentation website using TypeDoc:
    ```bash
    # Install TypeDoc
    pnpm add -D typedoc
    
    # Add documentation script to package.json
    # "scripts": {
    #   "docs": "typedoc --out docs/api src"
    # }
    
    # Generate documentation
    pnpm docs
    ```
  
  - Create documentation contribution guide in `CONTRIBUTING.md`:
    ```markdown
    # Documentation Contribution Guide
    
    ## Code Documentation Standards
    
    - All public functions must have JSDoc comments
    - Document parameters, return values, and exceptions
    - Provide usage examples for non-trivial functions
    - Document edge cases and limitations
    
    ## Example:
    
    ```typescript
    /**
     * Performs division with special handling for zero divisors
     * 
     * @param {number} dividend - Number to be divided
     * @param {number} divisor - Number to divide by
     * @returns {number} The quotient or NaN if divisor is zero
     */
    function safeDivide(dividend: number, divisor: number): number {
      return divisor === 0 ? NaN : dividend / divisor;
    }
    ```
    ```

- [ ] **Implement architectural decision records (ADRs)**:

  - Create an ADR template in `docs/adr/template.md`:
    ```markdown
    # [Title of the ADR]
    
    ## Date
    YYYY-MM-DD
    
    ## Status
    [Proposed, Accepted, Deprecated, Superseded]
    
    ## Context
    [Describe the context and problem statement that led to this decision]
    
    ## Decision
    [Describe the decision that was made]
    
    ## Consequences
    [Describe the resulting context after applying the decision]
    
    ## Alternatives Considered
    [Describe alternatives that were considered but not chosen]
    
    ## References
    [List any references, links, or resources that support this decision]
    ```
  
  - Document key architectural decisions:
    ```markdown
    # ADR-001: Calculator API Architecture
    
    ## Date
    2023-05-15
    
    ## Status
    Accepted
    
    ## Context
    We need a reliable and scalable architecture for our calculator application that supports both API-based and local calculations.
    
    ## Decision
    We will implement a microservices architecture with:
    - Frontend in Next.js with local calculation capabilities
    - Backend API for complex calculations
    - Redis cache for frequently used calculation results
    
    ## Consequences
    - Improved scalability and resilience
    - Better separation of concerns
    - Added complexity in deployment and monitoring
    - Need for API contract testing
    
    ## Alternatives Considered
    - Monolithic application: Rejected due to scalability concerns
    - Serverless functions: Rejected due to cold start latency issues
    ```
  
  - Add a script to create new ADRs:
    ```bash
    #!/bin/bash
    # docs/adr/create-adr.sh
    
    if [ -z "$1" ]; then
      echo "Usage: create-adr.sh <title>"
      exit 1
    fi
    
    title="$1"
    date=$(date +"%Y-%m-%d")
    filename="docs/adr/$(date +"%Y%m%d")_${title// /_}.md"
    
    cp docs/adr/template.md "$filename"
    sed -i "s/\[Title of the ADR\]/$title/g" "$filename"
    sed -i "s/YYYY-MM-DD/$date/g" "$filename"
    
    echo "Created ADR: $filename"
    ```

- [ ] **Create runbooks for common issues**:

  - Develop an incident response template in `docs/runbooks/incident-template.md`:
    ```markdown
    # [Incident Title]
    
    ## Problem Description
    [Brief description of the issue]
    
    ## Detection
    [How the issue is detected - alerts, logs, symptoms]
    
    ## Diagnosis Steps
    1. [First step to diagnose the issue]
    2. [Second step]
    3. [Additional steps as needed]
    
    ## Resolution Steps
    1. [First step to resolve the issue]
    2. [Second step]
    3. [Additional steps as needed]
    
    ## Prevention
    [Steps to prevent this issue in the future]
    
    ## Related Services
    [List of affected services]
    
    ## Contact Points
    [Who to contact for this type of issue]
    ```
  
  - Create a runbook for API connectivity issues:
    ```markdown
    # API Connectivity Issues
    
    ## Problem Description
    Frontend application cannot connect to backend calculation API.
    
    ## Detection
    - Frontend logs show network errors
    - Users report calculation failures
    - Monitoring shows 5xx errors or timeouts
    
    ## Diagnosis Steps
    1. Check if API service is running (`kubectl get pods` or service dashboard)
    2. Verify network connectivity (`curl` from a pod in the same network)
    3. Check logs for API service (`kubectl logs <pod-name>` or log dashboard)
    4. Verify environment configuration (API URLs, ports, credentials)
    5. Check for recent deployments or infrastructure changes
    
    ## Resolution Steps
    1. Restart API service if unresponsive: `kubectl rollout restart deployment calculator-api`
    2. Scale up if under heavy load: `kubectl scale deployment calculator-api --replicas=5`
    3. Fix any configuration issues detected during diagnosis
    4. If persistent, roll back to last known good version
    
    ## Prevention
    - Implement health checks and readiness probes
    - Set up auto-scaling based on load
    - Ensure proper network policies are in place
    - Implement circuit breakers for graceful failure
    
    ## Related Services
    - Frontend application
    - Calculator API service
    - Load balancer/ingress
    
    ## Contact Points
    - Primary: DevOps On-call (devops-oncall@company.com)
    - Secondary: Backend team lead (backend-lead@company.com)
    ```
  
  - Document rollback procedures in `docs/runbooks/deployment-rollback.md`
  - Create a troubleshooting guide for common calculation errors
  - Add a monitoring dashboard guide that links to runbooks

- [ ] **Document security practices and incident response**:

  - Create a security policy in `SECURITY.md`:
    ```markdown
    # Security Policy
    
    ## Reporting a Vulnerability
    
    If you discover a security vulnerability, please send an email to security@company.com.
    Please include:
    
    - Type of vulnerability
    - Steps to reproduce
    - Potential impact
    - Any suggested fixes if available
    
    ## Security Measures
    
    Our project implements the following security measures:
    
    - Input validation and sanitization
    - API rate limiting
    - HTTPS-only communication
    - Regular dependency updates
    - Vulnerability scanning in CI/CD
    
    ## Patch Policy
    
    - Critical vulnerabilities: 24-48 hours
    - High severity: 1 week
    - Medium severity: 2 weeks
    - Low severity: Next release cycle
    ```
  
  - Document security incident response procedures:
    ```markdown
    # Security Incident Response
    
    ## Severity Levels
    
    1. **Critical**: Data breach, unauthorized access to production systems
    2. **High**: Potential vulnerability that could lead to data exposure
    3. **Medium**: Security issue in non-production environments
    4. **Low**: Minor security concerns with limited impact
    
    ## Response Process
    
    ### 1. Identification and Reporting
    - Report incident to security@company.com
    - Security team assigns severity and creates incident record
    
    ### 2. Containment
    - Isolate affected systems
    - Block malicious IPs/users
    - Preserve evidence and logs
    
    ### 3. Eradication
    - Remove malicious code or unauthorized access
    - Patch vulnerabilities
    - Reset compromised credentials
    
    ### 4. Recovery
    - Restore systems to known good state
    - Verify security before returning to production
    - Monitor for any signs of persistent threats
    
    ### 5. Post-Incident
    - Conduct root cause analysis
    - Document lessons learned
    - Implement preventative measures
    ```
  
  - Add guidelines for secure code review:
    ```markdown
    # Secure Code Review Guidelines
    
    ## Security Focus Areas
    
    - **Input Validation**: Check that all user inputs are properly validated and sanitized
    - **Authentication**: Verify that authentication mechanisms are secure
    - **Authorization**: Ensure proper permission checks are in place
    - **Data Protection**: Check for proper encryption and data handling
    - **Logging**: Verify that sensitive data is not logged
    
    ## Review Checklist
    
    - [ ] User input is validated before use
    - [ ] Authentication tokens are securely handled
    - [ ] Authorization checks are in place for all endpoints
    - [ ] No secrets or credentials in code
    - [ ] Error handling doesn't expose sensitive information
    ```
  
  - Prepare security training materials
  - Document security contact information and escalation paths

## 14. Monitoring & Observability

- [ ] **Implement health check endpoints**:

  - Create basic health check endpoint for the backend API:
    ```typescript
    // In /apps/backend/controllers/healthController.ts
    import { redisClient } from '../services/cache';
    import { prisma } from '../services/database';
    
    export const healthCheck = async (req, res) => {
      const status = {
        status: 'ok',
        timestamp: new Date(),
        services: {
          redis: 'unknown',
          database: 'unknown',
        },
      };
    
      // Check Redis connection
      try {
        await redisClient.ping();
        status.services.redis = 'ok';
      } catch (error) {
        status.services.redis = 'error';
        status.status = 'degraded';
      }
    
      // Check database connection
      try {
        await prisma.$queryRaw`SELECT 1`;
        status.services.database = 'ok';
      } catch (error) {
        status.services.database = 'error';
        status.status = 'degraded';
      }
    
      const statusCode = status.status === 'ok' ? 200 : 503;
      return res.status(statusCode).json(status);
    };
    ```

  - Add health check routes:
    ```typescript
    // In /apps/backend/routes/healthRoutes.ts
    import express from 'express';
    import { healthCheck } from '../controllers/healthController';
    
    const router = express.Router();
    
    router.get('/health', healthCheck);
    router.get('/readiness', healthCheck); // For Kubernetes readiness probe
    router.get('/liveness', (req, res) => res.status(200).json({ status: 'ok' })); // For Kubernetes liveness probe
    
    export default router;
    ```

  - Configure Kubernetes probes in deployment.yaml:
    ```yaml
    # In /k8s/backend-deployment.yaml
    livenessProbe:
      httpGet:
        path: /liveness
        port: 3001
      initialDelaySeconds: 30
      periodSeconds: 15
    readinessProbe:
      httpGet:
        path: /readiness
        port: 3001
      initialDelaySeconds: 10
      periodSeconds: 10
    ```

- [ ] **Add application metrics collection**:

  - Set up Prometheus client for Node.js backend:
    ```bash
    # Install dependencies
    pnpm add prom-client express-prom-bundle
    ```

  - Configure metrics middleware:
    ```typescript
    // In /apps/backend/services/metrics.ts
    import promClient from 'prom-client';
    
    // Create a Registry to register metrics
    export const register = new promClient.Registry();
    
    // Add default metrics (CPU, memory, etc.)
    promClient.collectDefaultMetrics({ register });
    
    // Create custom metrics
    export const httpRequestDuration = new promClient.Histogram({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status'],
      buckets: [0.1, 0.5, 1, 2, 5],
    });
    
    export const calculationCounter = new promClient.Counter({
      name: 'calculator_operations_total',
      help: 'Total calculator operations',
      labelNames: ['operation'],
    });
    
    export const calculationDuration = new promClient.Histogram({
      name: 'calculator_operation_duration_seconds',
      help: 'Duration of calculator operations in seconds',
      labelNames: ['operation'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1],
    });
    
    // Register custom metrics
    register.registerMetric(httpRequestDuration);
    register.registerMetric(calculationCounter);
    register.registerMetric(calculationDuration);
    ```

  - Set up metrics endpoint:
    ```typescript
    // In /apps/backend/routes/metricsRoutes.ts
    import express from 'express';
    import { register } from '../services/metrics';
    
    const router = express.Router();
    
    router.get('/metrics', async (req, res) => {
      res.setHeader('Content-Type', register.contentType);
      res.end(await register.metrics());
    });
    
    export default router;
    ```

  - Implement frontend monitoring with web-vitals:
    ```bash
    # Install web-vitals
    pnpm add web-vitals
    ```

  - Add reporting in frontend:
    ```typescript
    // In /apps/frontend/lib/vitals.ts
    import { ReportHandler } from 'web-vitals';
    
    const reportWebVitals = (onPerfEntry?: ReportHandler) => {
      if (onPerfEntry && onPerfEntry instanceof Function) {
        import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
          getCLS(onPerfEntry);
          getFID(onPerfEntry);
          getFCP(onPerfEntry);
          getLCP(onPerfEntry);
          getTTFB(onPerfEntry);
        });
      }
    };
    
    export default reportWebVitals;
    ```

  - Configure vitals reporting:
    ```typescript
    // In /apps/frontend/app/layout.tsx 
    import reportWebVitals from '../lib/vitals';
    
    reportWebVitals((metric) => {
      // Send to analytics endpoint
      console.log(metric);
      fetch('/api/vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric),
      });
    });
    ```

  - Create a custom React hook for operation tracking:
    ```typescript
    // In /apps/frontend/hooks/useMetrics.ts
    import { useCallback } from 'react';
    
    export const useMetrics = () => {
      const trackCalculation = useCallback((operation: string, duration: number) => {
        // Send metrics to backend
        fetch('/api/metrics/calculation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ operation, duration }),
        }).catch((err) => console.error('Failed to report metrics:', err));
      }, []);
      
      return { trackCalculation };
    };
    ```

- [ ] **Setup alerting for critical service disruptions**:

  - Configure Prometheus AlertManager rules:
    ```yaml
    # In /monitoring/prometheus/rules.yml
    groups:
    - name: calculator-alerts
      rules:
      - alert: HighErrorRate
        expr: sum(rate(http_request_duration_seconds_count{status=~"5.."}[5m])) / sum(rate(http_request_duration_seconds_count[5m])) > 0.05
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "High Error Rate Detected"
          description: "More than 5% of requests are failing with 5xx errors."
          
      - alert: SlowResponseTime
        expr: histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)) > 2
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Slow Response Time"
          description: "95th percentile response time is over 2 seconds."
          
      - alert: HighCPUUsage
        expr: process_cpu_seconds_total > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU Usage"
          description: "CPU usage is above 80%."
    ```

  - Set up notification channels in AlertManager:
    ```yaml
    # In /monitoring/alertmanager/config.yml
    global:
      resolve_timeout: 5m
    
    route:
      group_by: ['alertname', 'severity']
      group_wait: 30s
      group_interval: 5m
      repeat_interval: 4h
      receiver: 'slack-notifications'
      routes:
      - match:
          severity: critical
        receiver: 'pager-duty-critical'
    
    receivers:
    - name: 'slack-notifications'
      slack_configs:
      - api_url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
        channel: '#monitoring-alerts'
        send_resolved: true
        title: "{{ .CommonAnnotations.summary }}"
        text: "{{ .CommonAnnotations.description }}"
    
    - name: 'pager-duty-critical'
      pagerduty_configs:
      - service_key: 'your-pagerduty-service-key'
        description: "{{ .CommonAnnotations.summary }}"
        details: "{{ .CommonAnnotations.description }}"
    ```

  - Create a Docker Compose setup for local monitoring:
    ```yaml
    # In /docker-compose.monitoring.yml
    version: '3'
    
    services:
      prometheus:
        image: prom/prometheus:latest
        volumes:
          - ./monitoring/prometheus:/etc/prometheus
        ports:
          - "9090:9090"
        command:
          - '--config.file=/etc/prometheus/prometheus.yml'
          - '--storage.tsdb.path=/prometheus'
          - '--web.console.libraries=/etc/prometheus/console_libraries'
          - '--web.console.templates=/etc/prometheus/consoles'
          - '--web.enable-lifecycle'
    
      alertmanager:
        image: prom/alertmanager:latest
        volumes:
          - ./monitoring/alertmanager:/etc/alertmanager
        ports:
          - "9093:9093"
        command:
          - '--config.file=/etc/alertmanager/config.yml'
          - '--storage.path=/alertmanager'
    
      grafana:
        image: grafana/grafana:latest
        volumes:
          - ./monitoring/grafana/provisioning:/etc/grafana/provisioning
          - grafana-data:/var/lib/grafana
        ports:
          - "3003:3000"
        environment:
          - GF_SECURITY_ADMIN_PASSWORD=secret
    
    volumes:
      grafana-data: {}
    ```

- [ ] **Implement distributed tracing**:

  - Install OpenTelemetry packages:
    ```bash
    pnpm add @opentelemetry/api @opentelemetry/sdk-node @opentelemetry/auto-instrumentations-node @opentelemetry/exporter-trace-otlp-http
    ```

  - Set up tracing initialization:
    ```typescript
    // In /apps/backend/services/tracing.ts
    import { NodeSDK } from '@opentelemetry/sdk-node';
    import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
    import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
    
    export function initTracing() {
      const exporter = new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://jaeger:4318/v1/traces',
      });
    
      const sdk = new NodeSDK({
        traceExporter: exporter,
        instrumentations: [getNodeAutoInstrumentations()],
        serviceName: 'calculator-backend',
      });
    
      sdk.start();
    
      // Gracefully shut down SDK on process exit
      process.on('SIGTERM', () => {
        sdk.shutdown()
          .then(() => console.log('Tracing terminated'))
          .catch((error) => console.log('Error terminating tracing', error))
          .finally(() => process.exit(0));
      });
    
      return sdk;
    }
    ```

  - Add manual instrumentation for calculations:
    ```typescript
    // In /apps/backend/controllers/calculatorController.ts
    import { trace } from '@opentelemetry/api';
    
    export const calculateResult = async (req, res) => {
      const { a, b, op } = req.body;
    
      // Create a span for this calculation
      const tracer = trace.getTracer('calculator-api');
      const span = tracer.startSpan(`calculate_${op}`);
      
      // Add attributes to the span
      span.setAttributes({
        'calculation.operand_a': a,
        'calculation.operand_b': b,
        'calculation.operation': op,
      });
    
      try {
        // Perform calculation
        const result = performCalculation(a, b, op);
    
        // Add result to span
        span.setAttributes({ 'calculation.result': result });
        span.end();
    
        return res.json(result);
      } catch (error) {
        // Record error in span
        span.recordException(error);
        span.setStatus({ code: SpanStatusCode.ERROR, message: error.message });
        span.end();
    
        throw error;
      }
    };
    ```

  - Add tracing for frontend:
    ```typescript
    // In /apps/frontend/lib/tracing.ts
    import { trace, context, propagation } from '@opentelemetry/api';
    
    export const traceFetch = async (url, options) => {
      const tracer = trace.getTracer('calculator-frontend');
      
      return tracer.startActiveSpan(`FETCH ${url}`, async (span) => {
        try {
          const carrier = {};
          propagation.inject(context.active(), carrier);
          
          const headers = {
            ...options?.headers,
            ...carrier
          };
          
          const response = await fetch(url, {
            ...options,
            headers
          });
          
          span.setAttributes({
            'http.status_code': response.status,
            'http.url': url,
            'http.method': options?.method || 'GET',
          });
          
          return response;
        } catch (error) {
          span.recordException(error);
          throw error;
        } finally {
          span.end();
        }
      });
    };
    ```

  - Add Jaeger to Docker Compose for local development:
    ```yaml
    # Add to docker-compose.monitoring.yml
    jaeger:
      image: jaegertracing/all-in-one:latest
      ports:
        - "16686:16686" # UI
        - "4317:4317"   # OTLP gRPC
        - "4318:4318"   # OTLP HTTP
      environment:
        - COLLECTOR_OTLP_ENABLED=true
    ```

- [ ] **Create dashboards for key performance indicators**:

  - Set up Grafana dashboard for backend metrics:
    ```json
    // In /monitoring/grafana/provisioning/dashboards/calculator-backend.json
    {
      "annotations": {...},
      "editable": true,
      "gnetId": null,
      "graphTooltip": 0,
      "id": 1,
      "links": [],
      "panels": [
        {
          "aliasColors": {},
          "bars": false,
          "dashLength": 10,
          "dashes": false,
          "datasource": "Prometheus",
          "fieldConfig": {...},
          "fill": 1,
          "fillGradient": 0,
          "gridPos": {
            "h": 8,
            "w": 12,
            "x": 0,
            "y": 0
          },
          "hiddenSeries": false,
          "id": 2,
          "legend": {...},
          "lines": true,
          "linewidth": 1,
          "nullPointMode": "null",
          "options": {...},
          "percentage": false,
          "pointradius": 2,
          "points": false,
          "renderer": "flot",
          "seriesOverrides": [],
          "spaceLength": 10,
          "stack": false,
          "steppedLine": false,
          "targets": [
            {
              "expr": "sum(rate(calculator_operations_total[5m])) by (operation)",
              "interval": "",
              "legendFormat": "{{operation}}",
              "refId": "A"
            }
          ],
          "thresholds": [],
          "timeFrom": null,
          "timeRegions": [],
          "timeShift": null,
          "title": "Calculator Operations",
          "tooltip": {...},
          "type": "graph",
          "xaxis": {...},
          "yaxes": [...],
          "yaxis": {...}
        },
        {
          "aliasColors": {},
          "bars": false,
          "dashLength": 10,
          "dashes": false,
          "datasource": "Prometheus",
          "fieldConfig": {...},
          "fill": 1,
          "fillGradient": 0,
          "gridPos": {
            "h": 8,
            "w": 12,
            "x": 12,
            "y": 0
          },
          "hiddenSeries": false,
          "id": 3,
          "legend": {...},
          "lines": true,
          "linewidth": 1,
          "nullPointMode": "null",
          "options": {...},
          "percentage": false,
          "pointradius": 2,
          "points": false,
          "renderer": "flot",
          "seriesOverrides": [],
          "spaceLength": 10,
          "stack": false,
          "steppedLine": false,
          "targets": [
            {
              "expr": "histogram_quantile(0.95, sum(rate(calculator_operation_duration_seconds_bucket[5m])) by (le, operation))",
              "interval": "",
              "legendFormat": "{{operation}}",
              "refId": "A"
            }
          ],
          "thresholds": [],
          "timeFrom": null,
          "timeRegions": [],
          "timeShift": null,
          "title": "Operation Duration (p95)",
          "tooltip": {...},
          "type": "graph",
          "xaxis": {...},
          "yaxes": [...],
          "yaxis": {...}
        }
      ],
      "schemaVersion": 22,
      "style": "dark",
      "tags": [],
      "templating": {...},
      "time": {...},
      "timepicker": {...},
      "timezone": "",
      "title": "Calculator Backend Dashboard",
      "uid": "calculator-backend",
      "variables": {...},
      "version": 1
    }
    ```

  - Configure Grafana datasource:
    ```yaml
    # In /monitoring/grafana/provisioning/datasources/prometheus.yml
    apiVersion: 1
    
    datasources:
      - name: Prometheus
        type: prometheus
        access: proxy
        url: http://prometheus:9090
        isDefault: true
        editable: false
      
      - name: Jaeger
        type: jaeger
        access: proxy
        url: http://jaeger:16686
        editable: false
    ```

  - Create a script to set up monitoring stack:
    ```bash
    #!/bin/bash
    # In /scripts/setup-monitoring.sh
    
    echo "Setting up monitoring stack..."
    
    # Create directories if they don't exist
    mkdir -p monitoring/prometheus
    mkdir -p monitoring/alertmanager
    mkdir -p monitoring/grafana/provisioning/datasources
    mkdir -p monitoring/grafana/provisioning/dashboards
    
    # Copy config files
    cp templates/monitoring/prometheus/* monitoring/prometheus/
    cp templates/monitoring/alertmanager/* monitoring/alertmanager/
    cp templates/monitoring/grafana/provisioning/datasources/* monitoring/grafana/provisioning/datasources/
    cp templates/monitoring/grafana/provisioning/dashboards/* monitoring/grafana/provisioning/dashboards/
    
    # Start the monitoring stack
    docker-compose -f docker-compose.monitoring.yml up -d
    
    echo "Monitoring stack is up and running!"
    echo "Grafana: http://localhost:3003 (admin/secret)"
    echo "Prometheus: http://localhost:9090"
    echo "AlertManager: http://localhost:9093"
    echo "Jaeger: http://localhost:16686"
    ```

## 15. Accessibility Compliance

- [ ] **Perform accessibility audit**:

  - Install accessibility testing tools:
    ```bash
    # Install axe-core CLI for automated testing
    pnpm add -D @axe-core/cli
    
    # Install React accessibility tools
    pnpm add -D eslint-plugin-jsx-a11y
    ```

  - Add accessibility linting to ESLint configuration:
    ```json
    // In .eslintrc.json
    {
      "extends": [
        // ... other extends
        "plugin:jsx-a11y/recommended"
      ],
      "plugins": [
        // ... other plugins
        "jsx-a11y"
      ]
    }
    ```

  - Create an accessibility audit script:
    ```bash
    #!/bin/bash
    # In /scripts/a11y-audit.sh
    
    echo "Running accessibility audit..."
    
    # Run axe against deployed site
    npx axe-cli https://your-calculator-app.com --save a11y-report.json
    
    # Run lighthouse accessibility audit
    npx lighthouse https://your-calculator-app.com --only-categories=accessibility --output=json --output-path=./lighthouse-a11y-report.json
    
    echo "Accessibility audit complete. Reports saved to a11y-report.json and lighthouse-a11y-report.json"
    ```

  - Add audit script to package.json:
    ```json
    // In package.json
    "scripts": {
      "a11y:audit": "bash ./scripts/a11y-audit.sh",
      "a11y:test": "npx axe-cli http://localhost:3000"
    }
    ```

- [ ] **Implement WCAG 2.1 AA compliance**:

  - Ensure proper color contrast ratios:
    ```typescript
    // In /apps/frontend/styles/colors.ts
    export const colors = {
      // Ensure contrast ratio of at least 4.5:1 for normal text
      // and 3:1 for large text (18pt or 14pt bold)
      primary: '#0056b3',      // Dark blue
      secondary: '#6c757d',    // Medium gray
      background: '#ffffff',   // White
      text: '#212529',         // Very dark gray (nearly black)
      error: '#dc3545',        // Red
      success: '#28a745',      // Green
      focus: '#1a73e8',        // Bright blue for focus indicators
    };
    ```

  - Implement focus visible styles:
    ```css
    /* In /apps/frontend/styles/global.css */
    :focus {
      outline: 3px solid var(--focus-color);
      outline-offset: 2px;
    }
    
    /* Only hide focus for mouse/touch, keep for keyboard */
    :focus:not(:focus-visible) {
      outline: none;
    }
    
    :focus-visible {
      outline: 3px solid var(--focus-color);
      outline-offset: 2px;
    }
    ```

  - Make calculator interface responsive:
    ```typescript
    // In /apps/frontend/components/Calculator.tsx
    const Container = styled.div`
      width: 100%;
      max-width: 24rem;
      margin: 0 auto;
      padding: 1rem;
      
      @media (max-width: 768px) {
        padding: 0.5rem;
      }
    `;
    
    const Button = styled.button`
      font-size: 1.25rem;
      padding: 0.75rem;
      min-height: 3rem; /* Ensure touch target size is at least 44px */
      
      @media (max-width: 768px) {
        font-size: 1rem;
        padding: 0.5rem;
      }
    `;
    ```

  - Implement proper heading structure:
    ```tsx
    // In /apps/frontend/app/page.tsx
    return (
      <main>
        <h1>Calculator App</h1>
        <section aria-labelledby="calc-heading">
          <h2 id="calc-heading">Standard Calculator</h2>
          <Calculator />
        </section>
        {/* Additional sections would have their own headings */}
      </main>
    );
    ```

- [ ] **Add proper aria labels and roles**:

  - Enhance calculator buttons with ARIA attributes:
    ```tsx
    // In /apps/frontend/components/CalculatorButton.tsx
    interface CalculatorButtonProps {
      value: string;
      onClick: (value: string) => void;
      type?: 'number' | 'operator' | 'function';
    }
    
    export const CalculatorButton = ({ value, onClick, type = 'number' }: CalculatorButtonProps) => {
      // Generate appropriate aria-label based on button type and value
      const getAriaLabel = () => {
        if (type === 'number') return `Number ${value}`;
        if (type === 'operator') {
          const labels = {
            '+': 'Add',
            '-': 'Subtract',
            '*': 'Multiply',
            '/': 'Divide',
            '=': 'Equals',
          };
          return labels[value] || value;
        }
        if (type === 'function') {
          const labels = {
            'C': 'Clear',
            'CE': 'Clear Entry',
            'DEL': 'Delete',
          };
          return labels[value] || value;
        }
        return value;
      };
      
      return (
        <button 
          onClick={() => onClick(value)}
          aria-label={getAriaLabel()}
          className={`calculator-button calculator-button--${type}`}
        >
          {value}
        </button>
      );
    };
    ```

  - Add ARIA live regions for results:
    ```tsx
    // In /apps/frontend/components/Calculator.tsx
    return (
      <div className="calculator">
        <div className="calculator-display" aria-live="polite" aria-atomic="true">
          <div className="calculator-expression">{expression}</div>
          <div className="calculator-result" aria-label="Result">{result}</div>
        </div>
        {/* Calculator buttons */}
      </div>
    );
    ```

  - Add landmark roles:
    ```tsx
    // In /apps/frontend/app/layout.tsx
    return (
      <html lang="en">
        <body>
          <header role="banner">
            <nav role="navigation">
              {/* Navigation items */}
            </nav>
          </header>
          <main role="main">
            {children}
          </main>
          <footer role="contentinfo">
            {/* Footer content */}
          </footer>
        </body>
      </html>
    );
    ```

- [ ] **Ensure keyboard navigation support**:

  - Implement focus trap for modal dialogs:
    ```typescript
    // In /apps/frontend/hooks/useFocusTrap.ts
    import { useRef, useEffect } from 'react';
    
    export function useFocusTrap() {
      const elRef = useRef<HTMLDivElement>(null);
      
      useEffect(() => {
        const el = elRef.current;
        if (!el) return;
        
        // Save the element that was focused before opening the modal
        const previousFocus = document.activeElement as HTMLElement;
        
        // Get all focusable elements
        const focusableEls = el.querySelectorAll(
          'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstFocusableEl = focusableEls[0] as HTMLElement;
        const lastFocusableEl = focusableEls[focusableEls.length - 1] as HTMLElement;
        
        // Set focus to first element
        firstFocusableEl?.focus();
        
        function handleKeyDown(e: KeyboardEvent) {
          if (e.key !== 'Tab') return;
          
          // If shift + tab and on first element, move to last element
          if (e.shiftKey && document.activeElement === firstFocusableEl) {
            e.preventDefault();
            lastFocusableEl?.focus();
          }
          // If tab and on last element, move to first element
          else if (!e.shiftKey && document.activeElement === lastFocusableEl) {
            e.preventDefault();
            firstFocusableEl?.focus();
          }
        }
        
        el.addEventListener('keydown', handleKeyDown);
        
        return () => {
          el.removeEventListener('keydown', handleKeyDown);
          // Restore focus when component unmounts
          previousFocus?.focus();
        };
      }, []);
      
      return elRef;
    }
    ```

  - Add keyboard shortcuts for calculator operations:
    ```typescript
    // In /apps/frontend/components/Calculator.tsx
    useEffect(() => {
      function handleKeyDown(e: KeyboardEvent) {
        // Number keys
        if (/^[0-9]$/.test(e.key)) {
          handleButtonClick(e.key);
        }
        // Operators
        else if (['+', '-', '*', '/'].includes(e.key)) {
          handleButtonClick(e.key);
        }
        // Enter key = equals
        else if (e.key === 'Enter') {
          handleButtonClick('=');
        }
        // Escape key = clear
        else if (e.key === 'Escape') {
          handleButtonClick('C');
        }
        // Backspace = delete
        else if (e.key === 'Backspace') {
          handleButtonClick('DEL');
        }
      }
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);
    ```

  - Create skip links for keyboard users:
    ```tsx
    // In /apps/frontend/app/layout.tsx
    return (
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <header>{/* ... */}</header>
        <main id="main-content">{/* ... */}</main>
      </body>
    );
    ```

  - Style the skip link:
    ```css
    /* In /apps/frontend/styles/global.css */
    .skip-link {
      position: absolute;
      top: -40px;
      left: 0;
      padding: 8px;
      background-color: var(--focus-color);
      color: white;
      z-index: 1000;
      transition: top 0.2s;
    }
    
    .skip-link:focus {
      top: 0;
    }
    ```

- [ ] **Test with screen readers and accessibility tools**:

  - Create automated accessibility testing script:
    ```typescript
    // In /apps/frontend/tests/a11y.test.tsx
    import { render } from '@testing-library/react';
    import { axe, toHaveNoViolations } from 'jest-axe';
    import Calculator from '../components/Calculator';
    
    expect.extend(toHaveNoViolations);
    
    describe('Accessibility tests', () => {
      it('should not have any accessibility violations', async () => {
        const { container } = render(<Calculator />);
        const results = await axe(container);
        expect(results).toHaveNoViolations();
      });
    });
    ```

  - Set up screen reader testing checklist:
    ```markdown
    # Screen Reader Testing Checklist
    
    ## Test Environments
    - NVDA with Firefox on Windows
    - VoiceOver with Safari on macOS/iOS
    - TalkBack with Chrome on Android
    
    ## Test Tasks
    1. Navigate to the calculator app
    2. Locate the calculator interface
    3. Enter a simple calculation (e.g., 5 + 3)
    4. Verify the result is announced correctly
    5. Clear the calculator
    6. Test keyboard shortcuts
    7. Verify error messages are announced
    8. Navigate between different sections of the app
    ```

  - Add CI job for accessibility testing:
    ```yaml
    # In .github/workflows/accessibility.yml
    name: Accessibility Tests
    
    on:
      push:
        branches: [main]
      pull_request:
        branches: [main]
    
    jobs:
      a11y-tests:
        runs-on: ubuntu-latest
        steps:
          - uses: actions/checkout@v3
          - name: Setup Node.js
            uses: actions/setup-node@v3
            with:
              node-version: 18
              cache: 'pnpm'
          - name: Install dependencies
            run: pnpm install
          - name: Build app
            run: pnpm build
          - name: Start app
            run: pnpm start & npx wait-on http://localhost:3000
          - name: Run accessibility tests
            run: pnpm run a11y:test
    ```

  - Create documentation on manual accessibility testing:
    ```markdown
    # Manual Accessibility Testing Guide
    
    ## Keyboard Testing
    1. Disconnect mouse/trackpad
    2. Navigate using Tab, Shift+Tab, Enter, Space, arrow keys
    3. Verify focus indicator is visible at all times
    4. Ensure all interactive elements can be reached and activated
    
    ## Screen Magnification
    1. Use browser zoom (Ctrl/Cmd +) to 200%
    2. Verify no horizontal scrolling is required
    3. Check that all text remains readable
    4. Ensure no content is cut off or overlapping
    
    ## High Contrast Testing
    1. Enable high contrast mode in OS settings
    2. Verify all UI elements have sufficient contrast
    3. Check that no information is conveyed by color alone
    
    ## Mobile Device Testing
    1. Test with TalkBack/VoiceOver on mobile devices
    2. Verify touch targets are large enough (at least 44x44px)
    3. Test in portrait and landscape orientations
    4. Check that gestures work as expected
    ```

  - Set up regular accessibility reviews:
    ```markdown
    # Accessibility Review Schedule
    
    - Weekly automated testing in CI pipeline
    - Monthly manual testing with screen readers
    - Quarterly comprehensive audit with external tools
    - Pre-release full accessibility testing
    ```
