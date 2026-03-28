#!/bin/bash
# Deploy latest changes to the VPS bot + scraper
# Run from your laptop: bash deploy.sh
set -e

VPS="josh@100.117.198.30"
REPO="~/job-agent"

echo "Pulling latest from GitHub..."
ssh "$VPS" "cd $REPO && git pull"

echo "Restarting bot..."
ssh "$VPS" "sudo systemctl restart jobscout-bot && systemctl is-active jobscout-bot"

echo "Done. Scraper will pick up new code on next cron run."
