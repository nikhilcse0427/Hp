#include <bits/stdc++.h>
#include <bits/stdc++.h>
using namespace std;

int main() {
    int t;
    cin >> t;
    while (t--) {
        int n;
        cin >> n;
        vector<long long> a(n);
        for (int i = 0; i < n; i++) cin >> a[i];

        sort(a.begin(), a.end());

        long long m = a[0];
        long long s = a[1];

        cout << max(m, s - 1) << '\n';
    }
    return 0;
}
