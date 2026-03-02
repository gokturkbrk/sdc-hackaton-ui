# ==========================================
# Değişkenler - Burayı Projene Göre Güncelle
# ==========================================
PROJECT_ID=project-b7be3ea5-e603-419c-87d
REGION=europe-west3
REPO_NAME=layla-ui
IMAGE_NAME=web-app
TAG=latest
SERVICE_NAME=layla-web-ui

# .env dosyasından değişkenleri çekme (Hata almamak için shell komutuyla)
VITE_API_BASE_URL=$(shell grep VITE_API_BASE_URL .env | cut -d '=' -f2)
VITE_GOOGLE_MAPS_API_KEY=$(shell grep VITE_GOOGLE_MAPS_API_KEY .env | cut -d '=' -f2)

# Tam Google Artifact Registry adresi
REMOTE_IMAGE=$(REGION)-docker.pkg.dev/$(PROJECT_ID)/$(REPO_NAME)/$(IMAGE_NAME):$(TAG)

.PHONY: all build push deploy clean help

# ==========================================
# Ana Komutlar
# ==========================================

# Sadece 'make' yazarsan her şeyi sırayla yapar
all: build push deploy

# 1. Build: .env'deki değerleri ARG olarak içeri basar
build:
	@echo "🚀 [1/3] Building Frontend for amd64..."
	@echo "🔗 API URL: $(VITE_API_BASE_URL)"
	docker build --platform linux/amd64 \
		--build-arg VITE_API_BASE_URL=$(VITE_API_BASE_URL) \
		--build-arg VITE_GOOGLE_MAPS_API_KEY=$(VITE_GOOGLE_MAPS_API_KEY) \
		-t $(IMAGE_NAME)-local .

# 2. Push: Google Cloud'a gönderir
push:
	@echo "📦 [2/3] Tagging and Pushing to Artifact Registry..."
	docker tag $(IMAGE_NAME)-local $(REMOTE_IMAGE)
	docker push $(REMOTE_IMAGE)

# 3. Deploy: Cloud Run'ı günceller
deploy:
	@echo "🌐 [3/3] Updating Cloud Run service: $(SERVICE_NAME)..."
	gcloud run deploy $(SERVICE_NAME) \
		--image $(REMOTE_IMAGE) \
		--region $(REGION) \
		--platform managed \
		--allow-unauthenticated \
		--port 8080

clean:
	docker rmi $(IMAGE_NAME)-local $(REMOTE_IMAGE)

help:
	@echo "Kullanım:"
	@echo "  make        : Build (with Args) + Push + Deploy"
	@echo "  make build  : Sadece .env değişkenlerini gömerek build alır"