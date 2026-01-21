#include <iostream>
#include <climits>
using namespace std;

int main() {
    int n, t;
    cin >> n;   // number of bus routes
    cin >> t;   // time of visit

    int route = 0;
    int bestTime = INT_MAX;
    for (int i = 0; i < n; i++) {
        int s, d;
        cin >> s >> d;
        int arrival;
        if(s >= t) {
          arrival = s;
        }else {
          int k = (t - s + d - 1)/d;
          arrival = s + k * d;
        }
        if(arrival < bestTime) {
          bestTime = arrival;
          route = i + 1;
        }
    }

    cout << route;
    return 0;
}
