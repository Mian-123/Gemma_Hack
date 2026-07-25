# Ingest sources crawler functions and RSS feeds stubs
def fetch_rss_feed(feed_url: str) -> list:
    # Mock data output representing a fetched list of opportunities from an RSS feed
    return [
        {
            "title": "Django Software Engineer",
            "company": "Pythonic Enterprises",
            "description": "Develop and maintain robust web applications using Python, Django, and PostgreSQL.",
            "opportunity_type": "job",
            "url": "https://example.com/jobs/django-developer-pythonic",
            "location": "Chicago, IL",
            "skills": "Python, Django, PostgreSQL, REST APIs"
        },
        {
            "title": "React Native Developer Intern",
            "company": "MobileCraft Inc",
            "description": "Build premium cross-platform mobile apps using React Native and TypeScript.",
            "opportunity_type": "internship",
            "url": "https://example.com/internships/mobilecraft-react-native",
            "location": "Remote",
            "skills": "React Native, React, TypeScript, JavaScript"
        }
    ]
