from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, func, JSON
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    profile = relationship("Profile", back_populates="user", uselist=False, cascade="all, delete-orphan")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete-orphan")
    skill_gap_reports = relationship("SkillGapReport", back_populates="user", cascade="all, delete-orphan")
    roadmaps = relationship("Roadmap", back_populates="user", cascade="all, delete-orphan")

class Profile(Base):
    __tablename__ = 'profiles'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    education = Column(JSON, nullable=False)
    target_roles = Column(JSON, nullable=False)
    location = Column(String(255), nullable=False)
    preferred_language = Column(String(50), nullable=False)
    career_memory = Column(JSON, default=[], nullable=False)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now(), nullable=False)

    user = relationship("User", back_populates="profile")

class Resume(Base):
    __tablename__ = 'resumes'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    file_name = Column(String(255), nullable=False)
    storage_path = Column(String(512), nullable=False)
    extracted_text = Column(Text, nullable=False)
    parsed_json = Column(JSON, nullable=False)
    confidence_scores = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="resumes")

class Opportunity(Base):
    __tablename__ = 'opportunities'
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    company = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    opportunity_type = Column(String(50), nullable=False) # job, internship, hackathon, project
    url = Column(String(512), nullable=False)
    location = Column(String(255), nullable=False)
    skills_required = Column(JSON, nullable=False)
    posted_at = Column(DateTime, default=func.now(), nullable=False)

class SkillGapReport(Base):
    __tablename__ = 'skill_gap_reports'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    job_description = Column(Text, nullable=False)
    overall_match_percentage = Column(Integer, nullable=False)
    gap_summary = Column(Text, nullable=False)
    skills = Column(JSON, nullable=False)
    roadmap_seed_skills = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="skill_gap_reports")
    roadmaps = relationship("Roadmap", back_populates="skill_gap_report", cascade="all, delete-orphan")

class Roadmap(Base):
    __tablename__ = 'roadmaps'
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    skill_gap_report_id = Column(Integer, ForeignKey('skill_gap_reports.id', ondelete='SET NULL'), nullable=True)
    role_title = Column(String(255), nullable=False)
    steps = Column(JSON, nullable=False)
    projects = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)

    user = relationship("User", back_populates="roadmaps")
    skill_gap_report = relationship("SkillGapReport", back_populates="roadmaps")

class AICallLog(Base):
    __tablename__ = 'ai_call_logs'
    id = Column(Integer, primary_key=True, index=True)
    function_name = Column(String(100), nullable=False)
    input_summary = Column(Text, nullable=False)
    duration_ms = Column(Integer, nullable=False)
    output_schema = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=func.now(), nullable=False)
