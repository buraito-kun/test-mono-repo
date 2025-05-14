terraform {
  required_providers {
    docker = {
      source = "kreuzwerker/docker"
      version = "~> 3.5.0"
    }
  }
}

provider "docker" {
  host = "npipe:////.//pipe//docker_engine"
}

# Pulls the image
resource "docker_image" "backend_image" {
  name = format("ghcr.io/buraito-kun/test-mono-repo/backend:%s", var.backend_version)
}

resource "docker_image" "frontend_image" {
  name = format("ghcr.io/buraito-kun/test-mono-repo/frontend:%s", var.frontend_version)
}

resource "docker_container" "backend_container" {
  name = "backend_container"
  image = docker_image.backend_image.image_id
  restart = "always"
  ports {
    internal = 3001
    external = var.backend_port
  }
}

resource "docker_container" "frontend_container" {
  name = "frontend_container"
  image = docker_image.frontend_image.image_id
  restart = "always"
  ports {
    internal = 3000
    external = var.frontend_port
  }
}
