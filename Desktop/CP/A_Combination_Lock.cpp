#include<bits/stdc++.h>
using namespace std;

int main(){
  int n;
  cin>>n;
  string orignalState, tarState;
  cin>>orignalState>>tarState;
  int minMoves = 0;
  // logic
  for(int i=0;i<orignalState.size();i++){
    int num1, num2;
    num1 = orignalState[i] - '0';
    num2 = tarState[i] - '0';
    int diff = abs(num2-num1);
    minMoves += min(diff, 10-diff);
  }
  //output
  cout<<minMoves;
  
}