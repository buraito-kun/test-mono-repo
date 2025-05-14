variable "backend_version" {
  description = "The backend image version"
  type = string
  default = "latest"
}

variable "frontend_version" {
  description = "The frontend image version"
  type = string
  default = "latest"
}

variable "backend_port" {
  description = "The backend port"
  type = string
  default = "3001"
}

variable "frontend_port" {
  description = "The frontend port"
  type = string
  default = "3000"
}
