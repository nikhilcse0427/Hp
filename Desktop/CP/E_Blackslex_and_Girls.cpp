#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        long long x, y;
        cin >> n >> x >> y;

        string s;
        cin >> s;

        vector<long long> p(n);
        for (int i = 0; i < n; i++) cin >> p[i];

        long long sumA = 0, sumB = 0;

        for (int i = 0; i < n; i++) {
            long long win = (p[i] + 1) / 2;  // ceil((p+1)/2)
            long long lose = p[i] - win;

            if (s[i] == '0') {
                sumA += win;
                sumB += lose;
            } else {
                sumB += win;
                sumA += lose;
            }
        }

        if (sumA <= x && sumB <= y) {
            cout << "YES\n";
        } else {
            cout << "NO\n";
        }
    }
    return 0;
}
