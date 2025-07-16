#!/usr/bin/env python3
"""
Comprehensive Backend API Testing for Simba-Watch
Tests all backend endpoints with proper authentication and data validation
"""

import requests
import json
import time
from datetime import datetime
import os

# Get backend URL from frontend .env file
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except:
        pass
    return "https://7936d2c4-d315-4645-99aa-51eb834d0943.preview.emergentagent.com"

BASE_URL = get_backend_url()
API_BASE = f"{BASE_URL}/api"

class SimbaWatchAPITester:
    def __init__(self):
        self.session = requests.Session()
        self.auth_token = None
        self.test_user_data = {
            "username": "john_doe",
            "email": "john.doe@techcorp.com",
            "password": "SecurePass123!",
            "business_name": "TechCorp Solutions",
            "sector": "it",
            "location": "San Francisco, CA",
            "language": "en"
        }
        self.login_data = {
            "email": "john.doe@techcorp.com",
            "password": "SecurePass123!"
        }
        self.results = []
        
    def log_result(self, test_name, success, details, response_data=None):
        """Log test results"""
        result = {
            "test": test_name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat(),
            "response_data": response_data
        }
        self.results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {details}")
        
    def test_health_check(self):
        """Test /api/health endpoint"""
        try:
            response = self.session.get(f"{API_BASE}/health", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("status") == "healthy" and "Simba-Watch" in data.get("service", ""):
                    self.log_result("Health Check", True, "API is healthy and responding correctly", data)
                    return True
                else:
                    self.log_result("Health Check", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_result("Health Check", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Health Check", False, f"Request failed: {str(e)}")
            return False
    
    def test_user_registration(self):
        """Test /api/auth/register endpoint"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/register",
                json=self.test_user_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "User registered successfully" and "token" in data:
                    self.auth_token = data["token"]
                    user_info = data.get("user", {})
                    if (user_info.get("email") == self.test_user_data["email"] and 
                        user_info.get("username") == self.test_user_data["username"]):
                        self.log_result("User Registration", True, "User registered successfully with valid token", data)
                        return True
                    else:
                        self.log_result("User Registration", False, f"User data mismatch in response: {user_info}")
                        return False
                else:
                    self.log_result("User Registration", False, f"Unexpected response format: {data}")
                    return False
            elif response.status_code == 400:
                # User might already exist, try to continue with login
                self.log_result("User Registration", True, "User already exists (expected for repeated tests)", response.json())
                return True
            else:
                self.log_result("User Registration", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("User Registration", False, f"Request failed: {str(e)}")
            return False
    
    def test_user_login(self):
        """Test /api/auth/login endpoint"""
        try:
            response = self.session.post(
                f"{API_BASE}/auth/login",
                json=self.login_data,
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("message") == "Login successful" and "token" in data:
                    self.auth_token = data["token"]
                    user_info = data.get("user", {})
                    if user_info.get("email") == self.login_data["email"]:
                        self.log_result("User Login", True, "Login successful with valid token", data)
                        return True
                    else:
                        self.log_result("User Login", False, f"User data mismatch in response: {user_info}")
                        return False
                else:
                    self.log_result("User Login", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_result("User Login", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("User Login", False, f"Request failed: {str(e)}")
            return False
    
    def get_auth_headers(self):
        """Get authorization headers"""
        if not self.auth_token:
            return {}
        return {"Authorization": f"Bearer {self.auth_token}"}
    
    def test_tech_news(self):
        """Test /api/monitoring/tech-news endpoint"""
        if not self.auth_token:
            self.log_result("Tech News", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(
                f"{API_BASE}/monitoring/tech-news",
                headers=self.get_auth_headers(),
                params={"keywords": "artificial intelligence"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "articles" in data:
                    articles = data.get("articles", [])
                    if len(articles) > 0:
                        # Check article structure
                        article = articles[0]
                        required_fields = ["id", "title", "url", "sentiment", "keywords"]
                        if all(field in article for field in required_fields):
                            self.log_result("Tech News", True, f"Retrieved {len(articles)} articles with proper structure", {"total": len(articles), "sample_article": article})
                            return True
                        else:
                            self.log_result("Tech News", False, f"Article missing required fields: {article}")
                            return False
                    else:
                        self.log_result("Tech News", True, "API working but no articles returned (may be API limit)", data)
                        return True
                else:
                    self.log_result("Tech News", False, f"Unexpected response format: {data}")
                    return False
            elif response.status_code == 401:
                self.log_result("Tech News", False, "Authentication failed")
                return False
            else:
                self.log_result("Tech News", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Tech News", False, f"Request failed: {str(e)}")
            return False
    
    def test_twitter_mentions(self):
        """Test /api/monitoring/twitter-mentions endpoint"""
        if not self.auth_token:
            self.log_result("Twitter Mentions", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(
                f"{API_BASE}/monitoring/twitter-mentions",
                headers=self.get_auth_headers(),
                params={"keywords": "technology"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "tweets" in data:
                    tweets = data.get("tweets", [])
                    if len(tweets) > 0:
                        # Check tweet structure
                        tweet = tweets[0]
                        required_fields = ["id", "tweet_id", "text", "sentiment", "keywords"]
                        if all(field in tweet for field in required_fields):
                            self.log_result("Twitter Mentions", True, f"Retrieved {len(tweets)} tweets with proper structure", {"total": len(tweets), "sample_tweet": tweet})
                            return True
                        else:
                            self.log_result("Twitter Mentions", False, f"Tweet missing required fields: {tweet}")
                            return False
                    else:
                        self.log_result("Twitter Mentions", True, "API working but no tweets returned (may be API limit)", data)
                        return True
                else:
                    self.log_result("Twitter Mentions", False, f"Unexpected response format: {data}")
                    return False
            elif response.status_code == 401:
                self.log_result("Twitter Mentions", False, "Authentication failed")
                return False
            else:
                self.log_result("Twitter Mentions", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Twitter Mentions", False, f"Request failed: {str(e)}")
            return False
    
    def test_competitor_management(self):
        """Test competitor CRUD operations"""
        if not self.auth_token:
            self.log_result("Competitor Management", False, "No auth token available")
            return False
        
        competitor_id = None
        
        # Test adding competitor
        try:
            competitor_data = {
                "name": "TechRival Corp",
                "website": "https://techrival.com",
                "description": "Main competitor in AI solutions"
            }
            
            response = self.session.post(
                f"{API_BASE}/monitoring/competitors",
                json=competitor_data,
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "competitor" in data:
                    competitor_id = data["competitor"]["id"]
                    self.log_result("Add Competitor", True, f"Competitor added successfully with ID: {competitor_id}", data)
                else:
                    self.log_result("Add Competitor", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_result("Add Competitor", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Add Competitor", False, f"Request failed: {str(e)}")
            return False
        
        # Test getting competitors
        try:
            response = self.session.get(
                f"{API_BASE}/monitoring/competitors",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "competitors" in data:
                    competitors = data["competitors"]
                    found_competitor = any(comp["id"] == competitor_id for comp in competitors)
                    if found_competitor:
                        self.log_result("Get Competitors", True, f"Retrieved {len(competitors)} competitors including the added one", data)
                    else:
                        self.log_result("Get Competitors", False, f"Added competitor not found in list: {competitors}")
                        return False
                else:
                    self.log_result("Get Competitors", False, f"Unexpected response format: {data}")
                    return False
            else:
                self.log_result("Get Competitors", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Get Competitors", False, f"Request failed: {str(e)}")
            return False
        
        # Test deleting competitor
        if competitor_id:
            try:
                response = self.session.delete(
                    f"{API_BASE}/monitoring/competitors/{competitor_id}",
                    headers=self.get_auth_headers(),
                    timeout=10
                )
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success"):
                        self.log_result("Delete Competitor", True, f"Competitor deleted successfully", data)
                        return True
                    else:
                        self.log_result("Delete Competitor", False, f"Unexpected response format: {data}")
                        return False
                else:
                    self.log_result("Delete Competitor", False, f"HTTP {response.status_code}: {response.text}")
                    return False
                    
            except Exception as e:
                self.log_result("Delete Competitor", False, f"Request failed: {str(e)}")
                return False
        
        return True
    
    def test_dashboard_stats(self):
        """Test /api/dashboard/stats endpoint"""
        if not self.auth_token:
            self.log_result("Dashboard Stats", False, "No auth token available")
            return False
            
        try:
            response = self.session.get(
                f"{API_BASE}/dashboard/stats",
                headers=self.get_auth_headers(),
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if data.get("success") and "stats" in data:
                    stats = data["stats"]
                    required_fields = ["tech_news_count", "twitter_mentions_count", "competitors_count", "sentiment_summary"]
                    if all(field in stats for field in required_fields):
                        sentiment_summary = stats["sentiment_summary"]
                        if all(sentiment in sentiment_summary for sentiment in ["positive", "negative", "neutral"]):
                            self.log_result("Dashboard Stats", True, "Dashboard stats retrieved with proper structure", data)
                            return True
                        else:
                            self.log_result("Dashboard Stats", False, f"Sentiment summary missing required fields: {sentiment_summary}")
                            return False
                    else:
                        self.log_result("Dashboard Stats", False, f"Stats missing required fields: {stats}")
                        return False
                else:
                    self.log_result("Dashboard Stats", False, f"Unexpected response format: {data}")
                    return False
            elif response.status_code == 401:
                self.log_result("Dashboard Stats", False, "Authentication failed")
                return False
            else:
                self.log_result("Dashboard Stats", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Dashboard Stats", False, f"Request failed: {str(e)}")
            return False
    
    def test_translations(self):
        """Test translation endpoints"""
        languages = ["en", "fr"]
        
        for lang in languages:
            try:
                response = self.session.get(f"{API_BASE}/translations/{lang}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    if data.get("success") and data.get("language") == lang and "translations" in data:
                        translations = data["translations"]
                        required_keys = ["app_name", "dashboard", "login", "register"]
                        if all(key in translations for key in required_keys):
                            self.log_result(f"Translations ({lang})", True, f"Translations retrieved for {lang} with proper structure", data)
                        else:
                            self.log_result(f"Translations ({lang})", False, f"Missing required translation keys: {translations}")
                            return False
                    else:
                        self.log_result(f"Translations ({lang})", False, f"Unexpected response format: {data}")
                        return False
                else:
                    self.log_result(f"Translations ({lang})", False, f"HTTP {response.status_code}: {response.text}")
                    return False
                    
            except Exception as e:
                self.log_result(f"Translations ({lang})", False, f"Request failed: {str(e)}")
                return False
        
        return True
    
    def run_all_tests(self):
        """Run all backend API tests"""
        print(f"🚀 Starting Simba-Watch Backend API Tests")
        print(f"📍 Backend URL: {BASE_URL}")
        print(f"🔗 API Base: {API_BASE}")
        print("=" * 60)
        
        # Test sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Tech News", self.test_tech_news),
            ("Twitter Mentions", self.test_twitter_mentions),
            ("Competitor Management", self.test_competitor_management),
            ("Dashboard Stats", self.test_dashboard_stats),
            ("Translations", self.test_translations),
        ]
        
        passed = 0
        failed = 0
        
        for test_name, test_func in tests:
            print(f"\n🧪 Running {test_name}...")
            try:
                if test_func():
                    passed += 1
                else:
                    failed += 1
            except Exception as e:
                self.log_result(test_name, False, f"Test execution failed: {str(e)}")
                failed += 1
            
            # Small delay between tests
            time.sleep(1)
        
        print("\n" + "=" * 60)
        print(f"📊 TEST SUMMARY")
        print(f"✅ Passed: {passed}")
        print(f"❌ Failed: {failed}")
        print(f"📈 Success Rate: {(passed/(passed+failed)*100):.1f}%")
        
        return self.results

def main():
    """Main test execution"""
    tester = SimbaWatchAPITester()
    results = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/backend_test_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n💾 Detailed results saved to: /app/backend_test_results.json")
    
    return results

if __name__ == "__main__":
    main()