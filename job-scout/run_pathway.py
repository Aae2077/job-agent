import tailor, os

jd = (
    "Brand Marketing & PR Internship - Pathway, Palo Alto CA\n"
    "Hybrid, 3-6 months, immediate start\n\n"
    "About Pathway:\n"
    "Pathway builds the first post-transformer frontier model that solves AI's fundamental memory problem. "
    "While transformers wake up in the same state every time, their architecture enables true continuous learning, "
    "infinite context reasoning, and real-time adaptation. Trusted by NATO, La Poste, and Formula 1 racing teams. "
    "Headquartered in Palo Alto, CA. Backed by Lukasz Kaiser, co-author of the Transformer.\n\n"
    "You Will:\n"
    "- Craft narratives around technical research and product developments\n"
    "- Develop social media and content strategies\n"
    "- Support the planning and execution of events, talks and roundtables\n"
    "- Assist with media research, press materials, briefing documents and outreach preparation\n"
    "- Translate complex topics such as continual learning and benchmark results into accessible, compelling messaging\n"
    "- Monitor relevant conversations in AI, startups and research to identify communication opportunities\n"
    "- Contribute to the development of Pathway's brand as a category-defining AI company\n\n"
    "Requirements:\n"
    "- Prior internship or work experience in marketing, PR, journalism, brand strategy, communications or media\n"
    "- Strong portfolio of writing, campaigns, media placements, events, newsletters, social content or community initiatives\n"
    "- Leadership role in a student newspaper, magazine, communications team or high-performance student organization\n"
    "- Strong writing, editing and verbal communication skills\n"
    "- Ability to understand complex ideas quickly and translate them into clear, compelling messaging\n"
    "- Highly organized, able to manage multiple projects at once\n"
    "- Comfortable moving between strategic thinking and hands-on execution\n"
    "- Excited by AI and interested in shaping the narrative around frontier research and products\n"
    "- Fluent in English\n\n"
    "Bonus Points:\n"
    "- Experience in communications related to AI, deep tech, research or highly technical fields\n"
    "- Experience building or growing social media, editorial or community channels\n"
)

resume_pdf, cover_pdf, analysis = tailor.tailor(
    "https://www.indeed.com/viewjob?jk=f9997fd121b26955",
    job_description=jd
)

for pdf, name in [
    (resume_pdf, "SachsResume_pathway.pdf"),
    (cover_pdf,  "SachsCoverLetter_pathway.pdf"),
]:
    print(f"{'Saved' if pdf and os.path.exists(pdf) else 'FAILED'}: {name}")

gaps = tailor.format_gaps(analysis.get("gaps", []))
if gaps:
    print("\n" + gaps)
