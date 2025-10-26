#!/usr/bin/env python3
"""
Comprehensive Backend API Tests for RUDN Schedule API
Tests all endpoints with real data and proper error handling
"""

import requests
import json
import time
import sys
from typing import Dict, List, Optional

# Configuration
BACKEND_URL = "https://rudn-schedule.ru/api"
TIMEOUT = 30  # 30 seconds timeout for RUDN API calls

class RUDNScheduleAPITester:
    def __init__(self):
        self.base_url = BACKEND_URL
        self.session = requests.Session()
        self.session.timeout = TIMEOUT
        self.test_results = []
        self.test_data = {}
        
    def log_test(self, test_name: str, success: bool, message: str, details: Optional[Dict] = None):
        """Log test result"""
        result = {
            "test": test_name,
            "success": success,
            "message": message,
            "details": details or {}
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}: {message}")
        if details:
            print(f"   Details: {json.dumps(details, indent=2, ensure_ascii=False)}")
        print()
    
    def test_faculties_endpoint(self) -> bool:
        """Test GET /api/faculties endpoint"""
        try:
            print("🔍 Testing GET /api/faculties...")
            response = self.session.get(f"{self.base_url}/faculties")
            
            if response.status_code != 200:
                self.log_test("GET /api/faculties", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            faculties = response.json()
            
            # Validate response structure
            if not isinstance(faculties, list):
                self.log_test("GET /api/faculties", False, 
                            "Response is not a list")
                return False
            
            if len(faculties) < 5:
                self.log_test("GET /api/faculties", False, 
                            f"Expected at least 5 faculties, got {len(faculties)}")
                return False
            
            # Validate faculty structure
            for faculty in faculties[:3]:  # Check first 3
                if not isinstance(faculty, dict) or 'id' not in faculty or 'name' not in faculty:
                    self.log_test("GET /api/faculties", False, 
                                "Faculty missing required fields (id, name)")
                    return False
            
            # Store test data for later use
            self.test_data['faculties'] = faculties
            self.test_data['test_faculty'] = faculties[0]  # Use first faculty for testing
            
            self.log_test("GET /api/faculties", True, 
                        f"Successfully retrieved {len(faculties)} faculties",
                        {"sample_faculty": faculties[0], "total_count": len(faculties)})
            return True
            
        except requests.exceptions.Timeout:
            self.log_test("GET /api/faculties", False, 
                        "Request timeout (30s) - RUDN API may be slow")
            return False
        except Exception as e:
            self.log_test("GET /api/faculties", False, f"Exception: {str(e)}")
            return False
    
    def test_filter_data_endpoint(self) -> bool:
        """Test POST /api/filter-data endpoint"""
        try:
            print("🔍 Testing POST /api/filter-data...")
            
            if 'test_faculty' not in self.test_data:
                self.log_test("POST /api/filter-data", False, 
                            "No faculty data available from previous test")
                return False
            
            faculty_id = self.test_data['test_faculty']['id']
            payload = {"facultet_id": faculty_id}
            
            response = self.session.post(
                f"{self.base_url}/filter-data",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                self.log_test("POST /api/filter-data", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            filter_data = response.json()
            
            # Validate response structure
            required_fields = ['levels', 'courses', 'forms', 'groups']
            for field in required_fields:
                if field not in filter_data:
                    self.log_test("POST /api/filter-data", False, 
                                f"Missing required field: {field}")
                    return False
            
            # Check that levels has data
            if not filter_data['levels']:
                self.log_test("POST /api/filter-data", False, 
                            "No levels data returned")
                return False
            
            # Store test data for schedule testing
            self.test_data['filter_data'] = filter_data
            if filter_data['levels']:
                self.test_data['test_level'] = filter_data['levels'][0]
            if filter_data['courses']:
                self.test_data['test_course'] = filter_data['courses'][0]
            if filter_data['forms']:
                self.test_data['test_form'] = filter_data['forms'][0]
            
            self.log_test("POST /api/filter-data", True, 
                        f"Successfully retrieved filter data for faculty {faculty_id}",
                        {
                            "levels_count": len(filter_data['levels']),
                            "courses_count": len(filter_data['courses']),
                            "forms_count": len(filter_data['forms']),
                            "groups_count": len(filter_data['groups'])
                        })
            return True
            
        except requests.exceptions.Timeout:
            self.log_test("POST /api/filter-data", False, 
                        "Request timeout (30s) - RUDN API may be slow")
            return False
        except Exception as e:
            self.log_test("POST /api/filter-data", False, f"Exception: {str(e)}")
            return False
    
    def test_get_groups_for_schedule(self) -> bool:
        """Get groups data for schedule testing"""
        try:
            print("🔍 Getting groups data for schedule testing...")
            
            if not all(key in self.test_data for key in ['test_faculty', 'test_level', 'test_course', 'test_form']):
                self.log_test("Get Groups Data", False, 
                            "Missing required test data from previous tests")
                return False
            
            # Try different combinations to find groups
            combinations = [
                # Full combination
                {
                    "facultet_id": self.test_data['test_faculty']['id'],
                    "level_id": self.test_data['test_level']['value'],
                    "kurs": self.test_data['test_course']['value'],
                    "form_code": self.test_data['test_form']['value']
                },
                # Without form
                {
                    "facultet_id": self.test_data['test_faculty']['id'],
                    "level_id": self.test_data['test_level']['value'],
                    "kurs": self.test_data['test_course']['value']
                },
                # Just faculty and level
                {
                    "facultet_id": self.test_data['test_faculty']['id'],
                    "level_id": self.test_data['test_level']['value']
                },
                # Just faculty
                {
                    "facultet_id": self.test_data['test_faculty']['id']
                }
            ]
            
            for i, payload in enumerate(combinations):
                response = self.session.post(
                    f"{self.base_url}/filter-data",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                if response.status_code != 200:
                    continue
                
                filter_data = response.json()
                
                if filter_data.get('groups'):
                    self.test_data['test_group'] = filter_data['groups'][0]
                    # Update other test data based on what worked
                    if 'levels' in filter_data and filter_data['levels']:
                        self.test_data['test_level'] = filter_data['levels'][0]
                    if 'courses' in filter_data and filter_data['courses']:
                        self.test_data['test_course'] = filter_data['courses'][0]
                    if 'forms' in filter_data and filter_data['forms']:
                        self.test_data['test_form'] = filter_data['forms'][0]
                    
                    self.log_test("Get Groups Data", True, 
                                f"Found {len(filter_data['groups'])} groups (combination {i+1})",
                                {"sample_group": filter_data['groups'][0], "payload_used": payload})
                    return True
            
            self.log_test("Get Groups Data", False, 
                        "No groups found with any parameter combination")
            return False
            
        except Exception as e:
            self.log_test("Get Groups Data", False, f"Exception: {str(e)}")
            return False
    
    def test_schedule_endpoint(self) -> bool:
        """Test POST /api/schedule endpoint"""
        try:
            print("🔍 Testing POST /api/schedule...")
            
            required_keys = ['test_faculty', 'test_level', 'test_course', 'test_form', 'test_group']
            if not all(key in self.test_data for key in required_keys):
                self.log_test("POST /api/schedule", False, 
                            "Missing required test data from previous tests")
                return False
            
            payload = {
                "facultet_id": self.test_data['test_faculty']['id'],
                "level_id": self.test_data['test_level']['value'],
                "kurs": self.test_data['test_course']['value'],
                "form_code": self.test_data['test_form']['value'],
                "group_id": self.test_data['test_group']['value'],
                "week_number": 1
            }
            
            response = self.session.post(
                f"{self.base_url}/schedule",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                self.log_test("POST /api/schedule", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            schedule_data = response.json()
            
            # Validate response structure
            required_fields = ['events', 'group_id', 'week_number']
            for field in required_fields:
                if field not in schedule_data:
                    self.log_test("POST /api/schedule", False, 
                                f"Missing required field: {field}")
                    return False
            
            # Validate events is array
            if not isinstance(schedule_data['events'], list):
                self.log_test("POST /api/schedule", False, 
                            "Events field is not an array")
                return False
            
            # Store for user settings test
            self.test_data['schedule_data'] = schedule_data
            
            self.log_test("POST /api/schedule", True, 
                        f"Successfully retrieved schedule with {len(schedule_data['events'])} events",
                        {
                            "group_id": schedule_data['group_id'],
                            "week_number": schedule_data['week_number'],
                            "events_count": len(schedule_data['events']),
                            "sample_event": schedule_data['events'][0] if schedule_data['events'] else None
                        })
            return True
            
        except requests.exceptions.Timeout:
            self.log_test("POST /api/schedule", False, 
                        "Request timeout (30s) - RUDN API may be slow")
            return False
        except Exception as e:
            self.log_test("POST /api/schedule", False, f"Exception: {str(e)}")
            return False
    
    def test_save_user_settings(self) -> bool:
        """Test POST /api/user-settings endpoint"""
        try:
            print("🔍 Testing POST /api/user-settings...")
            
            # Use real data from previous tests if available, otherwise use test data
            if 'test_group' in self.test_data and 'test_faculty' in self.test_data:
                payload = {
                    "telegram_id": 123456789,
                    "username": "testuser_rudn",
                    "first_name": "Иван",
                    "last_name": "Петров",
                    "group_id": self.test_data['test_group']['value'],
                    "group_name": self.test_data['test_group']['label'] or self.test_data['test_group']['name'] or "Тестовая группа",
                    "facultet_id": self.test_data['test_faculty']['id'],
                    "level_id": self.test_data.get('test_level', {}).get('value', 'test-level-id'),
                    "kurs": self.test_data.get('test_course', {}).get('value', '1'),
                    "form_code": self.test_data.get('test_form', {}).get('value', 'д')
                }
            else:
                # Fallback to test data from request
                payload = {
                    "telegram_id": 123456789,
                    "username": "testuser",
                    "first_name": "Test",
                    "last_name": "User",
                    "group_id": "test-group-id",
                    "group_name": "Тестовая группа",
                    "facultet_id": "test-facultet-id",
                    "level_id": "test-level-id",
                    "kurs": "1",
                    "form_code": "д"
                }
            
            response = self.session.post(
                f"{self.base_url}/user-settings",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                self.log_test("POST /api/user-settings", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            user_data = response.json()
            
            # Validate response structure
            required_fields = ['id', 'telegram_id', 'group_id', 'group_name', 'created_at']
            for field in required_fields:
                if field not in user_data:
                    self.log_test("POST /api/user-settings", False, 
                                f"Missing required field: {field}")
                    return False
            
            # Validate telegram_id matches
            if user_data['telegram_id'] != payload['telegram_id']:
                self.log_test("POST /api/user-settings", False, 
                            "Telegram ID mismatch in response")
                return False
            
            self.test_data['saved_user'] = user_data
            
            self.log_test("POST /api/user-settings", True, 
                        "Successfully saved user settings",
                        {
                            "user_id": user_data['id'],
                            "telegram_id": user_data['telegram_id'],
                            "group_name": user_data['group_name']
                        })
            return True
            
        except Exception as e:
            self.log_test("POST /api/user-settings", False, f"Exception: {str(e)}")
            return False
    
    def test_get_user_settings(self) -> bool:
        """Test GET /api/user-settings/{telegram_id} endpoint"""
        try:
            print("🔍 Testing GET /api/user-settings/{telegram_id}...")
            
            telegram_id = 123456789
            response = self.session.get(f"{self.base_url}/user-settings/{telegram_id}")
            
            if response.status_code != 200:
                self.log_test("GET /api/user-settings/{telegram_id}", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            user_data = response.json()
            
            # Validate response structure
            required_fields = ['id', 'telegram_id', 'group_id', 'group_name']
            for field in required_fields:
                if field not in user_data:
                    self.log_test("GET /api/user-settings/{telegram_id}", False, 
                                f"Missing required field: {field}")
                    return False
            
            # Validate telegram_id matches
            if user_data['telegram_id'] != telegram_id:
                self.log_test("GET /api/user-settings/{telegram_id}", False, 
                            "Telegram ID mismatch in response")
                return False
            
            self.log_test("GET /api/user-settings/{telegram_id}", True, 
                        "Successfully retrieved user settings",
                        {
                            "user_id": user_data['id'],
                            "telegram_id": user_data['telegram_id'],
                            "group_name": user_data['group_name']
                        })
            return True
            
        except Exception as e:
            self.log_test("GET /api/user-settings/{telegram_id}", False, f"Exception: {str(e)}")
            return False
    
    def test_get_nonexistent_user(self) -> bool:
        """Test error handling for non-existent user"""
        try:
            print("🔍 Testing error handling for non-existent user...")
            
            nonexistent_id = 999999999
            response = self.session.get(f"{self.base_url}/user-settings/{nonexistent_id}")
            
            if response.status_code != 404:
                self.log_test("Error Handling - Non-existent User", False, 
                            f"Expected HTTP 404, got {response.status_code}")
                return False
            
            self.log_test("Error Handling - Non-existent User", True, 
                        "Correctly returned 404 for non-existent user")
            return True
            
        except Exception as e:
            self.log_test("Error Handling - Non-existent User", False, f"Exception: {str(e)}")
            return False

    def test_create_user_with_default_notifications(self) -> bool:
        """Test POST /api/user-settings creates user with default notification settings"""
        try:
            print("🔍 Testing POST /api/user-settings with default notifications...")
            
            # Create test user with telegram_id = 999999
            test_telegram_id = 999999
            payload = {
                "telegram_id": test_telegram_id,
                "username": "notification_test_user",
                "first_name": "Тест",
                "last_name": "Уведомления",
                "group_id": "test-group-notifications",
                "group_name": "Тестовая группа для уведомлений",
                "facultet_id": "test-facultet-notifications",
                "level_id": "test-level-notifications",
                "kurs": "1",
                "form_code": "д"
            }
            
            response = self.session.post(
                f"{self.base_url}/user-settings",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                self.log_test("POST /api/user-settings (default notifications)", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            user_data = response.json()
            
            # Validate response structure
            required_fields = ['id', 'telegram_id', 'group_id', 'group_name', 'created_at']
            for field in required_fields:
                if field not in user_data:
                    self.log_test("POST /api/user-settings (default notifications)", False, 
                                f"Missing required field: {field}")
                    return False
            
            # Store test user for notification tests
            self.test_data['notification_test_user'] = user_data
            
            self.log_test("POST /api/user-settings (default notifications)", True, 
                        "Successfully created user for notification testing",
                        {
                            "user_id": user_data['id'],
                            "telegram_id": user_data['telegram_id']
                        })
            return True
            
        except Exception as e:
            self.log_test("POST /api/user-settings (default notifications)", False, f"Exception: {str(e)}")
            return False

    def test_get_default_notification_settings(self) -> bool:
        """Test GET /api/user-settings/{telegram_id}/notifications returns default settings"""
        try:
            print("🔍 Testing GET /api/user-settings/{telegram_id}/notifications (default settings)...")
            
            test_telegram_id = 999999
            response = self.session.get(f"{self.base_url}/user-settings/{test_telegram_id}/notifications")
            
            if response.status_code != 200:
                self.log_test("GET /api/user-settings/{telegram_id}/notifications (default)", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            notification_data = response.json()
            
            # Validate response structure
            required_fields = ['notifications_enabled', 'notification_time', 'telegram_id']
            for field in required_fields:
                if field not in notification_data:
                    self.log_test("GET /api/user-settings/{telegram_id}/notifications (default)", False, 
                                f"Missing required field: {field}")
                    return False
            
            # Check default values
            if notification_data['notifications_enabled'] != False:
                self.log_test("GET /api/user-settings/{telegram_id}/notifications (default)", False, 
                            f"Expected notifications_enabled=false, got {notification_data['notifications_enabled']}")
                return False
            
            if notification_data['notification_time'] != 10:
                self.log_test("GET /api/user-settings/{telegram_id}/notifications (default)", False, 
                            f"Expected notification_time=10, got {notification_data['notification_time']}")
                return False
            
            if notification_data['telegram_id'] != test_telegram_id:
                self.log_test("GET /api/user-settings/{telegram_id}/notifications (default)", False, 
                            "Telegram ID mismatch in response")
                return False
            
            self.log_test("GET /api/user-settings/{telegram_id}/notifications (default)", True, 
                        "Successfully retrieved default notification settings",
                        {
                            "notifications_enabled": notification_data['notifications_enabled'],
                            "notification_time": notification_data['notification_time'],
                            "telegram_id": notification_data['telegram_id']
                        })
            return True
            
        except Exception as e:
            self.log_test("GET /api/user-settings/{telegram_id}/notifications (default)", False, f"Exception: {str(e)}")
            return False

    def test_update_notification_settings(self) -> bool:
        """Test PUT /api/user-settings/{telegram_id}/notifications updates settings"""
        try:
            print("🔍 Testing PUT /api/user-settings/{telegram_id}/notifications...")
            
            test_telegram_id = 999999
            payload = {
                "notifications_enabled": True,
                "notification_time": 15
            }
            
            response = self.session.put(
                f"{self.base_url}/user-settings/{test_telegram_id}/notifications",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            if response.status_code != 200:
                self.log_test("PUT /api/user-settings/{telegram_id}/notifications", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            notification_data = response.json()
            
            # Validate response structure
            required_fields = ['notifications_enabled', 'notification_time', 'telegram_id']
            for field in required_fields:
                if field not in notification_data:
                    self.log_test("PUT /api/user-settings/{telegram_id}/notifications", False, 
                                f"Missing required field: {field}")
                    return False
            
            # Check updated values
            if notification_data['notifications_enabled'] != True:
                self.log_test("PUT /api/user-settings/{telegram_id}/notifications", False, 
                            f"Expected notifications_enabled=true, got {notification_data['notifications_enabled']}")
                return False
            
            if notification_data['notification_time'] != 15:
                self.log_test("PUT /api/user-settings/{telegram_id}/notifications", False, 
                            f"Expected notification_time=15, got {notification_data['notification_time']}")
                return False
            
            self.log_test("PUT /api/user-settings/{telegram_id}/notifications", True, 
                        "Successfully updated notification settings",
                        {
                            "notifications_enabled": notification_data['notifications_enabled'],
                            "notification_time": notification_data['notification_time'],
                            "telegram_id": notification_data['telegram_id']
                        })
            return True
            
        except Exception as e:
            self.log_test("PUT /api/user-settings/{telegram_id}/notifications", False, f"Exception: {str(e)}")
            return False

    def test_verify_notification_settings_persisted(self) -> bool:
        """Test GET /api/user-settings/{telegram_id}/notifications returns updated settings"""
        try:
            print("🔍 Testing notification settings persistence...")
            
            test_telegram_id = 999999
            response = self.session.get(f"{self.base_url}/user-settings/{test_telegram_id}/notifications")
            
            if response.status_code != 200:
                self.log_test("GET /api/user-settings/{telegram_id}/notifications (updated)", False, 
                            f"HTTP {response.status_code}: {response.text}")
                return False
            
            notification_data = response.json()
            
            # Check that settings were persisted correctly
            if notification_data['notifications_enabled'] != True:
                self.log_test("GET /api/user-settings/{telegram_id}/notifications (updated)", False, 
                            f"Settings not persisted: notifications_enabled={notification_data['notifications_enabled']}")
                return False
            
            if notification_data['notification_time'] != 15:
                self.log_test("GET /api/user-settings/{telegram_id}/notifications (updated)", False, 
                            f"Settings not persisted: notification_time={notification_data['notification_time']}")
                return False
            
            self.log_test("GET /api/user-settings/{telegram_id}/notifications (updated)", True, 
                        "Successfully verified notification settings persistence",
                        {
                            "notifications_enabled": notification_data['notifications_enabled'],
                            "notification_time": notification_data['notification_time']
                        })
            return True
            
        except Exception as e:
            self.log_test("GET /api/user-settings/{telegram_id}/notifications (updated)", False, f"Exception: {str(e)}")
            return False

    def test_invalid_notification_time_values(self) -> bool:
        """Test PUT /api/user-settings/{telegram_id}/notifications with invalid time values"""
        try:
            print("🔍 Testing invalid notification time values...")
            
            test_telegram_id = 999999
            invalid_values = [4, 31]  # time < 5, time > 30
            
            for invalid_time in invalid_values:
                payload = {
                    "notifications_enabled": True,
                    "notification_time": invalid_time
                }
                
                response = self.session.put(
                    f"{self.base_url}/user-settings/{test_telegram_id}/notifications",
                    json=payload,
                    headers={"Content-Type": "application/json"}
                )
                
                # Should return 422 for validation error or 400 for bad request
                if response.status_code not in [400, 422]:
                    self.log_test("PUT /api/user-settings/{telegram_id}/notifications (invalid values)", False, 
                                f"Expected HTTP 400/422 for time={invalid_time}, got {response.status_code}")
                    return False
            
            self.log_test("PUT /api/user-settings/{telegram_id}/notifications (invalid values)", True, 
                        "Successfully rejected invalid notification time values",
                        {"tested_values": invalid_values})
            return True
            
        except Exception as e:
            self.log_test("PUT /api/user-settings/{telegram_id}/notifications (invalid values)", False, f"Exception: {str(e)}")
            return False

    def test_notification_settings_nonexistent_user(self) -> bool:
        """Test notification endpoints with non-existent user"""
        try:
            print("🔍 Testing notification endpoints with non-existent user...")
            
            nonexistent_id = 888888
            
            # Test GET notifications for non-existent user
            response = self.session.get(f"{self.base_url}/user-settings/{nonexistent_id}/notifications")
            if response.status_code != 404:
                self.log_test("Notification endpoints - Non-existent User", False, 
                            f"GET: Expected HTTP 404, got {response.status_code}")
                return False
            
            # Test PUT notifications for non-existent user
            payload = {"notifications_enabled": True, "notification_time": 10}
            response = self.session.put(
                f"{self.base_url}/user-settings/{nonexistent_id}/notifications",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            if response.status_code != 404:
                self.log_test("Notification endpoints - Non-existent User", False, 
                            f"PUT: Expected HTTP 404, got {response.status_code}")
                return False
            
            self.log_test("Notification endpoints - Non-existent User", True, 
                        "Correctly returned 404 for non-existent user on both GET and PUT")
            return True
            
        except Exception as e:
            self.log_test("Notification endpoints - Non-existent User", False, f"Exception: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all API tests in sequence"""
        print("🚀 Starting RUDN Schedule API Backend Tests")
        print(f"🌐 Backend URL: {self.base_url}")
        print(f"⏱️  Timeout: {TIMEOUT} seconds")
        print("=" * 60)
        
        # Test sequence - order matters for data dependency
        tests = [
            self.test_faculties_endpoint,
            self.test_filter_data_endpoint,
            self.test_get_groups_for_schedule,
            self.test_schedule_endpoint,
            self.test_save_user_settings,
            self.test_get_user_settings,
            self.test_get_nonexistent_user
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
                time.sleep(1)  # Small delay between tests
            except Exception as e:
                print(f"❌ Test failed with exception: {e}")
        
        print("=" * 60)
        print(f"📊 Test Results: {passed}/{total} tests passed")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
            return True
        else:
            print("⚠️  Some tests failed. Check the details above.")
            return False

def main():
    """Main test runner"""
    tester = RUDNScheduleAPITester()
    success = tester.run_all_tests()
    
    # Print summary
    print("\n" + "=" * 60)
    print("📋 DETAILED TEST SUMMARY")
    print("=" * 60)
    
    for result in tester.test_results:
        status = "✅" if result['success'] else "❌"
        print(f"{status} {result['test']}: {result['message']}")
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())