## 💡 Reflections on the Project

I decided early on that I would treat this not as a take-home assignment, but as if I were building something real that a recruiter could actually use. That mindset guided every choice I made. I thought about scalability, maintainability, and the people who might one day rely on this that’s why I made sure to include things like eager loading and caching, to avoid performance bottlenecks. Even in a demo, I wanted to simulate a real production-grade application.

I even added a history option for job description analyses on my own, i know it wasn't a requirement, but I thought it what would really help recruiters in their workflow. To me, that’s what makes a project feel alive: adding touches that go beyond the minimum requirements.

And, well… since this is for Noosa Labs, I couldn’t resist sneaking in a few koala 🐨 Easter eggs here and there. Hopefully you’ll spot them and hopefully you’ll like them!

---

### 🤖 LLM Usage
For the AI side, I leaned on Gemini, mainly because of its reliable JSON compatibility. It gave me structured outputs that were easy to plug back into the system without messy parsing.
And since coding can feel lonely sometimes, I used Cursor, which integrates naturally with VS Code it was my “coding pal” throughout this journey, helping me debug, iterate, and experiment faster.

---

### 📊 Scoring & Explainability
I didn’t want scoring to be a shallow keyword match. I guided Gemini to weigh multiple aspects: technical skills, missing requirements, nice-to-haves, even softer strengths and weaknesses. The goal was to make the system fair and explainable so a recruiter could look at a candidate’s score and actually understand why they got it.

---

### ⚖️ Trade-offs & Decisions
Like in any real project, I had to make trade-offs:
- I kept parsing relatively lightweight, choosing a pragmatic approach over heavy NLP pipelines, so it would be easier to deploy and scale.
- Some limitations remain scanned PDFs or weird resume formats are hard to handle without OCR. If I had more time, I’d integrate an OCR fallback.
- For deployment, I chose Docker to make sharing simple and portable. If this were heading to production, I’d look at Kubernetes or a serverless setup for elasticity.

---

### 🚀 If I Had More Time
If this were more than a demo, I’d love to:
- Add user accounts with role-based access.
- Let recruiters reuse resumes from past job descriptions to build a richer candidate pool.
- Improve the frontend with a polished recruiter-friendly UI (filters, sorting, and visual scoring dashboards).
- Integrate background job queues (e.g., Laravel Horizon or RabbitMQ) so heavy analyses run asynchronously without blocking the app.

---

This wasn’t just about delivering code. I wanted to show how I think, how I design, and how I care about the details. Even under time limits, I tried to leave the project in a state where someone could see the seeds of a real product, not just an assignment.
