# Automation Project

Learning to build out test automation end to end.

Types of testing:
- E2E Testing
- Integration Testing
- Unit Testing
- Contract testing (Frontend + backend)
- Performance and Load testing


1. Test Framework
Things to custom-make for test framework:
- Custom fixtures
- Retry logic
- Data factories
- Test tagging
- Environment configuration (cross-browsers)
- Visual UI testing

tests/
├── api/
├── ui/
├── fixtures/
├── data/
├── pages/
├── helpers/
└── reports/

2. CI/CD Pipeline
Pull Request
    ↓
Lint
    ↓
Unit Tests
    ↓
API Tests
    ↓
UI Tests
    ↓
Performance Smoke Test
    ↓
Publish Report

3. Monitoring and Dashboards
- Structured logging
- Request IDs
- Grafana dashboard
- Prometheus metrics

4. Performance Testing
K6 -> smoke tests, load test, stress test, spike test

5. Documentation
- Test strategy
- Risk assessment
- Architecture diagram
- Defect reports
- Root-cause analyses

TODO:
- change Jest unit tests from JavaScript to Unit tests
- Add instructions on how to run tests at the end of everything