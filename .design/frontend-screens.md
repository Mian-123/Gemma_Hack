# Frontend Screens & Wireframes Design (frontend-screens.md)

## 1. ASCII Wireframes

### Auth & Onboarding Screen
```
+-----------------------------------------------------------+
|  OpportunityAI                                            |
+-----------------------------------------------------------+
|                                                           |
|             Welcome! Please log in or register.           |
|             [ Email Address                   ]           |
|             [ Password                        ]           |
|             [ Login ]  [ Register ]                       |
|                                                           |
|  -------------------------------------------------------  |
|  ONBOARDING (First time login):                           |
|  Let's configure your career preferences:                 |
|  Target Roles: [ Backend Developer x ] [ ML Engineer + ]  |
|  Location:     [ San Francisco, CA                     ]  |
|  Lang Pref:    [ Python                                ]  |
|  [ Save Preferences ]                                     |
|                                                           |
+-----------------------------------------------------------+
```

### Main Dashboard Screen
```
+-----------------------------------------------------------+
| OpportunityAI | [Dashboard] [Feed] [Market] [Tools] [Settings] |
+-----------------------------------------------------------+
| Welcome, developer@example.com   | Model Status: [Gemma 4 E2B] |
|                                                           |
| +-------------------------+   +-------------------------+ |
| | Career Profile          |   | Verified Skills         | |
| | Roles: Backend Dev      |   | [Python] [FastAPI]      | |
| | Location: Remote        |   | [React (GitHub verified)]| |
| | [Upload Resume (PDF)]   |   | [Add manual skill +]    | |
| +-------------------------+   +-------------------------+ |
|                                                           |
| +-------------------------------------------------------+ |
| | Career Memory Context (AI Learnt Facts)                | |
| | - "Interested in scalable backend microservices."     | |
| | - "Lacks Docker knowledge, wants to learn."           | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### Resume Upload & Parse Result Workspace
```
+-----------------------------------------------------------+
| OpportunityAI | Dashboard > Resume Upload                 |
+-----------------------------------------------------------+
| Select Resume: [ Choose File ] -> resume.pdf (3.2MB)      |
| [ Start Local Parse (No Data Leaves Device) ]             |
|                                                           |
| Parsing Progress: [████████████████████ 100%] (Gemma 4 E2B: 2.1s)|
|                                                           |
| Parse Results Review:                                     |
| Name:  [ John Doe       ] Email: [ john@example.com     ] |
| Skills: [Python], [Docker], [FastAPI], [React]            |
| Experience:                                               |
|  - Software Engineer at Vercel (2024 - Present)           |
|  [ Edit Details ]  [ Save Profile to Career Memory ]      |
+-----------------------------------------------------------+
```

### Opportunity Feed & Match Detail (Skill Gap paste)
```
+-----------------------------------------------------------+
| OpportunityAI | [Dashboard] [Feed] [Market] [Tools] [Settings] |
+-----------------------------------------------------------+
| Match Feed:                                               |
| [ Job ] [ Hackathon ] [ Internship ]                      |
|                                                           |
| +-------------------------------------------------------+ |
| | Junior Backend Engineer at Vercel                     | |
| | Location: Remote | Match Score: [ 85% (Strong Fit) ]  | |
| |                                                       | |
| | Match Explanation (Gemma 4 E2B reasoned):             | |
| | "You have strong React and Python skills. However,    | |
| |  you lack PostgreSQL and Redis requested by Vercel."  | |
| |                                                       | |
| | [Matched: Python, React] [Missing: PostgreSQL, Redis]  | |
| | [ View Listing ] [ Create Prep Roadmap ]              | |
| +-------------------------------------------------------+ |
+-----------------------------------------------------------+
```

### Roadmap View
```
+-----------------------------------------------------------+
| OpportunityAI | Tools > Career Roadmap                    |
+-----------------------------------------------------------+
| Target: Junior Backend Engineer at Vercel (Postgres, Redis)|
| Local Gemma Model: Gemma 4 E2B (Active)                   |
|                                                           |
| Step 1: PostgreSQL Basics (Est. 6 hours)                  |
|  - Concepts: Schema design, query indexing                |
|  - Resources: Postgres Tutorial, FreeCodeCamp Course      |
|                                                           |
| Step 2: Redis Caching Implementations (Est. 4 hours)      |
|  - Concepts: Key-value operations, TTL strategies         |
|  - Resources: Redis Crash Course, FastAPI-Cache repo      |
|                                                           |
| Suggested Practice Project:                               |
| Title: Containerized API Cache Broker                     |
| Brief: Write a FastAPI CRUD backend using Postgres, cached|
|        by Redis in docker-compose.                        |
|                                                           |
| [ Export to Career Memory ] [ Regenerate ]                |
+-----------------------------------------------------------+
```

---

## 2. Component Hierarchy

### Skill Gap Screen Component Hierarchy
```
SkillGapWorkspace (Page Layout)
├── JDInputForm (Pasted job description text + submission trigger)
└── SkillGapResult (Rendered only on successful analysis)
    ├── MatchScoreIndicator (Circle/Gauge score card)
    ├── MatchSummaryText (Natural language paragraphs)
    └── SkillsClassificationList
        ├── MatchedSkillsList (Green pills)
        ├── WeakSkillsList (Orange pills with details tooltip)
        └── MissingSkillsList (Red pills with source links)
```

### Roadmap Screen Component Hierarchy
```
RoadmapWorkspace (Page Layout)
├── RoadmapHeader (Role Target + Model/latency badge)
├── RoadmapStepsTimeline
│   └── RoadmapStepCard (Iterated step item)
│       ├── StepMetadata (Number, Est hours, title)
│       ├── ConceptPills (Array of strings)
│       └── ResourcesList (Clickable external hyperlinks)
└── PracticeProjectsShowcase
    └── ProjectCard (Layout box with description + requirements)
```

---

## 3. Local AI Loading and Streaming State Design

Since local model inference (Ollama running Gemma 4 E2B) can take multiple seconds, standard loaders do not suffice. The UI uses active feedback:
1. **Activity Progress Bar:** Linear indicator that runs back and forth during raw parsing.
2. **Text Tracer SSE Streamer:** Instead of waiting for the full response, streaming text fields (like Cover Letters or Roadmaps) display a "typing" effect directly rendering incoming tokens as they arrive.
3. **Live Reasoner Badge:** A status badge displaying `"Gemma 4 E2B is generating..."` alongside the current query duration timer (e.g. `1240ms...`).
