#include <bits/stdc++.h>
using namespace std;

int main() {
    int n, m;
    cin>>n>>m;
    bool on[m] = {false};
    for (int i = 0; i < n; i++) {
        int x;
        cin >> x;
        for (int j = 0; j < x; j++) {
            int bulb;
            cin >> bulb;
            on[bulb] = true;
        }
    }
    for(int i=1;i<=m;i++){
      if(!on[i]){
        cout<<"NO";
        return 0;
      }
    }
    cout << "YES";
    return 0;
}
