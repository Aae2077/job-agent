from dotenv import load_dotenv
load_dotenv()
import os
from discord_webhook import DiscordWebhook, DiscordEmbed

webhook = DiscordWebhook(
    url=os.getenv("DISCORD_WEBHOOK_URL"),
    content=f"<@{os.getenv('DISCORD_USER_ID')}> Job Scout is online and working!"
)
embed = DiscordEmbed(
    title="Test Alert: SDR @ Anthropic",
    url="https://anthropic.com",
    description="This is what a job alert will look like.",
    color="03b2f8"
)
embed.add_embed_field(name="Location", value="San Francisco, CA", inline=True)
embed.add_embed_field(name="Salary", value="$70,000 - $85,000", inline=True)
embed.add_embed_field(name="Posted", value="12 minutes ago", inline=True)
embed.set_footer(text="React ✅ to generate tailored resume + cover letter  |  ❌ to dismiss")
webhook.add_embed(embed)
response = webhook.execute()
print(f"Status: {response.status_code}")
