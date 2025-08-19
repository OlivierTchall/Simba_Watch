from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import os
import hashlib
import jwt
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import httpx
import re
from textblob import TextBlob
import json

# Environment variables
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '7cdbae1ef22b4adda9740958b0383f13')
TWITTER_BEARER_TOKEN = os.environ.get('TWITTER_BEARER_TOKEN', 'AAAAAAAAAAAAAAAAAAAAABVj3AEAAAAAmhiW9ldmhlJ64ANMCoU35THhqBs%3DkgmhbKcZ6ALLft36nJxj0Z6OFLLHjjSFYqrFcABaE2QOk3GTx2')
JWT_SECRET = os.environ.get('JWT_SECRET', 'simba-watch-secret-key-2024')
PORT = int(os.environ.get('PORT', 8001))

app = FastAPI(title="Simba-Watch API", version="1.0.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database connection
client = AsyncIOMotorClient(MONGO_URL)
db = client.simba_watch

# Security
security = HTTPBearer()

# Pydantic models
class UserRegister(BaseModel):
    username: str
    email: str
    password: str
    business_name: Optional[str] = None
    sector: str
    location: str
    language: str = "en"

class UserLogin(BaseModel):
    email: str
    password: str

class CompetitorAdd(BaseModel):
    name: str
    website: Optional[str] = None
    description: Optional[str] = None

class MonitoringAlert(BaseModel):
    keywords: List[str]
    alert_type: str  # "tech", "competitor", "credibility", "marketing"
    frequency: str = "daily"

class User(BaseModel):
    id: str
    username: str
    email: str
    business_name: Optional[str] = None
    sector: str
    location: str
    language: str = "en"
    created_at: datetime

# Utility functions
def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    return hash_password(password) == hashed

def create_jwt_token(user_id: str) -> str:
    payload = {
        "user_id": user_id,
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def verify_jwt_token(token: str) -> Optional[str]:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        return payload.get("user_id")
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = verify_jwt_token(credentials.credentials)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    user = await db.users.find_one({"id": user_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

def analyze_sentiment(text: str) -> Dict[str, Any]:
    """Basic sentiment analysis using TextBlob"""
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity
    
    if polarity > 0.1:
        sentiment = "positive"
    elif polarity < -0.1:
        sentiment = "negative"
    else:
        sentiment = "neutral"
    
    return {
        "sentiment": sentiment,
        "polarity": polarity,
        "subjectivity": blob.sentiment.subjectivity
    }

# API Routes

@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "Simba-Watch API"}

# Authentication endpoints
@app.post("/api/auth/register")
async def register_user(user_data: UserRegister):
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "username": user_data.username,
        "email": user_data.email,
        "password": hash_password(user_data.password),
        "business_name": user_data.business_name,
        "sector": user_data.sector,
        "location": user_data.location,
        "language": user_data.language,
        "created_at": datetime.utcnow()
    }
    
    await db.users.insert_one(user_doc)
    token = create_jwt_token(user_id)
    
    return {
        "message": "User registered successfully",
        "token": token,
        "user": {
            "id": user_id,
            "username": user_data.username,
            "email": user_data.email,
            "business_name": user_data.business_name,
            "sector": user_data.sector,
            "location": user_data.location,
            "language": user_data.language
        }
    }

@app.post("/api/auth/login")
async def login_user(login_data: UserLogin):
    user = await db.users.find_one({"email": login_data.email})
    if not user or not verify_password(login_data.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_jwt_token(user["id"])
    return {
        "message": "Login successful",
        "token": token,
        "user": {
            "id": user["id"],
            "username": user["username"],
            "email": user["email"],
            "business_name": user.get("business_name"),
            "sector": user["sector"],
            "location": user["location"],
            "language": user["language"]
        }
    }

@app.get("/api/user/profile")
async def get_user_profile(current_user: dict = Depends(get_current_user)):
    return {
        "id": current_user["id"],
        "username": current_user["username"],
        "email": current_user["email"],
        "business_name": current_user.get("business_name"),
        "sector": current_user["sector"],
        "location": current_user["location"],
        "language": current_user["language"]
    }

# News monitoring endpoints
@app.get("/api/monitoring/tech-news")
async def get_tech_news(
    keywords: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Fetch technology news using NewsAPI"""
    
    # Default keywords based on sectors
    sector_keywords = {
        "primary": "agriculture technology, mining technology, renewable energy",
        "secondary": "manufacturing technology, industrial automation, IoT",
        "tertiary": "fintech, service technology, digital transformation",
        "it": "software development, cybersecurity, cloud computing",
        "ai": "artificial intelligence, machine learning, deep learning",
        "marketing": "digital marketing, social media marketing, martech"
    }
    
    search_query = keywords or sector_keywords.get(current_user["sector"], "technology")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://newsapi.org/v2/everything",
                params={
                    "q": search_query,
                    "apiKey": NEWS_API_KEY,
                    "sortBy": "publishedAt",
                    "pageSize": 20,
                    "language": "en"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                articles = []
                
                for article in data.get("articles", []):
                    # Analyze sentiment
                    sentiment_data = analyze_sentiment(article.get("title", "") + " " + article.get("description", ""))
                    
                    processed_article = {
                        "id": str(uuid.uuid4()),
                        "title": article.get("title"),
                        "description": article.get("description"),
                        "url": article.get("url"),
                        "source": article.get("source", {}).get("name"),
                        "published_at": article.get("publishedAt"),
                        "image_url": article.get("urlToImage"),
                        "sentiment": sentiment_data,
                        "keywords": search_query.split(", "),
                        "fetched_at": datetime.utcnow().isoformat()
                    }
                    articles.append(processed_article)
                
                # Store in database
                if articles:
                    await db.tech_news.insert_many(articles)
                
                # Remove MongoDB _id field from articles before returning
                for article in articles:
                    article.pop("_id", None)
                
                return {
                    "success": True,
                    "articles": articles,
                    "total": len(articles),
                    "keywords": search_query
                }
            else:
                return {"success": False, "error": "Failed to fetch news"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

@app.get("/api/monitoring/twitter-mentions")
async def get_twitter_mentions(
    keywords: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """Fetch Twitter mentions using Twitter API v2"""
    
    search_query = keywords or current_user.get("business_name", "technology")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                "https://api.twitter.com/2/tweets/search/recent",
                params={
                    "query": search_query,
                    "max_results": 20,
                    "tweet.fields": "created_at,public_metrics,context_annotations,lang"
                },
                headers={
                    "Authorization": f"Bearer {TWITTER_BEARER_TOKEN}"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                tweets = []
                
                for tweet in data.get("data", []):
                    # Analyze sentiment
                    sentiment_data = analyze_sentiment(tweet.get("text", ""))
                    
                    processed_tweet = {
                        "id": str(uuid.uuid4()),
                        "tweet_id": tweet.get("id"),
                        "text": tweet.get("text"),
                        "created_at": tweet.get("created_at"),
                        "public_metrics": tweet.get("public_metrics", {}),
                        "sentiment": sentiment_data,
                        "keywords": search_query.split(", "),
                        "fetched_at": datetime.utcnow().isoformat()
                    }
                    tweets.append(processed_tweet)
                
                # Store in database
                if tweets:
                    await db.twitter_mentions.insert_many(tweets)
                
                # Remove MongoDB _id field from tweets before returning
                for tweet in tweets:
                    tweet.pop("_id", None)
                
                return {
                    "success": True,
                    "tweets": tweets,
                    "total": len(tweets),
                    "keywords": search_query
                }
            else:
                return {"success": False, "error": f"Twitter API error: {response.status_code}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

# Competitor monitoring endpoints
@app.post("/api/monitoring/competitors")
async def add_competitor(
    competitor_data: CompetitorAdd,
    current_user: dict = Depends(get_current_user)
):
    """Add a competitor for monitoring"""
    
    competitor_id = str(uuid.uuid4())
    competitor_doc = {
        "id": competitor_id,
        "user_id": current_user["id"],
        "name": competitor_data.name,
        "website": competitor_data.website,
        "description": competitor_data.description,
        "created_at": datetime.utcnow()
    }
    
    await db.competitors.insert_one(competitor_doc)
    
    # Remove MongoDB _id field before returning
    competitor_doc.pop("_id", None)
    
    return {
        "success": True,
        "message": "Competitor added successfully",
        "competitor": competitor_doc
    }

@app.get("/api/monitoring/competitors")
async def get_competitors(current_user: dict = Depends(get_current_user)):
    """Get all competitors for current user"""
    
    cursor = db.competitors.find({"user_id": current_user["id"]})
    competitors = await cursor.to_list(length=None)
    
    # Remove MongoDB _id field
    for competitor in competitors:
        competitor.pop("_id", None)
    
    return {
        "success": True,
        "competitors": competitors
    }

@app.delete("/api/monitoring/competitors/{competitor_id}")
async def delete_competitor(
    competitor_id: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete a competitor"""
    
    result = await db.competitors.delete_one({
        "id": competitor_id,
        "user_id": current_user["id"]
    })
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Competitor not found")
    
    return {"success": True, "message": "Competitor deleted successfully"}

# Dashboard endpoints
@app.get("/api/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    """Get dashboard statistics"""
    
    # Count various metrics
    tech_news_count = await db.tech_news.count_documents({})
    twitter_mentions_count = await db.twitter_mentions.count_documents({})
    competitors_count = await db.competitors.count_documents({"user_id": current_user["id"]})
    
    # Get recent sentiment analysis
    recent_tweets = await db.twitter_mentions.find({}).sort("fetched_at", -1).limit(10).to_list(length=None)
    
    sentiment_summary = {"positive": 0, "negative": 0, "neutral": 0}
    for tweet in recent_tweets:
        sentiment = tweet.get("sentiment", {}).get("sentiment", "neutral")
        sentiment_summary[sentiment] += 1
    
    return {
        "success": True,
        "stats": {
            "tech_news_count": tech_news_count,
            "twitter_mentions_count": twitter_mentions_count,
            "competitors_count": competitors_count,
            "sentiment_summary": sentiment_summary
        }
    }

@app.get("/api/dashboard/recent-activity")
async def get_recent_activity(current_user: dict = Depends(get_current_user)):
    """Get recent monitoring activity"""
    
    # Get recent tech news
    recent_news = await db.tech_news.find({}).sort("fetched_at", -1).limit(5).to_list(length=None)
    
    # Get recent Twitter mentions
    recent_tweets = await db.twitter_mentions.find({}).sort("fetched_at", -1).limit(5).to_list(length=None)
    
    # Remove MongoDB _id fields
    for item in recent_news:
        item.pop("_id", None)
    for item in recent_tweets:
        item.pop("_id", None)
    
    return {
        "success": True,
        "recent_news": recent_news,
        "recent_tweets": recent_tweets
    }

# Monitoring alerts endpoints
@app.post("/api/monitoring/alerts")
async def create_monitoring_alert(
    alert_data: MonitoringAlert,
    current_user: dict = Depends(get_current_user)
):
    """Create a monitoring alert"""
    
    alert_id = str(uuid.uuid4())
    alert_doc = {
        "id": alert_id,
        "user_id": current_user["id"],
        "keywords": alert_data.keywords,
        "alert_type": alert_data.alert_type,
        "frequency": alert_data.frequency,
        "is_active": True,
        "created_at": datetime.utcnow()
    }
    
    await db.monitoring_alerts.insert_one(alert_doc)
    
    return {
        "success": True,
        "message": "Monitoring alert created successfully",
        "alert": alert_doc
    }

@app.get("/api/monitoring/alerts")
async def get_monitoring_alerts(current_user: dict = Depends(get_current_user)):
    """Get all monitoring alerts for current user"""
    
    cursor = db.monitoring_alerts.find({"user_id": current_user["id"]})
    alerts = await cursor.to_list(length=None)
    
    # Remove MongoDB _id field
    for alert in alerts:
        alert.pop("_id", None)
    
    return {
        "success": True,
        "alerts": alerts
    }

# Language support endpoint
@app.get("/api/translations/{lang}")
async def get_translations(lang: str):
    """Get translations for the specified language"""
    
    translations = {
        "en": {
            "app_name": "Simba-Watch",
            "dashboard": "Dashboard",
            "technology_monitoring": "Technology Monitoring",
            "competitive_monitoring": "Competitive Monitoring",
            "credibility_monitoring": "Credibility Monitoring",
            "marketing_monitoring": "Marketing Monitoring",
            "recent_news": "Recent News",
            "recent_mentions": "Recent Mentions",
            "competitors": "Competitors",
            "add_competitor": "Add Competitor",
            "sentiment_analysis": "Sentiment Analysis",
            "positive": "Positive",
            "negative": "Negative",
            "neutral": "Neutral",
            "login": "Login",
            "register": "Register",
            "logout": "Logout",
            "profile": "Profile",
            "settings": "Settings"
        },
        "fr": {
            "app_name": "Simba-Watch",
            "dashboard": "Tableau de bord",
            "technology_monitoring": "Veille technologique",
            "competitive_monitoring": "Veille concurrentielle",
            "credibility_monitoring": "Veille de crédibilité",
            "marketing_monitoring": "Veille marketing",
            "recent_news": "Actualités récentes",
            "recent_mentions": "Mentions récentes",
            "competitors": "Concurrents",
            "add_competitor": "Ajouter un concurrent",
            "sentiment_analysis": "Analyse des sentiments",
            "positive": "Positif",
            "negative": "Négatif",
            "neutral": "Neutre",
            "login": "Connexion",
            "register": "S'inscrire",
            "logout": "Déconnexion",
            "profile": "Profil",
            "settings": "Paramètres"
        }
    }
    
    return {
        "success": True,
        "language": lang,
        "translations": translations.get(lang, translations["en"])
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=PORT)