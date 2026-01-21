#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);

    int t;
    cin >> t;

    while (t--) {
        int n;
        cin >> n;
        vector<int> perm = {1, 0};
        for (int i = 2; i <= n; i++) {
            vector<int> next;
            for (int x : perm) {
                next.push_back((x << 1) | 1);
            }
            for (int j = perm.size() - 1; j >= 0; j--) {
                next.push_back(perm[j] << 1);
            }
            perm = move(next);
        }
        for (int i = 0; i < perm.size(); i++) {
            cout << perm[i]<<(i + 1 == perm.size() ? '\n' : ' ');
        }
    }
    return 0;
}
