# Automation Project

Learning to build out test automation end to end from scratch.
- E2E Testing (Playwright with custom framework)
- Integration Testing (PyTest with custom fixtures)
- Unit Testing (Jest)
- Contract testing (Frontend + backend)
- Performance and Load testing (K6)
- CI/CD pipeline (Github Actions)
- Reporting through Monitoring and Dashboards (Prometheus and Grafana)
- Documentation

### Run backend integration tests:
- `python3 -m venv venv`
- `source venv/bin/activate`
- `python -m pip install --upgrade pip`
- `pip install -r requirements.txt`
- `python -m pytest backend/tests/integration -v`

### Cleanup:
- `deactivate`
- `rm -rf venv`
