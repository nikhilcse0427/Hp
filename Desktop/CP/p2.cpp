#include<bits/stdc++.h>
using namespace std;

int main(){
  long long x;
  cin>>x;
  long long minNumber = 0;
  long long place = 1;
  while(x){
    int rem = x % 10;
    if(rem > 4){
      rem = 9 - rem;
    }
    if (x < 10 && rem == 0) {
            rem = 9;
        }
    minNumber = rem*place + minNumber;
    place *= 10;
    x /= 10;
  }
  cout<<minNumber;
  return 0;
}