import os
import re
import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import PyPDF2
from groq import Groq
import requests

app = Flask(__name__)
CORS(app)

# ---------------- PDF TEXT EXTRACTION ----------------
def extract_text_from_pdf(file):
    try:
        pdf_reader = PyPDF2.PdfReader(file)
        text = ""
        for page in pdf_reader.pages:
            content = page.extract_text()
            if content:
                text += content
        return text
    except Exception as e:
        print(f"PDF Error: {e}")
        return ""

# ---------------- SMART SECTION EXTRACTION ----------------
def extract_sections(text):
    section_headers = {
        "experience": [
            "work experience", "experience", "employment history",
            "professional experience", "career history", "work history"
        ],
        "education": [
            "education", "academic background", "qualifications",
            "academic qualifications", "educational background"
        ],
        "skills": [
            "skills", "technical skills", "core competencies",
            "key skills", "technologies", "tools"
        ],
        "projects": [
            "projects", "personal projects", "academic projects",
            "key projects", "portfolio"
        ],
        "summary": [
            "summary", "about me", "profile", "objective",
            "professional summary", "career objective"
        ],
        "certifications": [
            "certifications", "certificates", "courses",
            "training", "achievements", "awards"
        ]
    }

    lines = text.split('\n')
    sections = {k: [] for k in section_headers}
    current_section = "summary"

    for line in lines:
        line_lower = line.lower().strip()
        if not line_lower:
            continue
        matched = False
        for section, headers in section_headers.items():
            if any(h in line_lower for h in headers) and len(line_lower) < 50:
                current_section = section
                matched = True
                break
        if not matched:
            sections[current_section].append(line.strip())

    result = {}
    for section, lines_list in sections.items():
        content = " ".join(lines_list).strip()
        if content:
            result[section] = content[:1500]
    return result

# ---------------- AI CV ANALYSIS ----------------
def analyze_cv_with_ai(text, groq_key):
    client = Groq(api_key=groq_key)
    sections = extract_sections(text)

    structured_cv = f"""
SUMMARY / ABOUT ME:
{sections.get('summary', 'Not provided')}

WORK EXPERIENCE:
{sections.get('experience', 'Not provided')}

EDUCATION:
{sections.get('education', 'Not provided')}

SKILLS:
{sections.get('skills', 'Not provided')}

PROJECTS:
{sections.get('projects', 'Not provided')}

CERTIFICATIONS / ACHIEVEMENTS:
{sections.get('certifications', 'Not provided')}
"""

    prompt = f"""
You are an expert CV analyzer. Analyze this structured CV data THOROUGHLY.

{structured_cv}

Return ONLY this exact JSON format, nothing else:

{{
  "role": "exact best-fit job title based on ALL experience and skills",
  "industry": "industry this person belongs to",
  "experience_level": "Intern / Junior / Mid-level / Senior",
  "years_of_experience": "estimated years as number (e.g. 0, 2, 5)",
  "education": "highest qualification (e.g. BSc Computer Science, University of Colombo)",
  "skills": ["every technical/professional skill found anywhere in CV"],
  "search_queries": ["short query 1", "short query 2", "short query 3"]
}}

RULES:
- role: must reflect actual work experience titles, not just skills
- experience_level:
    * Intern = student / fresher / undergraduate / no experience
    * Junior = 0-2 years
    * Mid-level = 2-5 years
    * Senior = 5+ years or lead/manager/architect roles
- skills: extract from ALL sections
- search_queries: 3 SHORT Google Jobs queries (max 5 words each, no location)
- No explanations, no markdown, no extra text
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        raw = response.choices[0].message.content.strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])
        return {
            "role": data.get("role", "Professional"),
            "industry": data.get("industry", "General"),
            "experience_level": data.get("experience_level", "Mid-level"),
            "years_of_experience": str(data.get("years_of_experience", "0")),
            "education": data.get("education", ""),
            "skills": data.get("skills", []),
            "search_queries": data.get("search_queries", [])
        }
    except Exception as e:
        print(f"AI CV Error: {e}")
        return None

# ---------------- AI CAREER GUIDANCE ----------------
def generate_career_guidance(cv_data, groq_key):
    client = Groq(api_key=groq_key)

    prompt = f"""
You are an expert career counselor. Analyze this candidate profile and provide detailed career guidance.

CANDIDATE PROFILE:
- Current Role: {cv_data['role']}
- Industry: {cv_data['industry']}
- Experience Level: {cv_data['experience_level']}
- Years of Experience: {cv_data['years_of_experience']}
- Education: {cv_data['education']}
- Skills: {', '.join(cv_data['skills'])}

Return ONLY this exact JSON format, nothing else:

{{
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "skill_gaps": [
    {{"skill": "skill name", "reason": "why this skill is important for their role", "resource": "where to learn (e.g. Coursera, Udemy, YouTube)"}}
  ],
  "career_path": [
    {{"timeline": "0-1 year", "goal": "specific goal", "action": "what to do"}},
    {{"timeline": "1-3 years", "goal": "specific goal", "action": "what to do"}},
    {{"timeline": "3-5 years", "goal": "specific goal", "action": "what to do"}}
  ],
  "cv_improvements": ["improvement tip 1", "improvement tip 2", "improvement tip 3"],
  "recommended_certifications": [
    {{"name": "certification name", "provider": "e.g. AWS, Google, Coursera", "reason": "why useful"}}
  ],
  "overall_summary": "2-3 sentence honest assessment of this candidate and their career potential"
}}

RULES:
- Be specific and actionable, not generic
- skill_gaps: identify 3-5 missing skills that are crucial for their role
- career_path: realistic and specific to their current level
- cv_improvements: practical tips based on what might be missing
- No explanations outside JSON, no markdown, no extra text
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=2000
        )
        raw = response.choices[0].message.content.strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])
        return data
    except Exception as e:
        print(f"Career Guidance Error: {e}")
        return None

# ---------------- AI JOB MATCHING ----------------
def ai_match_jobs(cv_data, jobs_list, groq_key):
    client = Groq(api_key=groq_key)

    jobs_summary = []
    for i, job in enumerate(jobs_list):
        extensions = job.get("detected_extensions", {})
        jobs_summary.append({
            "index": i,
            "title": job.get("title", ""),
            "company": job.get("company_name", ""),
            "work_from_home": extensions.get("work_from_home", False),
            "description": job.get("description", "")[:300]
        })

    prompt = f"""
You are an expert job matching AI.

CANDIDATE FULL PROFILE:
- Best Fit Role: {cv_data['role']}
- Industry: {cv_data['industry']}
- Experience Level: {cv_data['experience_level']}
- Years of Experience: {cv_data.get('years_of_experience', 'Unknown')}
- Education: {cv_data.get('education', 'Unknown')}
- Skills: {', '.join(cv_data['skills'])}

JOBS:
{json.dumps(jobs_summary, indent=2)}

Score each job 0-100. Consider role fit, skills match, experience level, AND education.

Return ONLY this JSON:
{{
  "matches": [
    {{"index": 0, "score": 85, "reason": "one line reason"}},
    {{"index": 1, "score": 40, "reason": "one line reason"}}
  ]
}}

Scoring guide:
- 80-100: Role + skills + experience level all match perfectly
- 60-79: Role matches, most skills match, level close
- 40-59: Related field, some skills match
- 20-39: Same industry, different role
- 0-19: Unrelated to candidate profile

No extra text, no markdown.
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=1000
        )
        raw = response.choices[0].message.content.strip()
        start = raw.find("{")
        end = raw.rfind("}") + 1
        data = json.loads(raw[start:end])
        return data.get("matches", [])
    except Exception as e:
        print(f"AI Match Error: {e}")
        fallback = []
        for i, job in enumerate(jobs_list):
            desc = job.get("description", "").lower()
            hits = sum(1 for s in cv_data['skills'] if s.lower() in desc)
            score = round((hits / max(len(cv_data['skills']), 1)) * 100)
            fallback.append({"index": i, "score": max(score, 5), "reason": "Keyword match"})
        return fallback

# ---------------- FETCH JOBS ----------------
def fetch_jobs(cv_data, country_code, location_name, serp_api_key):
    serp_url = "https://serpapi.com/search.json"
    role = cv_data.get("role", "Professional")
    ai_queries = cv_data.get("search_queries", [])

    queries = []
    for q in ai_queries[:3]:
        queries.append(f"{q} jobs in {location_name}")
    queries.append(f"{role} jobs in {location_name}")
    queries = list(dict.fromkeys(queries))

    all_jobs = []
    seen = set()

    for query in queries:
        if len(all_jobs) >= 20:
            break

        params = {
            "engine": "google_jobs",
            "q": query,
            "gl": country_code,
            "hl": "en",
            "location": location_name,
            "api_key": serp_api_key
        }

        try:
            res = requests.get(serp_url, params=params, timeout=10)
            print(f"DEBUG SERP [{query}] -> {res.status_code}")
            jobs = res.json().get("jobs_results", [])
            print(f"DEBUG JOBS [{query}] -> {len(jobs)}")

            for job in jobs:
                key = f"{job.get('title','')}_{job.get('company_name','')}".lower()
                if key not in seen:
                    seen.add(key)
                    all_jobs.append(job)
        except Exception as e:
            print(f"SERP Error: {e}")

    print(f"DEBUG TOTAL JOBS: {len(all_jobs)}")
    return all_jobs

# ---------------- MAIN ROUTE ----------------
@app.route('/process-cv', methods=['POST'])
def process_cv():
    file = request.files.get('file')
    country_code = request.form.get('country', 'lk').lower()
    serp_api_key = request.form.get('api_key')
    groq_key = request.form.get('groq_key')

    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    if not serp_api_key:
        return jsonify({"error": "SERP API key missing"}), 400
    if not groq_key:
        return jsonify({"error": "Groq API key missing"}), 400

    cv_text = extract_text_from_pdf(file)
    if not cv_text.strip():
        return jsonify({"error": "PDF text extraction failed"}), 400

    cv_data = analyze_cv_with_ai(cv_text, groq_key)
    if not cv_data:
        return jsonify({"error": "CV analysis failed. Check your Groq API key."}), 500

    print(f"DEBUG ROLE: {cv_data['role']}")
    print(f"DEBUG INDUSTRY: {cv_data['industry']}")
    print(f"DEBUG LEVEL: {cv_data['experience_level']}")
    print(f"DEBUG YEARS: {cv_data['years_of_experience']}")
    print(f"DEBUG EDUCATION: {cv_data['education']}")
    print(f"DEBUG SKILLS: {cv_data['skills']}")

    location_map = {
        "lk": "Sri Lanka",
        "us": "United States",
        "gb": "United Kingdom",
        "au": "Australia"
    }
    location_name = location_map.get(country_code, "Sri Lanka")

    # Run job fetch and career guidance in parallel data collection
    jobs_list = fetch_jobs(cv_data, country_code, location_name, serp_api_key)
    career_guidance = generate_career_guidance(cv_data, groq_key)

    if not jobs_list:
        return jsonify({
            "role": cv_data["role"],
            "industry": cv_data["industry"],
            "experience_level": cv_data["experience_level"],
            "years_of_experience": cv_data["years_of_experience"],
            "education": cv_data["education"],
            "extracted_skills": cv_data["skills"][:12],
            "jobs": [],
            "career_guidance": career_guidance,
            "message": "No jobs found for your profile in this region."
        })

    matches = ai_match_jobs(cv_data, jobs_list, groq_key)
    score_map = {m["index"]: (m["score"], m.get("reason", "")) for m in matches}

    final_jobs = []
    for i, job in enumerate(jobs_list):
        apply_options = job.get("apply_options") or []
        link = job.get("link") or (apply_options[0].get("link") if apply_options else "#")
        score, reason = score_map.get(i, (10, ""))

        extensions = job.get("detected_extensions", {})
        posted_at = extensions.get("posted_at", "")
        work_from_home = extensions.get("work_from_home", False)
        salary = extensions.get("salary", "")

        if score >= 20:
            final_jobs.append({
                "title": job.get("title"),
                "company": job.get("company_name"),
                "location": job.get("location"),
                "link": link,
                "match_score": score,
                "match_reason": reason,
                "posted_at": posted_at,
                "work_from_home": work_from_home,
                "salary": salary
            })

    final_jobs.sort(key=lambda x: x["match_score"], reverse=True)

    return jsonify({
        "role": cv_data["role"],
        "industry": cv_data["industry"],
        "experience_level": cv_data["experience_level"],
        "years_of_experience": cv_data["years_of_experience"],
        "education": cv_data["education"],
        "extracted_skills": cv_data["skills"][:12],
        "jobs": final_jobs,
        "career_guidance": career_guidance
    })


@app.route('/analyze-cv-only', methods=['POST'])
def analyze_cv_only():
    file     = request.files.get('file')
    groq_key = request.form.get('groq_key')

    if not file:
        return jsonify({"error": "No file uploaded"}), 400
    if not groq_key:
        return jsonify({"error": "Groq API key missing"}), 400

    cv_text = extract_text_from_pdf(file)
    if not cv_text.strip():
        return jsonify({"error": "PDF text extraction failed"}), 400

    cv_data = analyze_cv_with_ai(cv_text, groq_key)
    if not cv_data:
        return jsonify({"error": "CV analysis failed"}), 500

    return jsonify({
        "role":                cv_data["role"],
        "industry":            cv_data["industry"],
        "experience_level":    cv_data["experience_level"],
        "years_of_experience": cv_data["years_of_experience"],
        "education":           cv_data["education"],
        "extracted_skills":    cv_data["skills"][:12]
    })

# ---------------- RUN ----------------
if __name__ == "__main__":
    app.run(debug=True, port=5002)