#include<bits/stdc++.h>
using namespace std;

int main(){
  int n, k, l, c, d, p, nl, np;
  cin>>n>>k>>l>>c>>d>>p>>nl>>np;
  int totalDrink = k*l;
  int totalSlices = c*d;
  int totalSalt = p;
  int numOfToastUsingDrink = totalDrink/nl;
  int numOfToastUsingSalt = totalSalt/np;
  int numOfToastUsingSlice = totalSlices;

  int numOfToastEach = min(numOfToastUsingDrink, min(numOfToastUsingSalt, numOfToastUsingSlice))/n;
  cout<<numOfToastEach;

  return 0;
}