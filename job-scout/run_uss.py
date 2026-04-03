import tailor, os

jd = (
    "Account Executive New Business - United Site Services, Oakland CA\n"
    "Salary: $65,900 - $98,900/yr plus uncapped commission\n\n"
    "Primary Purpose:\n"
    "Entry-to-early-career sales role focused on driving new business development and revenue growth "
    "within an assigned territory. Prospecting new customers and positioning the full portfolio of site "
    "service solutions including portable sanitation, temporary fencing, roll-off, and ancillary offerings.\n\n"
    "Essential Functions:\n"
    "- Conduct daily prospecting: jobsite visits, cold calls, emails, networking, social outreach\n"
    "- Identify, qualify, and develop new business in construction, industrial, commercial, event-driven segments\n"
    "- Prepare quotes, proposals, and service solutions aligned to customer jobsite needs\n"
    "- Cross-sell ancillary and bundled products to increase average order value\n"
    "- Maintain accurate CRM records, opportunity tracking, pipeline management, activity reporting\n"
    "- Build relationships with superintendents, project managers, estimators, purchasing teams\n"
    "- Target competitive take-away opportunities\n"
    "- Meet or exceed defined activity and revenue performance expectations\n"
    "- Collaborate with Account Executives, Sales Leaders, and cross-functional partners\n\n"
    "Qualifications:\n"
    "- 1-3 years sales experience\n"
    "- Strong interest in outside sales, prospecting, and territory development\n"
    "- Excellent communication, organization, and follow-up skills\n"
    "- Valid driver's license, ability to travel locally to jobsites\n"
    "- CRM proficiency, MS Office Suite\n"
)

resume_pdf, cover_pdf, analysis = tailor.tailor(
    "https://careers.unitedsiteservices.com/careers-home/jobs/22365/Account+Executive+New+Business",
    job_description=jd
)

for pdf, name in [
    (resume_pdf, "AidenResume_united-site-services.pdf"),
    (cover_pdf,  "AidenCoverLetter_united-site-services.pdf"),
]:
    print(f"{'Saved' if pdf and os.path.exists(pdf) else 'FAILED'}: {name}")

gaps = tailor.format_gaps(analysis.get("gaps", []))
if gaps:
    print("\n" + gaps)
