# AWS EC2 Setup Guide for Syncro

This guide covers setting up an AWS EC2 instance to host the Syncro backend server and Redis cache, configuring Docker, and linking it to the GitHub Actions CI/CD pipeline.

---

## Step 1: Provision the EC2 Instance

1. **Launch Instance:** Go to the AWS Console > EC2 > Launch Instance.
2. **OS (AMI):** Select **Ubuntu Server 24.04 LTS** (or 22.04 LTS), 64-bit (x86).
3. **Instance Type:** Select **t2.micro** (Free Tier eligible) or **t3.small** (recommended for better performance).
4. **Key Pair:** Create or select an existing key pair (`.pem` file). Save this file securely; you will need it to log in and set up GitHub Secrets.
5. **Network Settings (Security Group):**
   Configure the Security Group to allow incoming traffic on:
   - **Port 22 (SSH):** From your IP address (for management).
   - **Port 80 (HTTP):** From Anywhere (0.0.0.0/0).
   - **Port 443 (HTTPS):** From Anywhere (0.0.0.0/0).
   - **Port 5000 (Backend API):** From Anywhere (0.0.0.0/0) *only if* you want to hit the backend directly without an Nginx reverse proxy. (Highly recommended to keep this closed and route traffic through Nginx on Port 80/443).

---

## Step 2: Connect and Install Docker

1. **Connect via SSH:**
   Open your local terminal and connect to your EC2 instance (replace `YOUR_EC2_IP` and path to your key file):
   ```bash
   ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_IP
   ```

2. **Install Docker Engine:**
   Run the following commands on your EC2 instance to install Docker:
   ```bash
   # Update system packages
   sudo apt-get update
   sudo apt-get install -y ca-certificates curl gnupg

   # Add Docker's official GPG key
   sudo install -m 0755 -d /etc/apt/keyrings
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
   sudo chmod a+r /etc/apt/keyrings/docker.gpg

   # Set up the repository
   echo \
     "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
     $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | \
     sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

   sudo apt-get update
   sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
   ```

3. **Manage Docker as Non-Root User:**
   To run Docker commands without prefixing them with `sudo` (required for our CI/CD script):
   ```bash
   sudo usermod -aG docker ubuntu
   ```
   **Log out and log back in** to apply the group changes:
   ```bash
   exit
   ssh -i /path/to/your-key.pem ubuntu@YOUR_EC2_IP
   ```
   Verify Docker is running without sudo:
   ```bash
   docker ps
   ```

---

## Step 3: Clone the Repository on EC2

1. **Generate a Deploy Key (SSH Key) on EC2:**
   This allows the EC2 instance to securely pull code from GitHub.
   ```bash
   ssh-keygen -t ed25519 -C "ec2-syncro"
   ```
   Press `Enter` to accept defaults. Display the public key:
   ```bash
   cat ~/.ssh/id_ed25519.pub
   ```
   Copy the output.

2. **Add Deploy Key to GitHub:**
   - Go to your GitHub repository > **Settings** > **Deploy keys** > **Add deploy key**.
   - Paste the public key, check **Allow write access** (optional, read access is sufficient), and save.

3. **Clone the Repo:**
   Clone your repository into the `~/Syncro` folder on your EC2 instance:
   ```bash
   git clone git@github.com:YOUR_GITHUB_USERNAME/Syncro.git ~/Syncro
   ```

---

## Step 4: Create the Production Environment File

Because the environment variables containing secrets are ignored by git, you must manually create the production environment file on the EC2 instance:

```bash
mkdir -p ~/Syncro/Server
nano ~/Syncro/Server/.env
```

Paste your production configurations. Example template:
```env
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://syncro.gopikadileep.in
BACKEND_URL=https://api-syncro.gopikadileep.in

# Database Configuration
MONGO_URI=mongodb+srv://gopikadileep76:M9JFuTqbKWDnhU3n@cluster0.yebv2.mongodb.net/syncro

# Redis Configuration (Using local container)
REDIS_HOST=redis
REDIS_PORT=6379

# Tokens
ACCESS_TOKEN_SECRET="production_jwt_secret_token"
REFRESH_TOKEN_SECRET="production_jwt_refresh_token"
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# Cookies
REFRESH_TOKEN_COOKIE_MAX_AGE=604800000
COOKIE_SECURE=true
COOKIE_SAME_SITE=lax

# AWS Configurations
AWS_REGION=ap-south-1
AWS_ACCESS_KEY_ID=YOUR_AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=YOUR_AWS_SECRET_ACCESS_KEY
AWS_S3_BUCKET_NAME=syncro-pm

# Groq API
GROQ_API_KEY=YOUR_GROQ_API_KEY

# Email / SMTP Configuration
EMAIL_USER=YOUR_EMAIL_USER
EMAIL_PASS=YOUR_EMAIL_PASS
EMAIL_FROM_NAME=Syncro
```
Press `Ctrl+O` and then `Enter` to save, and `Ctrl+X` to exit.

---

## Step 5: Configure GitHub Secrets

On GitHub, navigate to **Settings** > **Secrets and variables** > **Actions** > **New repository secret** and add the following:

| Secret Name | Value |
| :--- | :--- |
| `AWS_ACCESS_KEY_ID` | `YOUR_AWS_ACCESS_KEY_ID` |
| `AWS_SECRET_ACCESS_KEY` | `YOUR_AWS_SECRET_ACCESS_KEY` |
| `AWS_REGION` | `ap-south-1` |
| `EC2_HOST` | The **Public IP Address** (or Public IPv4 DNS) of your EC2 instance. |
| `EC2_USERNAME` | `ubuntu` (default user for Ubuntu AMI). |
| `EC2_SSH_KEY` | Paste the **entire contents** of your private SSH key (`.pem` file) including headers (`-----BEGIN RSA PRIVATE KEY-----`, etc.). |
| `VITE_API_BASE_URL` | The domain name of your EC2 backend (e.g. `https://api-syncro.gopikadileep.in` or `http://YOUR_EC2_IP:5000`). |
| `VITE_API_URL` | The API path of your EC2 backend (e.g. `https://api-syncro.gopikadileep.in/api` or `http://YOUR_EC2_IP:5000/api`). |

---

## Step 6: Initial Build and Run (Optional)

You can run the docker compose setup manually on your EC2 instance first to make sure everything compiles and starts correctly:

```bash
cd ~/Syncro
docker compose up -d --build
```
Verify the containers are running:
```bash
docker ps
```
You should see `syncro-server` and `syncro-redis` running successfully.

---

## Step 7: (Recommended) Configure Nginx Reverse Proxy & SSL

To point a domain (like `api-syncro.gopikadileep.in`) to your EC2 instance with HTTPS support:

1. **Install Nginx:**
   ```bash
   sudo apt-get install -y nginx
   ```

2. **Configure Nginx config block:**
   ```bash
   sudo nano /etc/nginx/sites-available/syncro
   ```
   Paste the following reverse proxy configuration:
   ```nginx
   server {
       listen 80;
       server_name api-syncro.gopikadileep.in; # Replace with your subdomain

       location / {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Save and close the file.

3. **Enable configuration and restart Nginx:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/syncro /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default # Remove default site
   sudo nginx -t # Test configuration
   sudo systemctl restart nginx
   ```

4. **Install Let's Encrypt SSL (Certbot):**
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   sudo certbot --nginx -d api-syncro.gopikadileep.in
   ```
   Follow the prompts to enable HTTPS redirect. Now your API is securely hosted under `https://api-syncro.gopikadileep.in`!
