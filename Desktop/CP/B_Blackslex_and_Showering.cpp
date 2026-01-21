#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        vector<int> a(n);
        for (int i = 0; i < n; i++) {
            cin >> a[i];
        }
        long long S = 0;
        for (int i = 0; i + 1 < n; i++) {
            S += abs(a[i] - a[i + 1]);
        }
        long long max_gain = 0;
        max_gain = max(max_gain, (long long)abs(a[0] - a[1]));
        max_gain = max(max_gain, (long long)abs(a[n - 2] - a[n - 1]));

        for (int k = 1; k + 1 < n; k++) {
            long long gain =
                abs(a[k-1] - a[k]) +
                abs(a[k]-a[k + 1]) -
                abs(a[k-1]-a[k+1]);
            max_gain = max(max_gain, gain);
        }

        cout << S - max_gain << '\n';
    }
    return 0;
}
