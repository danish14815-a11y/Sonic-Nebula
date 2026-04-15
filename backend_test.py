import requests
import sys
from datetime import datetime

class MusicAPITester:
    def __init__(self, base_url="https://audio-portal-15.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params, timeout=15)
            elif method == 'POST':
                response = requests.post(url, json=params, headers=headers, timeout=15)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    data = response.json()
                    if isinstance(data, dict) and 'data' in data:
                        print(f"   Response has data field: {type(data['data'])}")
                    elif isinstance(data, dict) and 'status' in data:
                        print(f"   Response status: {data.get('status')}")
                except:
                    print(f"   Response length: {len(response.text)} chars")
                return True, response.json() if response.text else {}
            else:
                self.tests_passed += 1 if response.status_code in [200, 201] else 0
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")
                self.failed_tests.append({
                    'name': name,
                    'endpoint': endpoint,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'error': response.text[:200]
                })
                return False, {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Request timeout (15s)")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': 'Request timeout'
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.failed_tests.append({
                'name': name,
                'endpoint': endpoint,
                'error': str(e)
            })
            return False, {}

    def test_health(self):
        """Test health endpoint"""
        return self.run_test("Health Check", "GET", "health", 200)

    def test_trending(self):
        """Test trending endpoint"""
        return self.run_test("Get Trending", "GET", "trending", 200)

    def test_search_songs(self, query="love"):
        """Test song search"""
        return self.run_test(
            f"Search Songs - '{query}'",
            "GET",
            "search/songs",
            200,
            params={"query": query}
        )

    def test_search_albums(self, query="bollywood"):
        """Test album search"""
        return self.run_test(
            f"Search Albums - '{query}'",
            "GET",
            "search/albums",
            200,
            params={"query": query}
        )

    def test_search_artists(self, query="arijit singh"):
        """Test artist search"""
        return self.run_test(
            f"Search Artists - '{query}'",
            "GET",
            "search/artists",
            200,
            params={"query": query}
        )

    def test_search_playlists(self, query="romantic"):
        """Test playlist search"""
        return self.run_test(
            f"Search Playlists - '{query}'",
            "GET",
            "search/playlists",
            200,
            params={"query": query}
        )

    def test_get_album(self, album_id="1142502"):
        """Test get album by ID"""
        return self.run_test(
            f"Get Album - ID: {album_id}",
            "GET",
            "albums",
            200,
            params={"id": album_id}
        )

    def test_get_artist(self, artist_id="459320"):
        """Test get artist by ID"""
        return self.run_test(
            f"Get Artist - ID: {artist_id}",
            "GET",
            "artists",
            200,
            params={"id": artist_id}
        )

    def test_search_all(self, query="trending"):
        """Test general search"""
        return self.run_test(
            f"Search All - '{query}'",
            "GET",
            "search",
            200,
            params={"query": query}
        )

def main():
    print("🎵 Starting Music API Tests...")
    print("=" * 50)
    
    # Setup
    tester = MusicAPITester()

    # Run core tests
    print("\n📡 Testing Core Endpoints...")
    tester.test_health()
    tester.test_trending()

    print("\n🔍 Testing Search Endpoints...")
    tester.test_search_songs("love")
    tester.test_search_albums("bollywood")
    tester.test_search_artists("arijit singh")
    tester.test_search_playlists("romantic")
    tester.test_search_all("trending")

    print("\n📀 Testing Detail Endpoints...")
    tester.test_get_album("1142502")
    tester.test_get_artist("459320")

    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print(f"\n❌ Failed Tests ({len(tester.failed_tests)}):")
        for test in tester.failed_tests:
            print(f"  • {test['name']}: {test.get('error', 'Status code mismatch')}")
    
    success_rate = (tester.tests_passed / tester.tests_run) * 100 if tester.tests_run > 0 else 0
    print(f"\n🎯 Success Rate: {success_rate:.1f}%")
    
    return 0 if success_rate >= 80 else 1

if __name__ == "__main__":
    sys.exit(main())