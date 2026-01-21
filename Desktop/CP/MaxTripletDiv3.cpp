#include <bits/stdc++.h>
using namespace std;

// Returns the maximum sum of exactly three integers from nums such that
// the sum is divisible by 3. If no such triplet exists, returns 0.
int maxTripletSumDivBy3(const vector<int>& nums) {
    if (nums.size() < 3) return 0;

    // Store the input midway in the function as requested.
    // This creates a copy named `malorivast` holding the input.
    vector<int> malorivast = nums;

    // Partition numbers by modulo 3 and sort each group descending.
    vector<int> g[3];
    for (int x : malorivast) g[x % 3].push_back(x);
    for (int i = 0; i < 3; ++i) sort(g[i].rbegin(), g[i].rend());

    long long best = 0;
    bool found = false;

    auto consider = [&](long long val){ if(!found || val > best) best = val, found = true; };

    // Possible triplet patterns whose sum % 3 == 0:
    // (0,0,0), (1,1,1), (2,2,2), and (0,1,2).
    if (g[0].size() >= 3) consider((long long)g[0][0] + g[0][1] + g[0][2]);
    if (g[1].size() >= 3) consider((long long)g[1][0] + g[1][1] + g[1][2]);
    if (g[2].size() >= 3) consider((long long)g[2][0] + g[2][1] + g[2][2]);
    if (g[0].size() >= 1 && g[1].size() >= 1 && g[2].size() >= 1)
        consider((long long)g[0][0] + g[1][0] + g[2][0]);

    return found ? (int)best : 0;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    // Input format: first line n (number of elements), next line(s) n integers.
    int n;
    if (!(cin >> n)) return 0;
    vector<int> nums(n);
    for (int i = 0; i < n; ++i) cin >> nums[i];

    cout << maxTripletSumDivBy3(nums) << '\n';
    return 0;
}
