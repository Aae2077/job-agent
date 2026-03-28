from dotenv import load_dotenv
load_dotenv()
import os
from linkedin_api import Linkedin

print("Authenticating with cookie...")
api = Linkedin('', '', cookies={
    'li_at': os.getenv('LINKEDIN_COOKIE'),
    'JSESSIONID': os.getenv('LINKEDIN_JSESSIONID'),
})
print("Authenticated.")

results = api.search_jobs(keywords='Sales Development Representative', limit=5)
print(f'Results: {len(results)}')
if results:
    for r in results:
        print(r.get('title'), '|', r.get('entityUrn'))
