.PHONY: changelog changelog-backend changelog-frontend

# Generate changelog for all packages
changelog: changelog-backend

# Generate changelog for backend
changelog-backend:
	git-cliff --unreleased --include-path backend/ -o backend/CHANGELOG.md

# Generate changelog for frontend (when ready)
changelog-frontend:
	git-cliff --unreleased --include-path frontend/ -o frontend/CHANGELOG.md
